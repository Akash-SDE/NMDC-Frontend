export function SortIcon({ isActive, order }) {
  if (!isActive) {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-300" aria-hidden="true">
        <path d="M8 2l3 3H5l3-3z" fill="currentColor" />
        <path d="M8 14l-3-3h6l-3 3z" fill="currentColor" />
      </svg>
    );
  }

  return order === "asc" ? (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-700" aria-hidden="true">
      <path d="M8 2l3 3H5l3-3z" fill="currentColor" />
      <path d="M8 4.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-700" aria-hidden="true">
      <path d="M8 14l-3-3h6l-3 3z" fill="currentColor" />
      <path d="M8 2.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SortHeaderButton({ label, field, sortBy, sortOrder, onSort }) {
  const isActive = sortBy === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1.5 transition-colors ${
        isActive ? "text-slate-700" : "text-slate-500 hover:text-slate-700"
      }`}
      aria-label={`Sort by ${label}`}
    >
      <span>{label}</span>
      <SortIcon isActive={isActive} order={sortOrder} />
    </button>
  );
}
