import { Link } from "react-router-dom";

export default function RecipeCard({ meal, fallbackTag }) {
  return (
    <Link to={`/recipe/${meal.idMeal}`} className="card">
      <img
        className="card__thumb"
        src={`${meal.strMealThumb}/preview`}
        alt={meal.strMeal}
        loading="lazy"
      />
      <div className="card__body">
        <h3 className="card__title">{meal.strMeal}</h3>
        <p className="card__tag">
          {meal.strArea ? `${meal.strArea} · ` : ""}
          {meal.strCategory || fallbackTag}
        </p>
      </div>
    </Link>
  );
}
