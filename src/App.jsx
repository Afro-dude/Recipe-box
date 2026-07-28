import { Route, Routes } from "react-router-dom";
import Masthead from "./components/Masthead";
import HomePage from "./pages/HomePage";
import RecipePage from "./pages/RecipePage";
import SavedPage from "./pages/SavedPage";
import NotFoundPage from "./pages/NotFoundPage";

/** App owns routing and layout only. All data logic lives in pages and hooks. */
export default function App() {
  return (
    <div className="app">
      <div className="app__shell">
        <Masthead />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <p className="footnote">Recipe data from TheMealDB · free public API</p>
      </div>
    </div>
  );
}
