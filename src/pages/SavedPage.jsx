import { Link } from "react-router-dom";
import RecipeGrid from "../components/RecipeGrid";
import StateMessage from "../components/StateMessage";
import { useSavedRecipes } from "../context/SavedRecipesContext";

export default function SavedPage() {
  const { saved } = useSavedRecipes();

  return (
    <main className="sheet">
      <div className="sheet__head">
        <h2 className="sheet__title">Your saved cards</h2>
        <span className="sheet__meta">
          {saved.length} {saved.length === 1 ? "card" : "cards"}
        </span>
      </div>

      {saved.length === 0 ? (
        <StateMessage
          title="No cards saved yet"
          body="Open any recipe and choose “Save to box” to keep it here."
        >
          <Link to="/" className="button">Browse recipes</Link>
        </StateMessage>
      ) : (
        <RecipeGrid meals={saved} fallbackTag="Saved" />
      )}
    </main>
  );
}
