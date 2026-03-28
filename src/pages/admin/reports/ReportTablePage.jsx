import { useEffect, useMemo, useState } from "react";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";

const pageShellClass = "space-y-6 3xl:space-y-8 5xl:space-y-12";
const pageHeaderClass = "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between";
const pageTitleClass = "text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800";
const pageSubtitleClass = "mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500";
const tableCardClass = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

function compareValues(a, b, order) {
  const left = typeof a === "number" ? a : String(a ?? "").toLowerCase();
  const right = typeof b === "number" ? b : String(b ?? "").toLowerCase();

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

function getActionButtonClass(variant) {
  if (variant === "danger") {
    return "rounded-lg bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600";
  }
  if (variant === "muted") {
    return "rounded-lg bg-slate-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-600";
  }
  if (variant === "info") {
    return "rounded-lg bg-cyan-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700";
  }
  return uniformPrimaryButtonClass;
}

function normalizeFilterValue(value, type) {
  if (type === "checkbox") return Boolean(value);
  return String(value ?? "").trim();
}

export default function ReportTablePage({
  title,
  subtitle,
  filters = [],
  columns = [],
  rows = [],
  emptyMessage = "No records found.",
  actionButtons = [],
  tableMinWidth = "min-w-[920px]",
}) {
  const initialFilters = useMemo(() => {
    return filters.reduce((accumulator, filter) => {
      if (filter.type === "checkbox") {
        accumulator[filter.id] = Boolean(filter.defaultValue);
      } else {
        accumulator[filter.id] = filter.defaultValue ?? "";
      }
      return accumulator;
    }, {});
  }, [filters]);

  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(columns[0]?.field ?? "id");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const firstField = columns[0]?.field;
    if (!firstField) return;

    setSortBy((previous) => {
      if (columns.some((column) => column.field === previous)) {
        return previous;
      }
      return firstField;
    });
    setSortOrder("asc");
  }, [columns]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return filters.every((filter) => {
        const rawFilterValue = appliedFilters[filter.id];
        const normalizedFilterValue = normalizeFilterValue(rawFilterValue, filter.type);

        if (filter.type === "checkbox") {
          if (!normalizedFilterValue) return true;
          if (typeof filter.matcher === "function") {
            return filter.matcher(row, normalizedFilterValue, appliedFilters);
          }
          return true;
        }

        if (!normalizedFilterValue) return true;

        if (typeof filter.matcher === "function") {
          return filter.matcher(row, normalizedFilterValue, appliedFilters);
        }

        if (!filter.filterKey) return true;

        const rowValue = row[filter.filterKey];
        if (filter.type === "select") {
          return String(rowValue ?? "").toLowerCase() === normalizedFilterValue.toLowerCase();
        }

        return String(rowValue ?? "").toLowerCase().includes(normalizedFilterValue.toLowerCase());
      });
    });
  }, [rows, filters, appliedFilters]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      return compareValues(left[sortBy], right[sortBy], sortOrder);
    });
  }, [filteredRows, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortOrder("asc");
  }

  function handleFilterChange(event) {
    const { name, value, type, checked } = event.target;
    setDraftFilters((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
  }

  function handleClearFilters() {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  return (
    <div className={pageShellClass}>
      <div className={pageHeaderClass}>
        <div>
          <h2 className={pageTitleClass}>{title}</h2>
          <p className={pageSubtitleClass}>{subtitle}</p>
        </div>
      </div>

      <UniformSectionCard
        title="Search Filters"
        subtitle="Use filters to narrow down report records."
        rightSlot={
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Results: {sortedRows.length}
          </span>
        }
      >
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filters.map((filter) => (
              <UniformFormField key={filter.id} label={filter.label}>
                {filter.type === "select" ? (
                  <ThemedSelect
                    name={filter.id}
                    value={draftFilters[filter.id]}
                    onChange={handleFilterChange}
                    className={uniformInputClass}
                  >
                    <option value="">{filter.placeholder || "Select"}</option>
                    {(filter.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </ThemedSelect>
                ) : filter.type === "checkbox" ? (
                  <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name={filter.id}
                      checked={Boolean(draftFilters[filter.id])}
                      onChange={handleFilterChange}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    {filter.checkboxLabel || "Enable"}
                  </label>
                ) : (
                  <input
                    type={filter.type || "text"}
                    name={filter.id}
                    value={draftFilters[filter.id]}
                    onChange={handleFilterChange}
                    placeholder={filter.placeholder || "Enter value"}
                    className={uniformInputClass}
                  />
                )}
              </UniformFormField>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button type="submit" className={uniformPrimaryButtonClass}>
              Search
            </button>
            <button type="button" onClick={handleClearFilters} className={uniformSecondaryButtonClass}>
              Clear
            </button>
            {actionButtons.map((button) => (
              <button
                key={button.id}
                type="button"
                className={getActionButtonClass(button.variant)}
              >
                {button.label}
              </button>
            ))}
          </div>
        </form>
      </UniformSectionCard>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className={`w-full ${tableMinWidth}`} data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {columns.map((column) => (
                  <th
                    key={column.field}
                    className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 ${column.className || ""}`}
                  >
                    <SortHeaderButton
                      label={column.label}
                      field={column.field}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row, index) => (
                  <tr key={`${row.id || row.rakeNumber || "row"}-${index}`} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                    {columns.map((column) => (
                      <td
                        key={`${column.field}-${index}`}
                        className={`px-5 py-3.5 text-[13px] text-slate-700 ${column.className || ""}`}
                      >
                        {typeof column.render === "function"
                          ? column.render(row[column.field], row)
                          : row[column.field] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-[14px] text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
