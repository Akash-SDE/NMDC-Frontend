import React from "react";

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
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-2.5 3xl:py-3 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 3xl:gap-3 5xl:gap-4">
        {showFilter && (
          <button
            onClick={onFilter}
            className="flex items-center gap-1.5 3xl:gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 3xl:px-4 3xl:py-3 5xl:px-6 5xl:py-4 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
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
            className="flex items-center gap-1.5 3xl:gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 3xl:px-4 3xl:py-3 5xl:px-6 5xl:py-4 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
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
