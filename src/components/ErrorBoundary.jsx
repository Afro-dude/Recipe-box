import { Component } from 'react';
// React error boundaries use the class lifecycle; all feature UI uses hooks.
export default class ErrorBoundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  render() {
    if (this.state.failed) return <main id="main" className="sheet"><h1>Something went wrong displaying this page.</h1><p>Your saved browser data has not been cleared. Reload to try again.</p><button className="button" onClick={() => window.location.reload()}>Reload Recipe Box</button></main>;
    return this.props.children;
  }
}
