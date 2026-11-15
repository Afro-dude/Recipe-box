import { useEffect, useRef } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Masthead from './components/Masthead';
import HomePage from './pages/HomePage';
import RecipePage from './pages/RecipePage';
import SavedPage from './pages/SavedPage';
import CookPage from './pages/CookPage';
import BoxRecipePage from './pages/BoxRecipePage';
import EditPage from './pages/EditPage';
import PlanPage from './pages/PlanPage';
import NotFoundPage from './pages/NotFoundPage';
import { useLibrary } from './context/LibraryContext';
import { TimerTray } from './components/TimerTray';
export default function App() {
  const { state, warning } = useLibrary(); const location = useLocation(); const initial = useRef(true);
  useEffect(() => { if (initial.current) { initial.current=false; return; } window.scrollTo(0,0); const main = document.querySelector('main'); if (main) { main.tabIndex = -1; main.focus({ preventScroll:true }); } }, [location.pathname]);
  return <div className="app"><a className="skip-link" href="#main">Skip to content</a><div className="app__shell"><Masthead /><nav className="main-nav" aria-label="Main navigation">{[['/','Explore'],['/cook','Cook with ingredients'],['/saved','My recipe box'],['/plan','Meal planner']].map(([to,label]) => <NavLink to={to} end key={to}>{label}{to === '/saved' && <span>{state.recipes.length}</span>}</NavLink>)}</nav>
    {warning && <p className="notice" role="alert">{warning}</p>}
    <Routes><Route path="/" element={<HomePage />} /><Route path="/recipe/:id" element={<RecipePage />} /><Route path="/saved" element={<SavedPage />} /><Route path="/cook" element={<CookPage />} /><Route path="/box/:id" element={<BoxRecipePage />} /><Route path="/new" element={<EditPage />} /><Route path="/edit/:id" element={<EditPage />} /><Route path="/plan" element={<PlanPage />} /><Route path="*" element={<NotFoundPage />} /></Routes>
    <footer className="footnote">Made for everyday cooking · Explore data by TheMealDB · Your box stays on this browser</footer><TimerTray /></div></div>;
}
