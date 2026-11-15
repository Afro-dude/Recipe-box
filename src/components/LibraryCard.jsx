import { Link } from 'react-router-dom';
export default function LibraryCard({ recipe }) {
  return <Link className="card library-card" to={`/box/${recipe.id}`}>
    {recipe.image ? <img className="card__thumb" src={recipe.image} alt="" loading="lazy" /> : <div className="card-illustration" aria-hidden="true"><span>{recipe.source === 'ai' ? 'A LITTLE INSPIRATION' : 'FROM YOUR KITCHEN'}</span><div>✳</div></div>}
    <div className="card__body"><p className="card__tag">{recipe.source === 'ai' ? 'AI suggestion' : recipe.source === 'mealdb' ? 'TheMealDB' : 'Your recipe'}{recipe.favorite ? ' · ★' : ''}</p><h3 className="card__title">{recipe.title}</h3><p className="card__tag">{recipe.minutes ? `${recipe.minutes} min · ` : ''}{recipe.servings} servings{recipe.cooked ? ' · Cooked' : ''}</p>{recipe.collection && <p className="collection-tag">{recipe.collection}</p>}</div>
  </Link>;
}
