# The Recipe Box

A recipe discovery app built with React. Search 300+ recipes by name, browse by
category, and read full ingredient lists and methods. Data comes from TheMealDB,
a free public REST API.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Folder structure

```
src/
├── main.jsx                    entry point — mounts router + context providers
├── App.jsx                     routes and page shell
├── constants.js                shared values (categories, storage key, timings)
│
├── services/
│   └── mealApi.js              the only file that calls fetch
│
├── utils/
│   └── parseMeal.js            pure data-shaping functions, no React
│
├── hooks/
│   ├── useDebounce.js          delays a rapidly changing value
│   ├── useLocalStorage.js      useState that survives a reload
│   ├── useMeals.js             fetches the recipe list
│   └── useMealDetail.js        fetches one full recipe
│
├── context/
│   └── SavedRecipesContext.jsx saved recipes, shared across routes
│
├── components/                 presentational, reusable, no data fetching
│   ├── Masthead.jsx
│   ├── SearchBar.jsx
│   ├── CategoryTabs.jsx
│   ├── RecipeCard.jsx
│   ├── RecipeGrid.jsx
│   ├── SkeletonGrid.jsx
│   └── StateMessage.jsx
│
├── pages/                      one per route, owns the data for that screen
│   ├── HomePage.jsx
│   ├── RecipePage.jsx
│   ├── SavedPage.jsx
│   └── NotFoundPage.jsx
│
└── styles/
    └── index.css               design tokens and component styles
```

## Routes

| Path           | Screen                                       |
| -------------- | -------------------------------------------- |
| `/`            | Search and category browse                   |
| `/recipe/:id`  | Full recipe — ingredients and method          |
| `/saved`       | Recipes saved to localStorage                |
| `*`            | Not found                                    |

Search state is stored in the URL (`/?q=tikka`, `/?category=Seafood`) so results
can be bookmarked, shared, and reached with the back button.

## API endpoints used

| Purpose                | Endpoint                    |
| ---------------------- | --------------------------- |
| Search by name         | `/search.php?s={query}`     |
| Filter by category     | `/filter.php?c={category}`  |
| Full recipe by id      | `/lookup.php?i={id}`        |

## Notes on a few decisions

**Debounced search.** Typing fires one request after 350ms of quiet, not one per
keystroke.

**Aborted requests.** Each fetch carries an `AbortController` signal. Without it,
a slow earlier request can resolve after a faster later one and overwrite the
correct results.

**Flat ingredient fields.** The API returns `strIngredient1..20` and
`strMeasure1..20` as separate fields rather than an array, so `parseIngredients`
loops through them and drops the empty slots.

**Three explicit UI states.** Every data-loading screen handles loading, error,
and empty, not just the success path.
