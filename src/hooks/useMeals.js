import { useEffect, useState } from "react";
import * as mealApi from "../services/mealApi";

/**
 * Fetches the recipe list. A search term takes priority over the category.
 *
 * The AbortController matters: if you type "chick" then "chicken", the first
 * request may still be in flight. Without aborting, a slow early response can
 * land after a fast later one and overwrite the correct results.
 */
export function useMeals(query, category) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const request = query
      ? mealApi.searchByName(query, { signal: controller.signal })
      : mealApi.filterByCategory(category, { signal: controller.signal });

    request
      .then((data) => {
        setMeals(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // superseded, not a real failure
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, category]);

  return { meals, loading, error };
}
