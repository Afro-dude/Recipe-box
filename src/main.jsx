import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SavedRecipesProvider } from "./context/SavedRecipesContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SavedRecipesProvider>
        <App />
      </SavedRecipesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
