import { Link } from 'react-router-dom';
export default function Masthead() {
  return <header className="masthead"><p className="masthead__eyebrow">A LITTLE INSPIRATION FOR YOUR EVERYDAY TABLE</p><h1 className="masthead__wordmark"><Link to="/" className="masthead__home">The Recipe <em>Box</em></Link></h1><p className="masthead__sub">Discover something delicious. Make it your own.</p></header>;
}
