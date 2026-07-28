/** Shared shell for empty and error states so they stay visually consistent. */
export default function StateMessage({ title, body, children }) {
  return (
    <div className="state">
      <h3 className="state__title">{title}</h3>
      {body && <p className="state__body">{body}</p>}
      {children}
    </div>
  );
}
