import { validateRecipe } from '../../shared/recipe.js';
export const emptyLibrary = { version: 1, recipes: [], plan: [], progress: {}, timers: [], checked: {}, draft: '' };
const object = v => v && typeof v === 'object' && !Array.isArray(v);
export function validateLibrary(data) {
  if (!object(data) || data.version !== 1 || !Array.isArray(data.recipes) || data.recipes.length > 1000 || !Array.isArray(data.plan) || data.plan.length > 1000) throw new Error('This is not a valid Recipe Box backup.');
  const ids = new Set();
  const recipes = data.recipes.map(r => {
    const recipe = validateRecipe(r);
    if (typeof r.id !== 'string' || !/^[\w-]{1,100}$/.test(r.id) || ['__proto__','constructor','prototype'].includes(r.id) || ids.has(r.id)) throw new Error('Invalid or duplicate recipe ID.');
    ids.add(r.id);
    return { ...recipe, id: r.id, source: ['ai', 'manual', 'mealdb'].includes(r.source) ? r.source : 'manual',
      image: typeof r.image === 'string' && /^https:\/\/www\.themealdb\.com\//.test(r.image) ? r.image : '',
      sourceUrl: typeof r.sourceUrl === 'string' && /^https?:\/\//.test(r.sourceUrl) ? r.sourceUrl : '',
      notes: typeof r.notes === 'string' ? r.notes.slice(0, 5000) : '', rating: Number.isInteger(r.rating) && r.rating >= 0 && r.rating <= 5 ? r.rating : 0,
      favorite: Boolean(r.favorite), cooked: Boolean(r.cooked), collection: typeof r.collection === 'string' ? r.collection.slice(0, 80) : '',
    };
  });
  const planIds = new Set();
  const plan = data.plan.map(p => {
    if (!object(p) || typeof p.id !== 'string' || !/^[\w-]{1,100}$/.test(p.id) || !ids.has(p.recipeId) || !/^\d{4}-\d{2}-\d{2}$/.test(p.date) || !['Breakfast','Lunch','Dinner'].includes(p.slot) || !Number.isInteger(p.servings) || p.servings < 1 || p.servings > 24) throw new Error('A meal-plan entry is invalid.');
    const parsedDate = new Date(p.date + 'T12:00:00Z');
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0,10) !== p.date || planIds.has(p.id)) throw new Error('Invalid date or duplicate meal-plan entry.');
    planIds.add(p.id);
    return { id: p.id, recipeId: p.recipeId, date: p.date, slot: p.slot, servings: p.servings };
  });
  const progress = {};
  if (object(data.progress)) for (const r of recipes) {
    const p = data.progress[r.id];
    if (object(p)) progress[r.id] = { servings: Number.isInteger(p.servings) && p.servings >= 1 && p.servings <= 24 ? p.servings : r.servings,
      done: Array.isArray(p.done) ? p.done.filter(i => Number.isInteger(i) && i >= 0 && i < r.steps.length) : [] };
  }
  const timers = Array.isArray(data.timers) ? data.timers.filter(t => object(t) && typeof t.id === 'string' && ids.has(t.recipeId) && typeof t.label === 'string' && t.label.length < 200 && Number.isFinite(t.endsAt)).slice(0, 100) : [];
  const checked = object(data.checked) ? Object.fromEntries(Object.entries(data.checked).filter(([k,v]) => k.length < 500 && typeof v === 'boolean')) : {};
  return { version: 1, recipes, plan, progress, timers, checked, draft: typeof data.draft === 'string' ? data.draft.slice(0, 4000) : '' };
}
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function weekDates(offset = 0) {
  const date = new Date();
  date.setHours(12,0,0,0);
  date.setDate(date.getDate() - (date.getDay()+6)%7 + offset*7);
  return Array.from({ length: 7 }, (_, i) => { const day = new Date(date); day.setDate(day.getDate()+i); return dateKey(day); });
}
