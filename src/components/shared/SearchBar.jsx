import { uniformInputClass, uniformSecondaryButtonClass } from "./UniformUi";

export default function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  showFilter = true,
  showExport = false,
  filterLabel = "Filter",
  onFilter,
  onExport,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search input */}
      <div className="relative flex-1 max-w-lg 3xl:max-w-xl 5xl:max-w-2xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${uniformInputClass} py-2.5 pl-11 text-[13px] 3xl:py-3 3xl:text-[16px] 5xl:py-4 5xl:text-[20px]`}
        />
        {value && (
          <button
            onClick={() => onChange?.("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 3xl:gap-3 5xl:gap-4">
        {showFilter && (
          <button
            onClick={onFilter}
            className={`${uniformSecondaryButtonClass} flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] 3xl:gap-2 3xl:px-4 3xl:py-3 3xl:text-[15px] 5xl:px-6 5xl:py-4 5xl:text-[20px]`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="3xl:w-5 3xl:h-5"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            <span>{filterLabel}</span>
          </button>
        )}
        {showExport && (
          <button
            onClick={onExport}
            className={`${uniformSecondaryButtonClass} flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] 3xl:gap-2 3xl:px-4 3xl:py-3 3xl:text-[15px] 5xl:px-6 5xl:py-4 5xl:text-[20px]`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="3xl:w-5 3xl:h-5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export</span>
          </button>
        )}
      </div>
    </div>
  );
}
