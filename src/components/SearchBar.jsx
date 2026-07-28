export default function SearchBar({ value, onChange }) {
  return (
    <div className="searchbar">
      <input
        id="recipe-search"
        className="searchbar__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search recipes — try “tikka” or “lasagne”"
        aria-label="Search recipes by name"
      />
      <span className="searchbar__icon" aria-hidden="true">⌕</span>
    </div>
  );
}
