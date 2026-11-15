import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { validateLibrary } from '../utils/library';
import LibraryCard from '../components/LibraryCard';
import RecipeGrid from '../components/RecipeGrid';
export default function SavedPage() {
  const { state, update } = useLibrary();
  const { saved } = useSavedRecipes();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [collection, setCollection] = useState('');
  const [notice, setNotice] = useState('');
  const recipes = state.recipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || filter === 'favorite' && r.favorite || filter === 'cooked' && r.cooked || r.source === filter) && (!collection || r.collection === collection));
  const legacy = saved.filter(r => !state.recipes.some(item => item.id === 'meal-' + r.idMeal));
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'recipe-box-backup.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 5000000) throw new Error('Please choose a backup smaller than 5 MB.');
      const incoming = validateLibrary(JSON.parse(await file.text()));
      // Merge by ID, preserving existing recipes and cooking state. Never erase a box on import.
      update(s => ({ ...s, recipes: [...s.recipes, ...incoming.recipes.filter(r => !s.recipes.some(old => old.id === r.id))],
        plan: [...s.plan, ...incoming.plan.filter(p => !s.plan.some(old => old.id === p.id))],
        progress: { ...incoming.progress, ...s.progress }, timers: [...s.timers, ...incoming.timers.filter(t => !s.timers.some(old => old.id === t.id))], checked: { ...incoming.checked, ...s.checked }, draft: s.draft || incoming.draft }));
      setNotice('Backup imported. Existing cards were kept; new cards and meal-plan entries were added.');
    } catch (e) { setNotice(e.message); }
  }
  return <main id="main" className="sheet"><div className="section-head"><div><div className="section-kicker">COLLECTED, COOKED, MADE YOUR OWN</div><h2 className="page-title">Your recipe box</h2></div><Link className="button" to="/new">+ Write a recipe</Link></div>
    <div className="library-filters"><label>Find a saved recipe<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your cards…" /></label><label>Show<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All recipes</option><option value="favorite">Favorites</option><option value="cooked">Cooked before</option><option value="ai">AI suggestions</option><option value="manual">Your recipes</option><option value="mealdb">TheMealDB</option></select></label><label>Collection<select value={collection} onChange={e => setCollection(e.target.value)}><option value="">All collections</option>{[...new Set(state.recipes.map(r => r.collection).filter(Boolean))].map(c => <option key={c}>{c}</option>)}</select></label></div>
    <p className="hint">{recipes.length} cards · Stored on this browser</p>
    {recipes.length ? <div className="grid">{recipes.map(r => <LibraryCard key={r.id} recipe={r} />)}</div> : <div className="state"><h3>{state.recipes.length ? 'No matching cards' : 'Make room for your next favorite'}</h3><p>Save an explored recipe, create one from your ingredients, or write your own.</p><Link className="button" to="/cook">Cook with my ingredients</Link></div>}
    {legacy.length > 0 && <section className="legacy"><h3>Previously saved bookmarks</h3><p className="hint">Open a bookmark and save the full recipe to use cooking mode and meal planning.</p><RecipeGrid meals={legacy} fallbackTag="Bookmark" /></section>}
    <section className="backup-panel"><h3>A box worth keeping</h3><p>No account needed. Export a backup before clearing browser data, or import it on another device.</p><div className="actions"><button className="button secondary" onClick={download}>Export backup</button><label className="file-label">Import backup<input type="file" accept=".json,application/json" onChange={restore} /></label></div><p className="hint" role="status">{notice}</p></section>
  </main>;
}
