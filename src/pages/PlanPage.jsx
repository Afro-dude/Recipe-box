import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { dateKey, weekDates } from '../utils/library';
import { amount, shoppingList } from '../../shared/recipe';
export default function PlanPage() {
  const { state, update } = useLibrary();
  const [params] = useSearchParams();
  const [offset, setOffset] = useState(0);
  const [recipeId, setRecipeId] = useState(params.get('recipe') || state.recipes[0]?.id || '');
  const [date, setDate] = useState(dateKey(new Date()));
  const [slot, setSlot] = useState('Dinner');
  const [servings, setServings] = useState(state.recipes.find(r => r.id === recipeId)?.servings || 2);
  const [notice, setNotice] = useState('');
  const dates = weekDates(offset);
  const entries = state.plan.filter(p => dates.includes(p.date));
  const list = shoppingList(entries, state.recipes);
  function add(e) {
    e.preventDefault();
    if (!state.recipes.some(r => r.id === recipeId)) return;
    update(s => ({ ...s, plan: [...s.plan, { id: crypto.randomUUID(), recipeId, date, slot, servings }] }));
    // Show the week containing the newly added date.
    const start = new Date(`${weekDates(0)[0]}T12:00:00`);
    setOffset(Math.floor((new Date(`${date}T12:00:00`) - start)/86400000/7));
    setNotice(`Added to ${slot.toLowerCase()} on ${date}.`);
  }
  async function copy() {
    const content = list.map(i => `${state.checked[`${dates[0]}|${i.key}|${i.quantity}`] ? '[x]' : '[ ]'} ${amount(i)} ${i.name}${i.note ? ` (${i.note})` : ''}`).join('\n');
    try { await navigator.clipboard.writeText(content); setNotice('Shopping list copied.'); } catch { setNotice('Clipboard unavailable. Use Print to save the list.'); }
  }
  return <main id="main" className="sheet"><div className="section-kicker">A LITTLE PLANNING, A BETTER WEEK</div><h2 className="page-title">What’s on the menu?</h2><p className="intro">Plan from your saved recipes. We’ll gather the ingredients.</p>
    {state.recipes.length ? <form className="plan-form" onSubmit={add}><label>Recipe<select required value={recipeId} onChange={e => { setRecipeId(e.target.value); setServings(state.recipes.find(r => r.id === e.target.value)?.servings || 2); }}><option value="">Choose a recipe</option>{state.recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label><label>Day<input type="date" required value={date} onChange={e => setDate(e.target.value)} /></label><label>Meal<select value={slot} onChange={e => setSlot(e.target.value)}>{['Breakfast','Lunch','Dinner'].map(s => <option key={s}>{s}</option>)}</select></label><label>Servings<input type="number" min="1" max="24" required value={servings} onChange={e => setServings(Number(e.target.value))} /></label><button className="button">+ Add meal</button></form> : <p className="notice">Save or create your first recipe to start planning. <Link to="/cook">Create a recipe →</Link></p>}
    <p className="hint" role="status">{notice}</p><div className="section-head"><button className="button secondary" onClick={() => setOffset(n => n-1)}>← Previous</button><h3>Week of {new Date(`${dates[0]}T12:00:00`).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' })}</h3><button className="button secondary" onClick={() => setOffset(n => n+1)}>Next →</button></div>
    <div className="week-grid">{dates.map(day => <section className={`day-card ${day === dateKey(new Date()) ? 'today' : ''}`} key={day}><h4>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday:'short', day:'numeric' })}</h4>{['Breakfast','Lunch','Dinner'].map(meal => <div className="meal-slot" key={meal}><span>{meal}</span>{entries.filter(p => p.date === day && p.slot === meal).map(p => <div className="planned-meal" key={p.id}><Link to={`/box/${p.recipeId}`}>{state.recipes.find(r => r.id === p.recipeId)?.title}</Link><small>{p.servings} servings</small><button className="text-button" aria-label={`Remove ${state.recipes.find(r => r.id === p.recipeId)?.title} from ${day} ${meal}`} onClick={() => update(s => ({ ...s, plan: s.plan.filter(item => item.id !== p.id) }))}>Remove</button></div>)}</div>)}</section>)}</div>
    <section className="shopping-panel"><div className="section-head"><div><h3>Your shopping list</h3><p className="hint">For the displayed week. Matching ingredients and units are combined; different units stay separate.</p></div><div className="actions"><button disabled={!list.length} className="button secondary" onClick={copy}>Copy list</button><button className="text-button" onClick={() => window.print()}>Print</button></div></div>{list.length ? <ul className="shopping-list">{list.map(item => { const key = `${dates[0]}|${item.key}|${item.quantity}`; return <li key={item.key}><label><input type="checkbox" checked={Boolean(state.checked[key])} onChange={e => update(s => ({ ...s, checked: { ...s.checked, [key]: e.target.checked } }))} /><span><strong>{amount(item)}</strong> {item.name}{item.note && <small>{item.note}</small>}</span></label></li>; })}</ul> : <p>Add meals to this week to build your shopping list.</p>}</section>
  </main>;
}
