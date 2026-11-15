import { validateRecipe } from '../../shared/recipe.js';
export async function requestRecipe(payload, signal) {
  const timeout = AbortSignal.timeout(55000);
  let response;
  try {
    response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.any([signal, timeout]) });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(timeout.aborted ? 'This took too long. Your previous recipe is safe. Please retry.' : 'Cannot reach the recipe server. Check your connection and retry.');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('The server returned unreadable data. Please retry.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('The server returned unexpected data. Please retry.');
  if (!response.ok) throw new Error(data.error || 'Could not create a recipe. Please retry.');
  return validateRecipe(data.recipe);
}
// Sequence guard is independent of transport cancellation: even a late resolved
// response cannot overwrite a newer request or an explicit cancellation.
export function createRequestGate() {
  let sequence = 0;
  return { next: () => ++sequence, current: id => id === sequence, cancel: () => ++sequence };
}
