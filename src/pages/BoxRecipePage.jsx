import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useGenerate } from '../hooks/useGenerate';
import { amount, scaleIngredients } from '../../shared/recipe';
export default function BoxRecipePage() {
  const { id } = useParams();
  return <RecipeWorkspace key={id} id={id} />;
}
function RecipeWorkspace({ id }) {
  const { state, update, saveRecipe, patchRecipe, removeRecipe } = useLibrary();
  const recipe = state.recipes.find(r => r.id === id);
  const navigate = useNavigate();
  const ai = useGenerate();
  const [request, setRequest] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);
  if (!recipe) return <main id="main" className="sheet"><h2>This card isn’t in this browser’s box.</h2><Link to="/saved">Back to your recipes</Link></main>;
  const progress = state.progress[id] || { servings: recipe.servings, done: [] };
  const ingredients = scaleIngredients(recipe, progress.servings);
  const setProgress = patch => update(s => ({ ...s, progress: { ...s.progress, [id]: { ...(s.progress[id] || progress), ...patch } } }));
  const toggleStep = index => setProgress({ done: progress.done.includes(index) ? progress.done.filter(i => i !== index) : [...progress.done, index] });
  function startTimer(step, index) {
    const timerId = `${id}-${index}`;
    update(s => ({ ...s, timers: [...s.timers.filter(t => t.id !== timerId), { id: timerId, recipeId: id, label: `${recipe.title.slice(0,80)} · step ${index+1}`, endsAt: Date.now()+step.timerSeconds*1000 }] }));
  }
  async function refine(event) { event.preventDefault(); const next = await ai.run({ prompt: request, recipe }); if (next) setCandidate(next); }
  return <main id="main" className="sheet"><Link className="backlink" to="/saved">← Your recipe box</Link>
    <article><div className="recipe-heading"><div><span className="section-kicker">{recipe.source === 'ai' ? 'AI SUGGESTION · NOT TESTED' : recipe.source === 'mealdb' ? 'FROM THEMEALDB' : 'FROM YOUR KITCHEN'}</span><h2 className="page-title">{recipe.title}</h2><p className="intro">{recipe.description}</p><p className="recipe-meta">{recipe.minutes ? `${recipe.minutes} min · ` : ''}{recipe.ingredients.length} ingredients · {recipe.steps.length} steps</p></div>{recipe.image && <img className="detail-photo" src={recipe.image} alt={recipe.title} />}</div>
    <div className="actions"><button className="button secondary" onClick={() => patchRecipe(id, { favorite: !recipe.favorite })} aria-pressed={Boolean(recipe.favorite)}>{recipe.favorite ? '★ Favorite' : '☆ Favorite'}</button><Link className="button secondary" to={`/edit/${id}`}>Edit recipe</Link><Link className="button secondary" to={`/plan?recipe=${id}`}>Add to meal plan</Link><button className="text-button" onClick={() => window.print()}>Print</button></div>
    <div className="recipe-columns"><section><div className="section-head"><h3>Ingredients</h3><label className="serving-control">Servings<select value={progress.servings} onChange={e => setProgress({ servings: Number(e.target.value) })}>{Array.from({ length:24 }, (_, i) => <option key={i+1}>{i+1}</option>)}</select></label></div><p className="hint">Base recipe: {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}. Times do not scale with portions.</p>
      <ul className="ingredient-list">{ingredients.map((item, i) => <li key={i}><strong>{amount(item)}</strong><span>{item.name}{item.note && <small>{item.note}</small>}</span><button className="text-button" onClick={() => { setRequest(`Replace ${item.name} with a suitable alternative. Update the ingredients and all affected cooking steps.`); document.getElementById('refinement').focus(); }}>Swap<span className="sr-only"> {item.name}</span></button></li>)}</ul>
    </section><section><div className="section-head"><h3>Let’s cook</h3><span className="hint">{progress.done.length}/{recipe.steps.length} complete</span></div><progress aria-label="Cooking progress" max={recipe.steps.length} value={progress.done.length} />
      <ol className="cooking-steps">{recipe.steps.map((step, index) => <li className={progress.done.includes(index) ? 'is-done' : ''} key={index}><label><input type="checkbox" checked={progress.done.includes(index)} onChange={() => toggleStep(index)} /><span><b>STEP {String(index+1).padStart(2,'0')}</b>{step.text}</span></label>{step.timerSeconds > 0 && <button className="button timer-button" onClick={() => startTimer(step,index)}>{state.timers.some(t => t.id === `${id}-${index}`) ? 'Restart' : 'Start'} {Math.round(step.timerSeconds/60*10)/10} min timer</button>}</li>)}</ol>
      <button className="text-button" onClick={() => setProgress({ done: [] })}>Reset checklist</button><p className="hint">Progress restores after a refresh. Timer alerts appear while the app is open; elapsed timers are shown when you return.</p>
    </section></div>
    <section className="refine-panel"><h3>A little change?</h3><p>Ask for a substitution or a new twist. Review the new recipe before applying it.</p><form onSubmit={refine}><label htmlFor="refinement">Your change</label><div className="inline-form"><input id="refinement" required minLength={3} maxLength={4000} value={request} disabled={ai.loading} onChange={e => setRequest(e.target.value)} placeholder="Swap the cream for coconut milk…" /><button className="button" disabled={ai.loading}>{ai.loading ? 'Working…' : ai.error ? 'Retry change' : 'Suggest change'}</button>{ai.loading && <button type="button" className="button secondary" onClick={ai.cancel}>Cancel</button>}</div></form>{ai.error && <p role="alert" className="error">{ai.error}</p>}
      {candidate && <div className="candidate" role="region" aria-label="Suggested recipe revision"><h4>{candidate.title}</h4><p>{candidate.description}</p><p>{candidate.servings} servings · {candidate.minutes} minutes</p><ul>{candidate.ingredients.map((i,n) => <li key={n}>{amount(i)} {i.name} {i.note}</li>)}</ul><ol>{candidate.steps.map((s,i) => <li key={i}>{s.text}</li>)}</ol><p className="hint">Applying resets the checklist, serving selection and timers. Your notes are kept.</p><div className="actions"><button className="button" disabled={ai.loading} onClick={() => { saveRecipe({ ...recipe, ...candidate, source: 'ai' }); update(s => ({ ...s, progress: { ...s.progress, [id]: { servings: candidate.servings, done: [] } }, timers: s.timers.filter(t => t.recipeId !== id) })); setCandidate(null); }}>Apply revision</button><button className="button secondary" onClick={() => setCandidate(null)}>Discard suggestion</button></div></div>}
    </section>
    <section className="notes-panel"><h3>Notes from your kitchen</h3><div className="form-row"><label className="check-label"><input type="checkbox" checked={Boolean(recipe.cooked)} onChange={e => patchRecipe(id, { cooked: e.target.checked })} />I’ve cooked this</label><label>Your rating<select value={recipe.rating || 0} onChange={e => patchRecipe(id, { rating: Number(e.target.value) })}><option value="0">Not rated</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label><label>Collection<input maxLength={80} value={recipe.collection || ''} onChange={e => patchRecipe(id, { collection: e.target.value })} placeholder="Weeknight favorites" /></label></div><label>What would you do differently next time?<textarea maxLength={5000} value={recipe.notes || ''} onChange={e => patchRecipe(id, { notes: e.target.value })} placeholder="A little more lemon, a little less heat…" /></label><p className="hint">Notes save automatically on this browser.</p></section>
    {recipe.sourceUrl && <a className="sourcelink" href={recipe.sourceUrl} target="_blank" rel="noreferrer">Original recipe source ↗</a>}
    <div className="delete-row">{deleting ? <><p>Remove this recipe and its meal-plan entries from this browser?</p><button className="button danger" onClick={() => { removeRecipe(id); navigate('/saved'); }}>Remove recipe</button><button className="text-button" onClick={() => setDeleting(false)}>Keep it</button></> : <button className="text-button" onClick={() => setDeleting(true)}>Remove from my box</button>}</div>
    </article></main>;
}
