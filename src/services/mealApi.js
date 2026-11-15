const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://www.themealdb.com/api/json/v1/1';
async function getJSON(path, { signal } = {}) {
  const response = await fetch(BASE_URL + path, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('The recipe service is unavailable. Please retry.');
  const data = await response.json();
  if (!data || !('meals' in data) || !(data.meals === null || Array.isArray(data.meals))) throw new Error('The recipe service returned unexpected data.');
  return data.meals || [];
}
export const searchByName = (q, options) => getJSON('/search.php?s=' + encodeURIComponent(q), options);
export const filterByCategory = (q, options) => getJSON('/filter.php?c=' + encodeURIComponent(q), options);
export const lookupById = (id, options) => getJSON('/lookup.php?i=' + encodeURIComponent(id), options).then(rows => rows[0] ?? null);
export const discover = (mode, q, options) => getJSON(mode === 'name' ? '/search.php?s=' + encodeURIComponent(q) : '/filter.php?' + ({ category:'c', cuisine:'a', ingredient:'i' }[mode] || 'c') + '=' + encodeURIComponent(q), options);
export const listOptions = (type, options) => getJSON('/list.php?' + type + '=list', options);
export const randomMeal = options => getJSON('/random.php', options).then(rows => rows[0] ?? null);
