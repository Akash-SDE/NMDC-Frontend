import { useEffect, useMemo, useState } from "react";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import Toast from "../../../components/shared/Toast";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
} from "../../../components/shared/UniformUi";
import { reportActionIconMap, ConfigIcon } from "../../../components/icons";
import { useRouter } from "../../../context/RouterContext";
import { useToast } from "../../../hooks/useToast";
import { exportToCSV, printTable } from "../../../utils/export";
import { REPORTS } from "./reportRegistry";
import { DEFAULT_TABLE_MIN_WIDTH } from "./reportDefaults";
import {
  DATE_RANGE_PRESETS,
  buildDatePresetValues,
  reportSupportsDatePresets,
} from "./reportDatePresets";
import { getReportLineage } from "./reportDataLineage";

const pageShellClass = "space-y-5 3xl:space-y-7";
const pageTitleClass = "text-[22px] sm:text-[26px] font-bold text-slate-800";
const pageSubtitleClass = "mt-1 text-[13px] sm:text-[14px] text-slate-500";
const tableCardClass = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

const iconButtonBaseClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors";

function getIconButtonClass(variant) {
  if (variant === "secondary") {
    return `${iconButtonBaseClass} border border-slate-300 bg-white text-slate-600 hover:bg-slate-100`;
  }
  if (variant === "danger") {
    return `${iconButtonBaseClass} bg-rose-500 text-white hover:bg-rose-600`;
  }
  if (variant === "muted") {
    return `${iconButtonBaseClass} bg-slate-500 text-white hover:bg-slate-600`;
  }
  if (variant === "info") {
    return `${iconButtonBaseClass} bg-cyan-600 text-white hover:bg-cyan-700`;
  }
  return `${iconButtonBaseClass} bg-blue-600 text-white hover:bg-blue-700`;
}

function ReportIconButton({ icon, label, variant = "primary", onClick, type = "button", disabled = false }) {
  const Icon = reportActionIconMap[icon] || reportActionIconMap.print;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${getIconButtonClass(variant)} disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}

