import { useCallback, useMemo, useState } from "react";

/**
 * Column definition used by useColumnFilters / ColumnFilterRow:
 *   key        unique column key
 *   label      column label (used for the input's placeholder / aria-label)
 *   type       "text" (contains, default) | "select" (exact match) | "none" (no filter, e.g. Actions)
 *   getValue   (row) => value shown in the cell; defaults to row[key]
 *   options    select options [{ value, label }] or strings; derived from the rows when omitted
 *   className  extra <th> classes so the filter cell follows the column's responsive visibility
 */

function toText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toText).join(" ");
  return String(value);
}

function readValue(column, row) {
  return column.getValue ? column.getValue(row) : row?.[column.key];
}

export function filterRowsByColumns(rows, columns, filters) {
  const active = columns.filter((column) => {
    if (column.type === "none") return false;
    const value = filters[column.key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
  if (!active.length) return [...(rows ?? [])];

  return (rows ?? []).filter((row) =>
    active.every((column) => {
      const cell = toText(readValue(column, row)).trim().toLowerCase();
      const wanted = String(filters[column.key]).trim().toLowerCase();
      return column.type === "select" ? cell === wanted : cell.includes(wanted);
    }),
  );
}

export function deriveColumnOptions(column, rows) {
  if (column.options) {
    return column.options.map((option) =>
      typeof option === "object" ? option : { value: String(option), label: String(option) },
    );
  }
  const values = new Set();
  for (const row of rows ?? []) {
    const value = toText(readValue(column, row)).trim();
    if (value) values.add(value);
  }
  return [...values]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((value) => ({ value, label: value }));
}

/**
 * Per-column filter state plus client-side filtering.
 * `onChange` runs whenever a filter changes (typically to reset the page to 1).
 */
export function useColumnFilters(columns, { onChange } = {}) {
  const [filters, setFilters] = useState({});

  const setFilter = useCallback(
    (key, value) => {
      setFilters((prev) => {
        const next = { ...prev };
        if (value === "" || value === null || value === undefined) delete next[key];
        else next[key] = value;
        return next;
      });
      onChange?.();
    },
    [onChange],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    onChange?.();
  }, [onChange]);

  const activeCount = useMemo(
    () => Object.values(filters).filter((value) => String(value).trim() !== "").length,
    [filters],
  );

  const applyFilters = useCallback(
    (rows) => filterRowsByColumns(rows, columns, filters),
    [columns, filters],
  );

  return {
    filters,
    setFilter,
    clearFilters,
    activeCount,
    isFiltering: activeCount > 0,
    filterKey: JSON.stringify(filters),
    applyFilters,
    filterRowProps: { columns, filters, onFilterChange: setFilter, onClear: clearFilters },
  };
}

/** Page size used to fetch the whole list while column filters are active on a server-paginated page. */
export const ALL_ROWS_PAGE_SIZE = 1000;

/**
 * Column filters for lists the backend paginates. While no filter is set the page keeps
 * normal server paging; once a filter is set, load `serverPage`/`serverPageSize`
 * (page 1 of ALL_ROWS_PAGE_SIZE) and render `pageRows` / `count` / `totalPages`,
 * which are filtered and paginated in the browser.
 */
export function useServerColumnFilters(columns, { rows, totalCount, currentPage, pageSize, onChange }) {
  const columnFilters = useColumnFilters(columns, { onChange });
  const { isFiltering, applyFilters } = columnFilters;

  const filteredRows = useMemo(
    () => (isFiltering ? applyFilters(rows) : rows ?? []),
    [isFiltering, applyFilters, rows],
  );

  const count = isFiltering ? filteredRows.length : totalCount;
  const pageRows = isFiltering
    ? filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : rows ?? [];

  return {
    ...columnFilters,
    serverPage: isFiltering ? 1 : currentPage,
    serverPageSize: isFiltering ? ALL_ROWS_PAGE_SIZE : pageSize,
    filteredRows,
    pageRows,
    count,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}
