import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRecipe, parseModelRecipe, scaleIngredients, shoppingList } from '../shared/recipe.js';
import { validateLibrary, emptyLibrary, weekDates } from '../src/utils/library.js';
import { createRequestGate, requestRecipe } from '../src/services/ai.js';
export const recipe = { title:'Tomato rice', description:'A simple lunch.', servings:2, minutes:20, ingredients:[{ name:'Rice', quantity:100, unit:'g', note:'' }, { name:'Salt', quantity:null, unit:'', note:'to taste' }], steps:[{ text:'Cook rice in water, then season.', timerSeconds:600 }] };
test('valid JSON and a single JSON fence are accepted', () => {
  assert.deepEqual(parseModelRecipe(JSON.stringify(recipe)), recipe);
  assert.deepEqual(parseModelRecipe('```json\n'+JSON.stringify(recipe)+'\n```'), recipe);
});
test('empty, malformed, truncated, prose-wrapped and wrong-shaped model output are rejected', () => {
  for (const input of ['', 'null', '[]', '{bad}', '{"title":"Rice"}', 'Here is JSON: '+JSON.stringify(recipe), JSON.stringify({ ...recipe, ingredients: [] }), JSON.stringify({ ...recipe, steps:[{ text:'Cook', timerSeconds:-1 }] })]) assert.throws(() => parseModelRecipe(input));
});
test('numeric strings, null ingredients, zero servings and nonfinite numbers are rejected', () => {
  for (const invalid of [{...recipe,servings:0},{...recipe,servings:'2'},{...recipe,ingredients:[null]},{...recipe,minutes:Infinity},{...recipe,ingredients:[{...recipe.ingredients[0],quantity:-1}]}]) assert.throws(() => validateRecipe(invalid));
});
test('serving scaling is reversible and does not mutate base amounts or to-taste quantities', () => {
  assert.equal(scaleIngredients(recipe, 4)[0].quantity, 200);
  assert.equal(scaleIngredients(recipe, 1)[0].quantity, 50);
  assert.equal(scaleIngredients(recipe, 4)[1].quantity, null);
  assert.equal(recipe.ingredients[0].quantity, 100);
});
test('shopping list sums matching units but never combines grams with cups', () => {
  const other = { ...recipe, id:'b', ingredients:[{ name:'rice', quantity:1, unit:'cup', note:'' }] };
  const list = shoppingList([{ recipeId:'a',servings:4 },{ recipeId:'a',servings:2 },{ recipeId:'b',servings:2 }], [{...recipe,id:'a'},other]);
  assert.equal(list.find(i => i.unit === 'g').quantity, 300);
  assert.equal(list.find(i => i.unit === 'cup').quantity, 1);
  assert.equal(list.filter(i => i.name === 'Salt').length, 1);
});
test('backups reject broken recipes and plans without replacing valid state', () => {
  assert.throws(() => validateLibrary({ ...emptyLibrary, recipes:[{...recipe,id:'a',ingredients:[]}] }));
  assert.throws(() => validateLibrary({ ...emptyLibrary, plan:[{ recipeId:'missing' }] }));
  const restored = validateLibrary({ ...emptyLibrary, recipes:[{ ...recipe,id:'a',source:'ai',sourceUrl:'javascript:alert(1)' }] });
  assert.equal(restored.recipes[0].sourceUrl,'');
  assert.equal(restored.recipes[0].source,'ai');
});
test('weekly dates are seven consecutive local calendar dates', () => {
  const week = weekDates(); assert.equal(week.length,7); assert.equal(new Date(week[0]+'T12:00:00').getDay(),1); assert.equal(new Date(week[6]+'T12:00:00').getDay(),0);
});
test('request sequence rejects older completions even if cancellation is ignored', () => {
  const gate = createRequestGate(); const first=gate.next(); const second=gate.next();
  assert.equal(gate.current(first),false); assert.equal(gate.current(second),true); gate.cancel(); assert.equal(gate.current(second),false);
});
test('browser client validates successful HTTP responses instead of trusting the server', async t => {
  t.mock.method(globalThis,'fetch',async () => new Response(JSON.stringify({recipe:{title:'bad'}}),{status:200}));
  await assert.rejects(requestRecipe({prompt:'rice'},new AbortController().signal));
});
