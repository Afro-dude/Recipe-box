import RecipeCard from "./RecipeCard";

export default function RecipeGrid({ meals, fallbackTag }) {
  return (
    <div className="grid">
      {meals.map((meal) => (
        <RecipeCard key={meal.idMeal} meal={meal} fallbackTag={fallbackTag} />
      ))}
    </div>
  );
}
