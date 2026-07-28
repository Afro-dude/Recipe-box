// Pure functions — no React, no fetch. Easy to unit test in isolation.

/**
 * TheMealDB returns ingredients as 20 flat field pairs
 * (strIngredient1..20 / strMeasure1..20) rather than an array.
 * Collapse them into a usable list and drop the empty slots.
 */
export function parseIngredients(meal) {
  const rows = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      rows.push({ name: name.trim(), measure: (measure ?? "").trim() });
    }
  }
  return rows;
}

/**
 * Instructions arrive as one string. Usually newline-separated,
 * occasionally a single paragraph — handle both.
 */
export function parseSteps(instructions) {
  if (!instructions) return [];

  const lines = instructions
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(STEP\s*)?\d+[.)]?\s*/i, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  return instructions
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/** Trim a full meal object down to what a card needs before storing it. */
export function toSummary(meal) {
  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strCategory: meal.strCategory,
    strArea: meal.strArea,
  };
}