function compareValues(a, b, order) {
  const left = typeof a === "number" ? a : String(a ?? "").toLowerCase();
  const right = typeof b === "number" ? b : String(b ?? "").toLowerCase();

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

function normalizeFilterValue(value, type) {
  if (type === "checkbox") return Boolean(value);
  return String(value ?? "").trim();
}

function formatChipValue(filter, value) {
  if (filter.type === "checkbox") return filter.checkboxLabel || "Enabled";
  if (filter.type === "date") {
    const [year, month, day] = String(value).slice(0, 10).split("-");
    if (year && month && day) return `${day}/${month}/${year}`;
  }
  if (filter.type === "select") {
    return filter.options?.find((option) => option.value === value)?.label ?? value;
  }
  return value;
}

export default function ReportTablePage({
  reportId,
  title,
  subtitle,
  filters = [],
  columns = [],
  rows = [],
  emptyMessage = "No records found for the selected filters.",
  tableMinWidth = DEFAULT_TABLE_MIN_WIDTH,
  loading = false,
  dataSource = "static",
  dataSourceType = "live",
}) {
  const { navigate, currentRoute } = useRouter();
  const { toast, showToast } = useToast();

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

  const [filterValues, setFilterValues] = useState(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [visibleFields, setVisibleFields] = useState(() => columns.map((column) => column.field));
  const [sortBy, setSortBy] = useState(columns[0]?.field ?? "id");
  const [sortOrder, setSortOrder] = useState("asc");

  const activeReportId = reportId ?? REPORTS.find((report) => report.legacyRouteId === currentRoute)?.id;
  const showDatePresets = reportSupportsDatePresets(filters);

  useEffect(() => {
    setFilterValues(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setVisibleFields(columns.map((column) => column.field));
  }, [columns]);

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
        const rawFilterValue = filterValues[filter.id];
        const normalizedFilterValue = normalizeFilterValue(rawFilterValue, filter.type);

        if (filter.type === "checkbox") {
          if (!normalizedFilterValue) return true;
          if (typeof filter.matcher === "function") {
            return filter.matcher(row, normalizedFilterValue, filterValues);
          }
          return true;
        }

        if (!normalizedFilterValue) return true;

        if (typeof filter.matcher === "function") {
          return filter.matcher(row, normalizedFilterValue, filterValues);
        }

        if (!filter.filterKey) return true;

        const rowValue = row[filter.filterKey];
        if (filter.type === "select") {
          return String(rowValue ?? "").toLowerCase() === normalizedFilterValue.toLowerCase();
        }

        return String(rowValue ?? "").toLowerCase().includes(normalizedFilterValue.toLowerCase());
      });
    });
  }, [rows, filters, filterValues]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      return compareValues(left[sortBy], right[sortBy], sortOrder);
    });
  }, [filteredRows, sortBy, sortOrder]);

  const activeFilterChips = useMemo(() => {
    return filters
      .filter((filter) => {
        const value = filterValues[filter.id];
        if (filter.type === "checkbox") return Boolean(value);
        return normalizeFilterValue(value, filter.type) !== "";
      })
      .map((filter) => ({
        id: filter.id,
        label: filter.label,
        value: formatChipValue(filter, filterValues[filter.id]),
      }));
  }, [filters, filterValues]);

  const hasActiveFilters = activeFilterChips.length > 0;
  const displayColumns = columns.filter((column) => visibleFields.includes(column.field));
  const exportColumns = columns.map((column) => ({
    label: column.label,
    key: column.field,
  }));
  const dataSourceLabel =
    dataSource === "live"
      ? dataSourceType === "aggregated"
        ? "Aggregated data"
        : "Live data"
      : "Demo fallback data";
  const lineage = getReportLineage(reportId);

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
    setFilterValues((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleClearFilters() {
    setFilterValues(initialFilters);
  }

  function handleRemoveChip(filterId) {
    const filter = filters.find((item) => item.id === filterId);
    if (!filter) return;

    setFilterValues((previous) => ({
      ...previous,
      [filterId]: filter.type === "checkbox" ? false : "",
    }));
  }

  function handleDatePreset(presetId) {
    const presetValues = buildDatePresetValues(presetId);
    setFilterValues((previous) => {
      const next = { ...previous };
      if ("fromDate" in previous) next.fromDate = presetValues.fromDate ?? "";
      if ("toDate" in previous) next.toDate = presetValues.toDate ?? "";
      if ("date" in previous) next.date = presetValues.date ?? "";
      return next;
    });
  }

  function toggleColumn(field) {
    setVisibleFields((previous) => {
      if (previous.includes(field)) {
        if (previous.length === 1) return previous;
        return previous.filter((item) => item !== field);
      }
      return [...previous, field];
    });
  }

  function handleExportPdf() {
    if (sortedRows.length === 0) {
      showToast("No data to export. Adjust your filters.", "error");
      return;
    }
    printTable(title);
    showToast("Print preview opened.", "success");
  }

  function handleExportExcel() {
    if (sortedRows.length === 0) {
      showToast("No data to export. Adjust your filters.", "error");
      return;
    }
    exportToCSV(sortedRows, title.replace(/\s+/g, "_"), exportColumns);
    showToast("Excel file downloaded.", "success");
  }

  return (
    <div className={pageShellClass}>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("reports")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          <span aria-hidden="true">←</span>
          All Reports
        </button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  dataSource === "live"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {dataSourceLabel}
              </span>
              {loading ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  Loading…
                </span>
              ) : null}
            </div>
            <h2 className={pageTitleClass}>{title}</h2>
            <p className={pageSubtitleClass}>{subtitle}</p>
            {lineage ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setLineageOpen((previous) => !previous)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {lineageOpen ? "Hide data sources" : "Where does this data come from?"}
                </button>
                {lineageOpen ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-[12px] text-slate-600">
                    <p className="font-semibold text-slate-700">{lineage.summary}</p>
                    {lineage.inputScreen ? (
                      <p className="mt-1">
                        Primary input screen:{" "}
                        <span className="font-medium text-slate-800">{lineage.inputScreen}</span>
                      </p>
                    ) : null}
                    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                      {lineage.fields.map((item) => (
                        <li key={item.field} className="flex items-start gap-2">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              item.hasInput ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            title={item.hasInput ? "User input available" : "Computed / aggregated"}
                          />
                          <span>
                            <span className="font-medium text-slate-700">{item.label}</span>
                            {" — "}
                            {item.source}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex w-max gap-2">
            {REPORTS.map((report) => {
              const isActive = report.id === activeReportId;
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => navigate(report.legacyRouteId)}
                  className={`rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {report.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <UniformSectionCard
        title="Filters"
        subtitle="Filters apply instantly as you change them."
        rightSlot={
          <button
            type="button"
            onClick={() => setFiltersOpen((previous) => !previous)}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100"
          >
            {filtersOpen ? "Hide" : "Show"}
          </button>
        }
      >
        {filtersOpen ? (
          <div className="space-y-4">
            {showDatePresets ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Quick range
                </span>
                {DATE_RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleDatePreset(preset.id)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filters.map((filter) => (
                <UniformFormField key={filter.id} label={filter.label}>
                  {filter.type === "select" ? (
                    <ThemedSelect
                      name={filter.id}
                      value={filterValues[filter.id]}
                      onChange={handleFilterChange}
                      className={uniformInputClass}
                    >
                      <option value="">{filter.placeholder || "All"}</option>
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
                        checked={Boolean(filterValues[filter.id])}
                        onChange={handleFilterChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      {filter.checkboxLabel || "Enable"}
                    </label>
                  ) : (
                    <input
                      type={filter.type || "text"}
                      name={filter.id}
                      value={filterValues[filter.id]}
                      onChange={handleFilterChange}
                      placeholder={filter.placeholder || "Enter value"}
                      className={uniformInputClass}
                    />
                  )}
                </UniformFormField>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters ? (
                <ReportIconButton
                  icon="clear"
                  label="Clear all filters"
                  variant="secondary"
                  onClick={handleClearFilters}
                />
              ) : null}
            </div>

            {hasActiveFilters ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Active
                </span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleRemoveChip(chip.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    title={`Remove ${chip.label} filter`}
                  >
                    <span>
                      {chip.label}: {chip.value}
                    </span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </UniformSectionCard>

      <div className={tableCardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
          <div className="text-sm text-slate-600">
            Showing <span className="font-bold text-slate-800">{sortedRows.length}</span> of{" "}
            <span className="font-semibold">{rows.length}</span> records
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((previous) => !previous)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                aria-label="Choose columns"
                title="Choose columns"
              >
                <ConfigIcon size={14} />
                Columns
              </button>
              {columnsOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Visible columns
                  </p>
                  <div className="max-h-52 space-y-2 overflow-y-auto">
                    {columns.map((column) => (
                      <label
                        key={column.field}
                        className="flex items-center gap-2 text-sm font-medium text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={visibleFields.includes(column.field)}
                          onChange={() => toggleColumn(column.field)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        {column.label}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <ReportIconButton icon="print" label="Save PDF" variant="info" onClick={handleExportPdf} />
            <ReportIconButton icon="excel" label="Save Excel" variant="muted" onClick={handleExportExcel} />
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm font-medium text-slate-500">
            Loading report data…
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className={`w-full ${tableMinWidth}`} data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {displayColumns.map((column) => (
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
                  <tr
                    key={`${row.id || row.rakeNumber || "row"}-${index}`}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                  >
                    {displayColumns.map((column) => (
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
                  <td colSpan={displayColumns.length || 1} className="px-5 py-14 text-center">
                    <p className="text-[15px] font-semibold text-slate-700">{emptyMessage}</p>
                    <p className="mt-1 text-[13px] text-slate-500">
                      Try clearing filters or choosing a wider date range.
                    </p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Clear all filters
                      </button>
                    ) : null}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
