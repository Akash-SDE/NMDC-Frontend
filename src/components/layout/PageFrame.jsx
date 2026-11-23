/** Fills the app main area without document scroll; use internal overflow on tables/lists. */
export default function PageFrame({ children, className = "" }) {
  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  );
}