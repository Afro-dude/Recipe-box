import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMealDetail } from '../hooks/useMealDetail';
import { useLibrary } from '../context/LibraryContext';
import { parseIngredients, parseSteps } from '../utils/parseMeal';
import { useState } from 'react';
export default function RecipePage() {
  const { id } = useParams(); const { meal, loading, error } = useMealDetail(id);
  const { state, saveRecipe } = useLibrary(); const navigate = useNavigate();
  const [saveError, setSaveError] = useState('');
  if (loading) return <main id="main" className="sheet"><p role="status" className="loading">Pulling the card…</p></main>;
  if (error || !meal) return <main id="main" className="sheet"><h2>That recipe didn’t load</h2><p>{error || 'No recipe found.'}</p><Link to="/">Back to Explore</Link></main>;
  let ingredients, steps;
  try { ingredients = parseIngredients(meal); steps = parseSteps(meal.strInstructions); } catch { return <main id="main" className="sheet"><p role="alert">The source recipe has invalid data.</p><Link to="/">Back to Explore</Link></main>; }
  const saved = state.recipes.some(r => r.id === 'meal-' + id);
  function save() {
    if (saved) return navigate('/box/meal-' + id);
    try {
      saveRecipe({ id:'meal-' + id, title:meal.strMeal, description:'The source does not specify servings. These quantities represent one original batch. Set the correct base servings in Edit before scaling.', servings:1, minutes:0, source:'mealdb', image:meal.strMealThumb, sourceUrl:/^https?:\/\//.test(meal.strSource || '') ? meal.strSource : '',
        ingredients: ingredients.map(i => ({ name:i.name, quantity:null, unit:'', note:i.measure })),
        steps:steps.map(text => ({ text, timerSeconds:0 })) });
      navigate('/box/meal-' + id);
    } catch(e) { setSaveError(e.message); }
  }
  return <main id="main" className="sheet"><Link to="/" className="backlink">← Explore recipes</Link><article className="recipe"><img className="recipe__image" src={meal.strMealThumb} alt={meal.strMeal} /><span className="section-kicker">FROM THEMEALDB</span><h2 className="page-title">{meal.strMeal}</h2><p className="recipe-meta">{meal.strCategory} · {meal.strArea}</p><button className="button" onClick={save}>{saved ? 'Open cooking mode →' : 'Save full recipe & cook →'}</button>{saveError && <p className="error" role="alert">{saveError}</p>}<h3>Ingredients</h3><table className="ingredients"><tbody>{ingredients.map((i,n) => <tr key={n}><td>{i.measure}</td><td>{i.name}</td></tr>)}</tbody></table><h3>Method</h3><ol className="steps">{steps.map((s,i) => <li className="steps__item" key={i}>{s}</li>)}</ol><p className="hint">Original measurements are kept as written. In cooking mode, edit them into numeric quantities and set base servings to enable accurate scaling.</p></article></main>;
}
