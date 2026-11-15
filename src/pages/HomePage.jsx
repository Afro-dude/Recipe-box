import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../services/mealApi';
import RecipeGrid from '../components/RecipeGrid';
import SkeletonGrid from '../components/SkeletonGrid';
export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const mode = ['name','category','cuisine','ingredient'].includes(params.get('mode')) ? params.get('mode') : 'category';
  const query = params.get('q') || (mode === 'category' ? 'Vegetarian' : '');
  const [input, setInput] = useState(query);
  const [options, setOptions] = useState({ category: [], cuisine: [], ingredient: [] });
  const [optionError, setOptionError] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [randomLoading, setRandomLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => setInput(query), [query, mode]);
  useEffect(() => {
    const c = new AbortController();
    Promise.all([api.listOptions('c', { signal:c.signal }),api.listOptions('a', { signal:c.signal }),api.listOptions('i', { signal:c.signal })]).then(([categories,areas,ingredients]) => {
      if (c.signal.aborted) return;
      setOptions({ category:[...new Set(categories.map(r => r.strCategory).filter(Boolean))].sort(), cuisine:[...new Set(areas.map(r => r.strArea).filter(Boolean))].sort(), ingredient:[...new Set(ingredients.map(r => r.strIngredient).filter(Boolean))].sort() }); setOptionError('');
    }).catch(() => { if (!c.signal.aborted) setOptionError('Filter suggestions could not load. You can still type a category, cuisine or ingredient.'); });
    return () => c.abort();
  }, [retry]);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true); setError('');
    api.discover(mode, query, { signal:c.signal }).then(rows => { if (!c.signal.aborted) { setMeals(rows.filter(r => r && typeof r.idMeal === 'string' && typeof r.strMeal === 'string')); setLoading(false); } }).catch(e => { if (!c.signal.aborted) { setError(e.name === 'TimeoutError' ? 'The recipe service took too long. Please retry.' : e.message); setLoading(false); } });
    return () => c.abort();
  }, [mode, query, retry]);
  async function surprise() { setRandomLoading(true); try { const meal = await api.randomMeal(); if (meal) navigate('/recipe/' + meal.idMeal); else setError('No surprise recipe returned. Try again.'); } catch(e) { setError(e.message); } finally { setRandomLoading(false); } }
  return <main id="main" className="sheet"><div className="explore-intro"><div><div className="section-kicker">GOOD FOOD STARTS WITH CURIOSITY</div><h2 className="page-title">Find your next favorite.</h2><p className="intro">Across cuisines, pantry staples, and whatever sounds good today.</p></div><button className="button secondary" disabled={randomLoading} onClick={surprise}>{randomLoading ? 'Finding a recipe…' : 'Surprise me ↗'}</button></div>
    <form className="discovery-form" onSubmit={e => { e.preventDefault(); setParams({ mode, q: input.trim() }); }}><label>Explore by<select value={mode} onChange={e => { const m=e.target.value; setParams({ mode:m, q: m === 'category' ? 'Vegetarian' : m === 'cuisine' ? (options.cuisine.find(c => /^(india|indian)$/i.test(c)) || options.cuisine[0] || '') : m === 'ingredient' ? 'chicken' : '' }); }}>{[['name','Recipe name'],['category','Category'],['cuisine','Cuisine / region'],['ingredient','Main ingredient']].map(([v,l]) => <option value={v} key={v}>{l}</option>)}</select></label><label>{mode === 'name' ? 'Recipe name' : mode === 'ingredient' ? 'One main ingredient' : mode === 'cuisine' ? 'Cuisine / region' : 'Category'}<input list="discovery-options" value={input} onChange={e => setInput(e.target.value)} placeholder="What sounds good?" /><datalist id="discovery-options">{(options[mode] || []).map(o => <option value={o} key={o} />)}</datalist></label><button className="button">Find recipes</button></form>
    {optionError && <p className="hint">{optionError}</p>}
    <div className="category-chips" aria-label="Quick categories">{options.category.map(category => <button key={category} aria-pressed={mode === 'category' && query === category} onClick={() => setParams({ mode:'category', q:category })}>{category}</button>)}</div>
    <div className="section-head"><h3>{query ? query + ' recipes' : 'Recipe inspiration'}</h3><span className="hint">{!loading && !error ? meals.length + ' recipes · TheMealDB' : ''}</span></div>
    {loading ? <SkeletonGrid /> : error ? <div className="state"><p role="alert">{error}</p><button className="button" onClick={() => setRetry(n => n+1)}>Retry</button></div> : meals.length ? <RecipeGrid meals={meals} fallbackTag={query} /> : <div className="state"><h3>No cards filed here yet.</h3><p>Try a different search, or create something with your ingredients.</p><Link className="button" to="/cook">Create a recipe →</Link></div>}
    <aside className="explore-banner"><div><h3>Something in your fridge?</h3><p>Turn what you have into a new recipe with AI.</p></div><Link className="button" to="/cook">Cook with my ingredients →</Link></aside>
  </main>;
}
