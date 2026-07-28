import { Link } from "react-router-dom";

export default function Masthead() {
  return (
    <header className="masthead">
      <p className="masthead__eyebrow">Index of 300+ recipes</p>
      <h1 className="masthead__wordmark">
        <Link to="/" className="masthead__home">
          The Recipe <em>Box</em>
        </Link>
      </h1>
      <p className="masthead__sub">
        Flip through the dividers, or search by name. Every card carries its full
        ingredient list and method.
      </p>
    </header>
  );
}
