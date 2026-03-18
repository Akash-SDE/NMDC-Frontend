export default function FilterPanel({
  isOpen,
  onClose,
  activeFilters,
  onApply,
  onClear,
  filterFields = [],
}) {
  if (!isOpen) return null;

  function handleStatusChange(status) {
    onApply({ ...activeFilters, status });
  }

  function handleFieldChange(key, value) {
    const newFilters = { ...activeFilters, [key]: value };
    // Build custom filter function for non-status fields
    if (key !== "status") {
      if (value) {
        newFilters.customFilter = (item) => {
          return Object.entries(newFilters).every(([k, v]) => {
            if (k === "status" || k === "customFilter") return true;
            if (!v) return true;
            return item[k] === v;
          });
        };
      } else {
        // Remove custom filter if no value
        const remaining = { ...newFilters };
        delete remaining[key];
        const hasCustomFields = Object.keys(remaining).some(
          (k) => k !== "status" && k !== "customFilter" && remaining[k],
        );
        if (!hasCustomFields) delete remaining.customFilter;
        onApply(remaining);
        return;
      }
    }
    onApply(newFilters);
  }

  const hasActiveFilters = Object.keys(activeFilters).some(
    (k) =>
      k !== "customFilter" && activeFilters[k] && activeFilters[k] !== "all",
  );

  return (
    <div className="rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-md animate-slideDown">
      <div className="flex items-center justify-between mb-4 3xl:mb-6">
        <h4 className="text-[15px] 3xl:text-[18px] 5xl:text-[22px] font-bold text-brand-900">
          Filters
        </h4>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-6 3xl:gap-8 5xl:gap-10">
        {/* Status filter — always shown */}
        <div>
          <label className="block text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase mb-2 3xl:mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-2 3xl:gap-3">
            {["all", "active", "inactive", "maintenance"].map((status) => {
              const isActive = (activeFilters.status || "all") === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`
                    rounded-lg px-3.5 py-1.5 3xl:px-4 3xl:py-2 5xl:px-6 5xl:py-3
                    text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-semibold capitalize transition-all
                    ${
                      isActive
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }
                  `}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic filter fields */}
        {filterFields.map((field) => (
          <div key={field.key}>
            <label className="block text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase mb-2 3xl:mb-3">
              {field.label}
            </label>
            <select
              value={activeFilters[field.key] || ""}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 3xl:px-4 3xl:py-2 5xl:px-6 5xl:py-3 text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-700 outline-none focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="">All</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="mt-4 3xl:mt-5 5xl:mt-7 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="3xl:w-4 3xl:h-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Clear all filters</span>
        </button>
      )}
    </div>
  );
}
