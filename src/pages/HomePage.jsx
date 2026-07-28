import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryTabs from "../components/CategoryTabs";
import RecipeGrid from "../components/RecipeGrid";
import SkeletonGrid from "../components/SkeletonGrid";
import StateMessage from "../components/StateMessage";
import { useDebounce } from "../hooks/useDebounce";
import { useMeals } from "../hooks/useMeals";
import { DEFAULT_CATEGORY, SEARCH_DEBOUNCE_MS } from "../constants";

export default function HomePage() {
  // Search term and category live in the URL, so a result page can be
  // bookmarked, shared, and reached again with the back button.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? DEFAULT_CATEGORY;

  // The input itself stays local so typing feels instant.
  const [input, setInput] = useState(urlQuery);
  const debouncedInput = useDebounce(input, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedInput.trim()) {
      next.set("q", debouncedInput.trim());
    } else {
      next.delete("q");
    }
    // replace: true — typing shouldn't push a history entry per character
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const query = searchParams.get("q") ?? "";
  const { meals, loading, error } = useMeals(query, category);

  const handleCategory = (nextCategory) => {
    setInput("");
    setSearchParams({ category: nextCategory });
  };

  const heading = query ? `Results for “${query}”` : `${category} recipes`;

  return (
    <>
      <SearchBar value={input} onChange={setInput} />
      <CategoryTabs active={query ? null : category} onSelect={handleCategory} />

      <main className="sheet">
        <div className="sheet__head">
          <h2 className="sheet__title">{heading}</h2>
          {!loading && !error && (
            <span className="sheet__meta">
              {meals.length} {meals.length === 1 ? "card" : "cards"}
            </span>
          )}
        </div>

        {loading && <SkeletonGrid />}

        {!loading && error && (
          <StateMessage
            title="Couldn’t reach the recipe service"
            body="Check your connection and search again."
          />
        )}

        {!loading && !error && meals.length === 0 && (
          <StateMessage
            title="Nothing filed under that"
            body="Try a shorter term, or pick a divider above."
          />
        )}

        {!loading && !error && meals.length > 0 && (
          <RecipeGrid meals={meals} fallbackTag={category} />
        )}
      </main>
    </>
  );
}
