const text = (v, max = 2000) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const number = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;
// Shared runtime validation: model output, API responses, manual recipes and backups.
export function validateRecipe(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('The recipe must be an object.');
  if (!text(v.title, 160) || typeof v.description !== 'string' || v.description.length > 2000) throw new Error('The recipe needs a title and description.');
  if (!Number.isInteger(v.servings) || !number(v.servings, 1, 24)) throw new Error('Servings must be a whole number from 1 to 24.');
  if (!number(v.minutes, 0, 1440)) throw new Error('Cooking time is invalid.');
  if (!Array.isArray(v.ingredients) || v.ingredients.length < 1 || v.ingredients.length > 60) throw new Error('The recipe needs 1–60 ingredients.');
  const ingredients = v.ingredients.map(i => {
    if (!i || !text(i.name, 160) || !(i.quantity === null || number(i.quantity, 0.001, 100000)) || typeof i.unit !== 'string' || i.unit.length > 80 || typeof i.note !== 'string' || i.note.length > 500) throw new Error('An ingredient has an invalid name, quantity or unit.');
    return { name: i.name.trim(), quantity: i.quantity, unit: i.unit.trim(), note: i.note.trim() };
  });
  if (!Array.isArray(v.steps) || v.steps.length < 1 || v.steps.length > 40) throw new Error('The recipe needs 1–40 steps.');
  const steps = v.steps.map(s => {
    if (!s || !text(s.text) || !Number.isInteger(s.timerSeconds) || !number(s.timerSeconds, 0, 86400)) throw new Error('A cooking step or timer is invalid.');
    return { text: s.text.trim(), timerSeconds: s.timerSeconds };
  });
  return { title: v.title.trim(), description: v.description.trim(), servings: v.servings, minutes: v.minutes, ingredients, steps };
}
export function parseModelRecipe(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('The model returned an empty recipe. Please retry.');
  const clean = raw.trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1');
  let parsed;
  try { parsed = JSON.parse(clean); } catch { throw new Error('The model returned unreadable JSON. Please retry.'); }
  return validateRecipe(parsed);
}
export const recipeSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    title: { type: 'string' }, description: { type: 'string' }, servings: { type: 'integer' }, minutes: { type: 'number' },
    ingredients: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, quantity: { type: ['number', 'null'] }, unit: { type: 'string' }, note: { type: 'string' } }, required: ['name', 'quantity', 'unit', 'note'] } },
    steps: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { text: { type: 'string' }, timerSeconds: { type: 'integer' } }, required: ['text', 'timerSeconds'] } },
  }, required: ['title', 'description', 'servings', 'minutes', 'ingredients', 'steps'],
};
export function scaleIngredients(recipe, servings) {
  return recipe.ingredients.map(i => ({ ...i, quantity: i.quantity === null ? null : Math.round(i.quantity * servings / recipe.servings * 1000) / 1000 }));
}
export function amount(i) {
  return [i.quantity === null ? '' : new Intl.NumberFormat('en', { maximumFractionDigits: 3 }).format(i.quantity), i.unit].filter(Boolean).join(' ') || 'As needed';
}
export function shoppingList(entries, recipes) {
  const result = new Map();
  for (const entry of entries) {
    const recipe = recipes.find(r => r.id === entry.recipeId);
    if (!recipe) continue;
    for (const i of scaleIngredients(recipe, entry.servings)) {
      const key = `${i.name.trim().toLowerCase()}|${i.unit.trim().toLowerCase()}|${i.quantity === null ? i.note : 'numeric'}`;
      const previous = result.get(key);
      if (previous && i.quantity !== null) previous.quantity = Math.round((previous.quantity + i.quantity) * 1000) / 1000;
      else if (!previous) result.set(key, { ...i, key });
    }
  }
  return [...result.values()].sort((a, b) => a.name.localeCompare(b.name));
}
