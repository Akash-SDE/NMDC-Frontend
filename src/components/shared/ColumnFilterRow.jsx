import { useMemo } from "react";
import { deriveColumnOptions } from "../../hooks/useColumnFilters";

const controlClass =
  "w-full min-w-[84px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12px] 3xl:text-[14px] font-normal normal-case tracking-normal text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function ClearButton({ onClear }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-[12px] 3xl:text-[14px] font-semibold normal-case tracking-normal text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      title="Clear column filters"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      Clear
    </button>
  );
}

/**
 * A second header row with one filter control per column.
 * Render it inside <thead>, right after the header row, with the same column order.
 */
export default function ColumnFilterRow({
  columns,
  filters,
  onFilterChange,
  onClear,
  rows = [],
  cellClassName = "px-5 py-2",
  rowClassName = "border-b border-slate-100 bg-white",
}) {
  const hasActive = Object.values(filters).some((value) => String(value).trim() !== "");

  const optionsByKey = useMemo(() => {
    const map = {};
    for (const column of columns) {
      if (column.type === "select") map[column.key] = deriveColumnOptions(column, rows);
    }
    return map;
  }, [columns, rows]);

  let clearIndex = -1;
  columns.forEach((column, index) => {
    if (column.type === "none") clearIndex = index;
  });

  return (
    <tr className={rowClassName} data-print-hide>
      {columns.map((column, index) => {
        const value = filters[column.key] ?? "";
        const showClear = hasActive && (clearIndex === -1 ? index === columns.length - 1 : index === clearIndex);
        const label = column.label ?? column.key;

        let control = null;
        if (column.type === "select") {
          control = (
            <select
              value={value}
              onChange={(e) => onFilterChange(column.key, e.target.value)}
              className={`${controlClass} cursor-pointer pr-6`}
              aria-label={`Filter by ${label}`}
            >
              <option value="">All</option>
              {optionsByKey[column.key].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        } else if (column.type !== "none") {
          control = (
            <input
              type="text"
              value={value}
              onChange={(e) => onFilterChange(column.key, e.target.value)}
              placeholder="Filter…"
              className={controlClass}
              aria-label={`Filter by ${label}`}
            />
          );
        }

        return (
          <th key={column.key} className={`${cellClassName} ${column.className ?? ""} font-normal`}>
            {showClear && control ? (
              <div className="flex items-center gap-1">
                {control}
                <ClearButton onClear={onClear} />
              </div>
            ) : showClear ? (
              <div className="flex justify-end">
                <ClearButton onClear={onClear} />
              </div>
            ) : (
              control
            )}
          </th>
        );
      })}
    </tr>
  );
}
