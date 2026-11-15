import { createContext, useContext, useEffect, useState } from 'react';
import { emptyLibrary, validateLibrary } from '../utils/library';
import { validateRecipe } from '../../shared/recipe';
const Context = createContext(null);
export function LibraryProvider({ children }) {
  const [warning, setWarning] = useState('');
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem('recipe-box:library:v1'); return raw ? validateLibrary(JSON.parse(raw)) : emptyLibrary; }
    catch { return { ...emptyLibrary, recoveryWarning: true }; }
  });
  useEffect(() => {
    if (state.recoveryWarning) { setWarning('Saved data could not be read. It has not been overwritten. Import a backup or make a new change to start a fresh library.'); return; }
    try { localStorage.setItem('recipe-box:library:v1', JSON.stringify(state)); setWarning(''); }
    catch { setWarning('Browser storage is unavailable or full. Changes work for this session only. Export your recipe box to keep a backup.'); }
  }, [state]);
  const update = fn => setState(s => { const next = fn(s); return { ...next, recoveryWarning: false }; });
  const saveRecipe = recipe => {
    const clean = { ...recipe, ...validateRecipe(recipe), id: recipe.id || crypto.randomUUID() };
    update(s => ({ ...s, recipes: [clean, ...s.recipes.filter(r => r.id !== clean.id)] }));
    return clean.id;
  };
  const patchRecipe = (id, patch) => update(s => ({ ...s, recipes: s.recipes.map(r => r.id === id ? { ...r, ...patch } : r) }));
  const removeRecipe = id => update(s => ({ ...s, recipes: s.recipes.filter(r => r.id !== id), plan: s.plan.filter(p => p.recipeId !== id), timers: s.timers.filter(t => t.recipeId !== id), progress: Object.fromEntries(Object.entries(s.progress).filter(([key]) => key !== id)) }));
  return <Context.Provider value={{ state, update, saveRecipe, patchRecipe, removeRecipe, warning }}>{children}</Context.Provider>;
}
export const useLibrary = () => useContext(Context);
