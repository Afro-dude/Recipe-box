import { useState } from 'react';
import { validateRecipe } from '../../shared/recipe';
const blank = { title: '', description: '', servings: 2, minutes: 20, ingredients: [{ name: '', quantity: 1, unit: '', note: '' }], steps: [{ text: '', timerSeconds: 0 }] };
export default function RecipeEditor({ initial, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial || blank);
  const [error, setError] = useState('');
  const field = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const changeItem = (kind, index, key, value) => field(kind, draft[kind].map((row, i) => i === index ? { ...row, [key]: value } : row));
  function submit(event) { event.preventDefault(); try { onSave(validateRecipe(draft)); } catch (e) { setError(e.message); } }
  return <form className="editor" onSubmit={submit}>
    <label>Recipe title<input required maxLength={160} value={draft.title} onChange={e => field('title', e.target.value)} /></label>
    <label>A little about this recipe<textarea maxLength={2000} value={draft.description} onChange={e => field('description', e.target.value)} /></label>
    <div className="form-row"><label>Base servings<input type="number" min="1" max="24" required value={draft.servings} onChange={e => field('servings', Number(e.target.value))} /></label><label>Total minutes<input type="number" min="0" max="1440" required value={draft.minutes} onChange={e => field('minutes', Number(e.target.value))} /></label></div>
    <h3>Ingredients</h3><p className="hint">Leave quantity blank for “to taste.” Separate units make serving adjustments work.</p>
    {draft.ingredients.map((item, i) => <fieldset className="ingredient-editor" key={i}><legend>Ingredient {i+1}</legend>
      <label>Name<input required maxLength={160} value={item.name} onChange={e => changeItem('ingredients', i, 'name', e.target.value)} /></label>
      <label>Quantity<input type="number" min="0.001" max="100000" step="any" value={item.quantity ?? ''} onChange={e => changeItem('ingredients', i, 'quantity', e.target.value === '' ? null : Number(e.target.value))} /></label>
      <label>Unit<input maxLength={80} placeholder="g, cup, tbsp…" value={item.unit} onChange={e => changeItem('ingredients', i, 'unit', e.target.value)} /></label>
      <label>Preparation / note<input maxLength={500} placeholder="chopped, to taste…" value={item.note} onChange={e => changeItem('ingredients', i, 'note', e.target.value)} /></label>
      <button type="button" className="text-button" disabled={draft.ingredients.length === 1} onClick={() => field('ingredients', draft.ingredients.filter((_, n) => n !== i))}>Remove ingredient {i+1}</button>
    </fieldset>)}
    <button type="button" className="button secondary" disabled={draft.ingredients.length >= 60} onClick={() => field('ingredients', [...draft.ingredients, { name: '', quantity: 1, unit: '', note: '' }])}>+ Add ingredient</button>
    <h3>Cooking steps</h3>{draft.steps.map((step, i) => <fieldset key={i}><legend>Step {i+1}</legend><label>Instructions<textarea required maxLength={2000} value={step.text} onChange={e => changeItem('steps', i, 'text', e.target.value)} /></label><label>Timer (seconds, 0 for none)<input type="number" min="0" max="86400" required value={step.timerSeconds} onChange={e => changeItem('steps', i, 'timerSeconds', Number(e.target.value))} /></label><button className="text-button" type="button" disabled={draft.steps.length === 1} onClick={() => field('steps', draft.steps.filter((_, n) => n !== i))}>Remove step {i+1}</button></fieldset>)}
    <button type="button" className="button secondary" disabled={draft.steps.length >= 40} onClick={() => field('steps', [...draft.steps, { text: '', timerSeconds: 0 }])}>+ Add step</button>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="actions"><button className="button">Save recipe</button><button type="button" className="button secondary" onClick={onCancel}>Cancel</button></div>
  </form>;
}
