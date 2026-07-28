import { Link } from "react-router-dom";
import StateMessage from "../components/StateMessage";

export default function NotFoundPage() {
  return (
    <main className="sheet">
      <StateMessage title="No card at that address" body="The page you asked for isn’t in the box.">
        <Link to="/" className="button">Back to the box</Link>
      </StateMessage>
    </main>
  );
}
