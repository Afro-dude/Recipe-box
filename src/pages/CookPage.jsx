import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useGenerate } from '../hooks/useGenerate';
export default function CookPage() {
  const { state, update, saveRecipe } = useLibrary();
  const { run, loading, error, cancel } = useGenerate();
  const navigate = useNavigate();
  const [configured, setConfigured] = useState(null);
  useEffect(() => { const c = new AbortController(); fetch('/api/status', { signal: c.signal }).then(r => r.json()).then(d => setConfigured(d.configured)).catch(() => {}); return () => c.abort(); }, []);
  async function submit(e) {
    e.preventDefault();
    const recipe = await run({ prompt: state.draft });
    if (recipe) { const id = saveRecipe({ ...recipe, source: 'ai' }); navigate(`/box/${id}`); }
  }
  return <main id="main" className="sheet cook-page"><div className="section-kicker">FROM YOUR FRIDGE, TO YOUR TABLE</div><h2 className="page-title">What’s in your kitchen?</h2><p className="intro">A few ingredients. A little inspiration. A recipe made around you.</p>
    <div className="cook-layout"><form onSubmit={submit}><label htmlFor="pantry">Ingredients, cravings & preferences</label><textarea id="pantry" className="pantry-input" required minLength={3} maxLength={4000} disabled={loading} value={state.draft} placeholder="I have rice, tomatoes, onions and eggs. Dinner for two, in about 20 minutes. Something spicy, please." onChange={e => update(s => ({ ...s, draft: e.target.value }))} />
      <p className="hint">Include servings, cuisine, time and anything you want to avoid.</p>
      <div className="suggestions">{['South Indian breakfast with oats, no eggs, for two in 20 minutes.', 'Chickpeas, spinach and tomatoes. A one-pot dinner for four.', 'Leftover rice, eggs and spring onions. A quick lunch for two.'].map((prompt, i) => <button type="button" disabled={loading} key={prompt} onClick={() => update(s => ({ ...s, draft: prompt }))}>{['Oats, with a twist', 'One-pot comfort', 'Use the leftovers'][i]} ↗</button>)}</div>
      <div className="actions"><button className="button" disabled={loading}>{loading ? 'Writing your recipe…' : error ? 'Try again' : 'Create my recipe →'}</button>{loading && <button type="button" className="button secondary" onClick={cancel}>Cancel</button>}</div>
      {loading && <p role="status" className="hint">Usually a few seconds. You can cancel; your ingredient list stays here.</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </form><aside className="kitchen-note"><span className="note-number">01 / THE KITCHEN NOTE</span><h3>Your ingredients.<br/>New possibilities.</h3><p>Adjust portions, ask for a swap, and check off each step as you cook.</p><p>Recipes save automatically to your box, on this browser.</p><p className="hint">AI recipes are suggestions, not tested recipes. Check ingredients and cooking instructions before you begin.</p><Link to="/new">Prefer your own recipe? Add a card →</Link></aside></div>
    {configured === false && <p className="notice">OpenAI isn’t configured on this server yet. Follow the README to add your API key. You can already explore recipes, add your own, and plan meals.</p>}
  </main>;
}
