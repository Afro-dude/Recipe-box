// The only module in the app that knows a network exists.
// Components never call fetch directly — they call these functions.
// If the API is swapped out later, this is the only file that changes.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://www.themealdb.com/api/json/v1/1";

async function getJSON(path, { signal } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Recipe service returned ${response.status}`);
  }
  return response.json();
}

export function searchByName(query, options) {
  return getJSON(`/search.php?s=${encodeURIComponent(query)}`, options).then(
    (data) => data.meals ?? []
  );
}

export function filterByCategory(category, options) {
  return getJSON(`/filter.php?c=${encodeURIComponent(category)}`, options).then(
    (data) => data.meals ?? []
  );
}

export function lookupById(id, options) {
  return getJSON(`/lookup.php?i=${encodeURIComponent(id)}`, options).then(
    (data) => data.meals?.[0] ?? null
  );
}
