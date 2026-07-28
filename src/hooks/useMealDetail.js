import { useEffect, useState } from "react";
import * as mealApi from "../services/mealApi";

/** Fetches one full recipe by id, for the /recipe/:id route. */
export function useMealDetail(id) {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setMeal(null);

    mealApi
      .lookupById(id, { signal: controller.signal })
      .then((data) => {
        setMeal(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { meal, loading, error };
}
