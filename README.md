# The Recipe Box

A recipe discovery app built with React. Search 300+ recipes by name, browse by category, and read full ingredient lists and methods.

**[Live demo →](https://recipe-box-yourname.vercel.app)**

![The Recipe Box](./screenshot.png)

## Features

- **Search by name** with debounced input — one request after typing stops, not one per keystroke
- **Browse by category** across seven cuisines, rendered as index-card divider tabs
- **Full recipe view** with ingredient table and numbered method, at its own shareable URL
- **Save recipes** to a personal list that persists across sessions via `localStorage`
- **Shareable result URLs** — search and filter state lives in the query string
- **Loading, empty, and error states** handled explicitly on every screen
- **Responsive** down to mobile, with visible keyboard focus and reduced-motion support

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 18 (functional components, Hooks) |
| Routing | React Router v6 |
| Build tool | Vite |
| State | `useState`, Context API, custom hooks |
| Data | TheMealDB REST API |
| Styling | CSS custom properties, no framework |
| Deployment | Vercel |

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Requires Node 18+.

## Project structure

```
src/
├── services/     the only module that calls fetch
├── utils/        pure data-shaping functions, no React
├── hooks/        useDebounce, useLocalStorage, useMeals, useMealDetail
├── context/      saved recipes, shared across routes
├── components/   presentational — receive props, fetch nothing
├── pages/        one per route, owns that screen's data
└── styles/       design tokens and component styles
```

The separation is deliberate: `RecipeCard` doesn't know TheMealDB exists, and `mealApi.js` doesn't know React exists. Swapping the data source would touch one file.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Search and category browse |
| `/recipe/:id` | Full recipe — ingredients and method |
| `/saved` | Recipes saved to `localStorage` |
| `*` | Not found |

## API endpoints

| Purpose | Endpoint |
| --- | --- |
| Search by name | `/search.php?s={query}` |
| Filter by category | `/filter.php?c={category}` |
| Full recipe by id | `/lookup.php?i={id}` |

## Notes on a few decisions

**Debounced search.** Typing fires one request after 350ms of quiet. Without it, "chicken" would fire seven requests.

**Aborted requests.** Each fetch carries an `AbortController` signal. Without it, a slow earlier request can resolve after a faster later one and overwrite the correct results — a race condition that only shows up on poor connections.

**Flat ingredient fields.** The API returns `strIngredient1..20` and `strMeasure1..20` as separate fields rather than an array, so `parseIngredients` loops through them and drops the empty slots.

**Search state in the URL.** Storing the query and category as search params makes results bookmarkable and fixes the back button. The debounced write uses `replace: true` so typing doesn't push a history entry per character.

**Three explicit UI states.** Every data-loading screen handles loading, error, and empty — not just the success path.

## What I'd add next

- Cache responses so revisiting a category doesn't refetch
- Pagination or infinite scroll for large result sets
- Unit tests for the parsing utilities, which are pure and easy to cover
- Filter by ingredient and cuisine, both already supported by the API

## Credits

Recipe data from [TheMealDB](https://www.themealdb.com), a free public API.

Built by [Mayank](https://github.com/Afro-dude).
