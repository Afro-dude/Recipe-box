import { Link, useParams } from "react-router-dom";
import StateMessage from "../components/StateMessage";
import { useMealDetail } from "../hooks/useMealDetail";
import { useSavedRecipes } from "../context/SavedRecipesContext";
import { parseIngredients, parseSteps } from "../utils/parseMeal";

export default function RecipePage() {
  const { id } = useParams();
  const { meal, loading, error } = useMealDetail(id);
  const { isSaved, toggleSaved } = useSavedRecipes();

  if (loading) {
    return (
      <main className="sheet">
        <p className="loading">Pulling the card…</p>
      </main>
    );
  }

  if (error || !meal) {
    return (
      <main className="sheet">
        <StateMessage title="That recipe didn’t load" body="It may have been removed.">
          <Link to="/" className="button">Back to the box</Link>
        </StateMessage>
      </main>
    );
  }

  const ingredients = parseIngredients(meal);
  const steps = parseSteps(meal.strInstructions);
  const saved = isSaved(meal.idMeal);

  return (
    <main className="sheet">
      <Link to="/" className="backlink">← Back to the box</Link>

      <article className="recipe">
        <img className="recipe__image" src={meal.strMealThumb} alt={meal.strMeal} />

        <h2 className="recipe__title">{meal.strMeal}</h2>
        <p className="recipe__tags">
          {meal.strCategory} · {meal.strArea} ·{" "}
          <span>{ingredients.length} ingredients</span>
        </p>

        <h3 className="section-label">Ingredients</h3>
        <table className="ingredients">
          <tbody>
            {ingredients.map((row, index) => (
              <tr key={index}>
                <td className="ingredients__measure">{row.measure || "—"}</td>
                <td>{row.name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="section-label">Method</h3>
        <ol className="steps">
          {steps.map((step, index) => (
            <li className="steps__item" key={index}>{step}</li>
          ))}
        </ol>

        <div className="recipe__footer">
          <button className="button" onClick={() => toggleSaved(meal)}>
            {saved ? "★ Saved to box" : "☆ Save to box"}
          </button>
          {meal.strSource && (
            <a className="sourcelink" href={meal.strSource} target="_blank" rel="noreferrer">
              Original source ↗
            </a>
          )}
        </div>
      </article>
    </main>
  );
}
