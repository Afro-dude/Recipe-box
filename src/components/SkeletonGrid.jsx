export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton" key={index}>
          <div className="skeleton__image" />
          <div className="skeleton__bar" />
          <div className="skeleton__bar skeleton__bar--short" />
        </div>
      ))}
    </div>
  );
}
