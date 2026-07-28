import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants";
import { useSavedRecipes } from "../context/SavedRecipesContext";

export default function CategoryTabs({ active, onSelect }) {
  const { saved } = useSavedRecipes();

  return (
    <div className="tabs" role="tablist" aria-label="Recipe categories">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          role="tab"
          aria-selected={active === category}
          className={`tabs__tab ${active === category ? "tabs__tab--active" : ""}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}

      <Link to="/saved" className="tabs__tab tabs__tab--link">
        Saved<span className="tabs__count">{saved.length}</span>
      </Link>
    </div>
  );
}
