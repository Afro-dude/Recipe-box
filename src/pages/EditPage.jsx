import { useNavigate, useParams } from 'react-router-dom';
import RecipeEditor from '../components/RecipeEditor';
import { useLibrary } from '../context/LibraryContext';
export default function EditPage() {
  const { id } = useParams(); const navigate = useNavigate();
  const { state, saveRecipe, update } = useLibrary();
  const existing = state.recipes.find(r => r.id === id);
  if (id && !existing) return <main id="main" className="sheet"><h2>Recipe not found</h2></main>;
  return <main id="main" className="sheet"><h2 className="page-title">{existing ? 'Make it your own' : 'Write a recipe card'}</h2><RecipeEditor key={id || 'new'} initial={existing} onCancel={() => navigate(existing ? `/box/${id}` : '/saved')} onSave={recipe => {
    const recipeId = saveRecipe({ ...existing, ...recipe, source: existing?.source || 'manual' });
    update(s => ({ ...s, progress: { ...s.progress, [recipeId]: { servings: recipe.servings, done: [] } }, timers: s.timers.filter(t => t.recipeId !== recipeId) }));
    navigate(`/box/${recipeId}`);
  }} /></main>;
}
