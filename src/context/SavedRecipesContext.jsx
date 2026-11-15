import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toSummary } from "../utils/parseMeal";
import { STORAGE_KEY } from "../constants";

/**
 * Saved recipes are needed by the tab bar (count), the recipe page (save button)
 * and the saved page (list). Context avoids threading props through every level.
 */
const SavedRecipesContext = createContext(null);

export function SavedRecipesProvider({ children }) {
  const [rawSaved, setSaved] = useLocalStorage(STORAGE_KEY, []);
  const saved = useMemo(() => rawSaved.filter(r => r && typeof r.idMeal === "string" && typeof r.strMeal === "string"), [rawSaved]);

  const isSaved = useCallback(
    (id) => saved.some((meal) => meal.idMeal === id),
    [saved]
  );

  const toggleSaved = useCallback(
    (meal) => {
      setSaved((current) =>
        current.some((item) => item.idMeal === meal.idMeal)
          ? current.filter((item) => item.idMeal !== meal.idMeal)
          : [...current, toSummary(meal)]
      );
    },
    [setSaved]
  );

  const value = useMemo(
    () => ({ saved, isSaved, toggleSaved }),
    [saved, isSaved, toggleSaved]
  );

  return (
    <SavedRecipesContext.Provider value={value}>
      {children}
    </SavedRecipesContext.Provider>
  );
}

export function useSavedRecipes() {
  const context = useContext(SavedRecipesContext);
  if (!context) {
    throw new Error("useSavedRecipes must be used inside <SavedRecipesProvider>");
  }
  return context;
}
