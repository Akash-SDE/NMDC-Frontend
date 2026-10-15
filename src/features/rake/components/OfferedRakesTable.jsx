import { useMemo } from "react";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import {
  PlusIcon,
  EditIcon,
  DisableIcon,
  EnableIcon,
  AdjustIcon as AdjustmentIcon,
  LoadingIcon,
  CalendarIcon,
} from "../../../components/icons";
import {
  uniformInputClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { adjustmentReasonOptions } from "../constants/rakeConstants";
import Pagination from "../../../components/shared/Pagination";
import { useClientPagination } from "../../../hooks/useClientPagination";
import { useColumnFilters } from "../../../hooks/useColumnFilters";
import ColumnFilterRow from "../../../components/shared/ColumnFilterRow";
import ColumnSettingsMenu from "../../../components/shared/ColumnSettingsMenu";
import { useColumnVisibility } from "../../../hooks/useColumnVisibility";

const getOfferedRakeStatusLabel = (row) =>
  row.isDisabled
    ? "Cancelled"
    : row.statusDescription || (row.status != null ? `Status ${row.status}` : "Draft");

const RAKE_HIDDEN_COLS_KEY = "nmdc_rake_hidden_columns";
const OFFERED_RAKE_FILTER_COLUMNS = [
  { key: "actions", type: "none", className: "sticky left-0 z-30 border-r border-slate-200/70 bg-white" },
  { key: "rakeId", label: "Rake ID" },
  { key: "rakeNumber", label: "Rake Number", getValue: (row) => row.rakeNumber || "-" },
  { key: "siding", label: "Siding", type: "select", getValue: (row) => row.siding || "-" },
  { key: "route", label: "Route", type: "select", getValue: (row) => row.route || "-" },
  { key: "oreType", label: "Ore Type", type: "select", getValue: (row) => row.oreType || "-" },
  { key: "customer", label: "Customer", type: "select", getValue: (row) => row.customer || "-" },
  { key: "destination", label: "Destination", type: "select", getValue: (row) => row.destination || "-" },
  { key: "wagonType", label: "Wagon Type", type: "select", getValue: (row) => row.wagonType || "-" },
  { key: "wagonSupply", label: "Wagon Supply", getValue: (row) => row.wagonSupply ?? "-" },
  { key: "fNote", label: "F-Note", getValue: (row) => row.fNote || "-" },
  {
    key: "adjustOfferFor",
    label: "Offered For",
    type: "select",
    getValue: (row) => (row.adjustOfferFor && row.adjustOfferFor !== "-" ? row.adjustOfferFor : ""),
  },
  {
    key: "offerTime",
    label: "Offer Time",
    getValue: (row) => formatDateTimeForTable(row.offerTime) || String(row.offerTime || "-"),
  },
  { key: "status", label: "Status", type: "select", getValue: getOfferedRakeStatusLabel },
];

export default function OfferedRakesTable({
  sortedRows,
  search,
  setSearch,
  sortBy,
  sortOrder,
  handleSort,
  offeringForm,
  updateOffering,
  adjustOfferFor,
  setAdjustOfferFor,
  adjustOfferTime,
  setAdjustOfferTime,
  inlineActionMode,
  activeInlineRakeId,
  onInlineAddRake,
  onClearForm,
  onEditOffered,
  onOpenAdjustment,
  onLoadRedirect,
  onRequestStatusToggle,
  onNavigateUpcoming,
  upcomingDraftCount = 0,
  upcomingReadyCount = 0,
  lookupOptions = {
    sidings: [],
    routes: [],
    oreTypes: [],
    customers: [],
    destinations: [],
    wagonTypes: [],
  },
  formError = "",
  formNotice = "",
  saving = false,
}) {
  const columnFilters = useColumnFilters(OFFERED_RAKE_FILTER_COLUMNS);
  const columnVisibility = useColumnVisibility(RAKE_HIDDEN_COLS_KEY, OFFERED_RAKE_FILTER_COLUMNS, {
    onHide: (keys) => keys.forEach((k) => columnFilters.setFilter(k, "")),
  });
  const { applyFilters } = columnFilters;
  const filteredRows = useMemo(() => applyFilters(sortedRows), [applyFilters, sortedRows]);
  const { pageItems: pagedRows, paginationProps } = useClientPagination(filteredRows, {
    resetKey: `${search}|${sortBy}|${sortOrder}|${columnFilters.filterKey}`,
  });
  const inputClass = uniformInputClass;
  const compactInputClass = `${inputClass} h-8 px-2 text-[11px]`;
  const headerButtonClass =
    "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[12px] font-semibold self-end sm:self-start";
  const inlineAddDisabled = saving;
  const inlineActionLabel =
    inlineActionMode === "edit"
      ? "Save Edit"
      : inlineActionMode === "adjust"
        ? "Save Adjustment"
        : "Add Rake";
  const inlineStatusLabel =
    inlineActionMode === "edit"
      ? "Editing"
      : inlineActionMode === "adjust"
        ? "Adjusting"
        : "Draft";
  const isInlineAdjustmentMode = inlineActionMode === "adjust";
  const isInlineEditMode = inlineActionMode === "edit";
  const areMainFieldsEditable = !isInlineAdjustmentMode;
  const isOfferForEditable = isInlineAdjustmentMode;
  const isOfferTimeEditable = !isInlineEditMode;

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Rake Management
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Manage and monitor all offered rakes across routes, sidings, and destinations.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateUpcoming}
          className={`${uniformSecondaryButtonClass} ${headerButtonClass}`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          Plan Upcoming Rakes
          {upcomingDraftCount > 0 ? (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold leading-none text-slate-600">
              {upcomingReadyCount > 0
                ? `${upcomingReadyCount}/${upcomingDraftCount}`
                : upcomingDraftCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by rake id, number, route or customer..."
            value={search}
            onChange={setSearch}
            showFilter={false}
          />
        </div>
        <ColumnSettingsMenu {...columnVisibility.menuProps} />
      </div>
      <style>{columnVisibility.css}</style>

      {formError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
          {formError}
        </p>
      ) : null}
      {formNotice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          {formNotice}
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table data-colset={RAKE_HIDDEN_COLS_KEY} className="w-full min-w-475 whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="sticky left-0 z-30 border-r border-slate-200/70 bg-slate-50 px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Actions
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Rake ID" field="rakeId" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Siding" field="siding" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Route" field="route" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Ore Type" field="oreType" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Customer" field="customer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Wagon Type" field="wagonType" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Wagon Supply" field="wagonSupply" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="F-Note" field="fNote" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Offered For" field="adjustOfferFor" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Offer Time" field="offerTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
              </tr>
              <ColumnFilterRow {...columnFilters.filterRowProps} rows={sortedRows} />
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-blue-50/50 align-top [&>td]:py-4">
                <td className="sticky left-0 z-20 border-r border-slate-200/70 bg-blue-50 px-5 py-3">
                  <div className="flex flex-col items-center gap-2">
                    {inlineActionMode !== "add" ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        {inlineActionMode === "edit" ? `Editing ${activeInlineRakeId}` : `Adjusting ${activeInlineRakeId}`}
                      </span>
                    ) : null}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={onInlineAddRake}
                        disabled={inlineAddDisabled}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors ${
                          inlineAddDisabled ? "cursor-not-allowed bg-slate-300" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        aria-label={inlineActionLabel}
                        title={inlineActionLabel}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onClearForm}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100"
                        aria-label="Clear form"
                        title="Clear form"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={inlineActionMode === "add" ? "" : offeringForm.rakeId}
                    onChange={(event) => updateOffering("rakeId", event.target.value)}
                    placeholder={inlineActionMode === "add" ? "Assigned on save" : "Rake ID"}
                    className={compactInputClass}
                    disabled={inlineActionMode === "add" || !areMainFieldsEditable}
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={offeringForm.rakeNumber}
                    onChange={(event) => updateOffering("rakeNumber", event.target.value)}
                    placeholder="Rake Number"
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  />
                </td>
                <td className="px-5 py-3">
                  <select
                    value={offeringForm.siding}
                    onChange={(event) => updateOffering("siding", event.target.value)}
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  >
                    <option value="">Siding</option>
                    {lookupOptions.sidings.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={offeringForm.route}
                    onChange={(event) => updateOffering("route", event.target.value)}
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  >
                    <option value="">Route</option>
                    {lookupOptions.routes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={offeringForm.oreType}
                    onChange={(event) => updateOffering("oreType", event.target.value)}
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  >
                    <option value="">Ore Type</option>
                    {lookupOptions.oreTypes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={offeringForm.customer}
                    onChange={(event) => updateOffering("customer", event.target.value)}
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  >
                    <option value="">Customer</option>
                    {lookupOptions.customers.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={offeringForm.destination}
                    onChange={(event) => updateOffering("destination", event.target.value)}
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  >
                    <option value="">Destination</option>
                    {lookupOptions.destinations.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={offeringForm.wagonType}
                    onChange={(event) => updateOffering("wagonType", event.target.value)}
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  >
                    <option value="">Wagon Type</option>
                    {lookupOptions.wagonTypes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    value={offeringForm.noOfWagons}
                    onChange={(event) => updateOffering("noOfWagons", event.target.value)}
                    placeholder="Wagons"
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={offeringForm.fNote}
                    onChange={(event) => updateOffering("fNote", event.target.value)}
                    placeholder="F-Note"
                    className={compactInputClass}
                    disabled={!areMainFieldsEditable}
                  />
                </td>
                <td className="px-5 py-3">
                  {isOfferForEditable ? (
                    <select
                      value={adjustOfferFor}
                      onChange={(event) => setAdjustOfferFor(event.target.value)}
                      className={compactInputClass}
                    >
                      <option value="">Offer For</option>
                      {adjustmentReasonOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : isInlineEditMode ? (
                    <input
                      type="text"
                      value={adjustOfferFor || ""}
                      placeholder="-"
                      className={compactInputClass}
                      readOnly
                      disabled
                    />
                  ) : null}
                </td>
                <td className="px-5 py-3">
                  <input
                    type="datetime-local"
                    value={isInlineAdjustmentMode ? adjustOfferTime : offeringForm.offerTime}
                    onChange={(event) => {
                      if (isInlineAdjustmentMode) {
                        setAdjustOfferTime(event.target.value);
                        return;
                      }
                      updateOffering("offerTime", event.target.value);
                    }}
                    className={compactInputClass}
                    disabled={!isOfferTimeEditable}
                  />
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    {inlineStatusLabel}
                  </span>
                </td>
              </tr>

              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        className="mb-2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="text-[15px] font-semibold text-slate-400">
                        No rakes found
                      </p>
                      <p className="text-[13px] text-slate-400">
                        Try adjusting your search keyword or column filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => {
                  const formattedOfferTime =
                    formatDateTimeForTable(row.offerTime) || String(row.offerTime || "-");
                  const [offerDate = "-", offerClock = "-"] = formattedOfferTime.split(" ");
                  const oreType = row.oreType || "-";
                  const customer = row.customer || "-";
                  const offeredFor = row.adjustOfferFor && row.adjustOfferFor !== "-" ? row.adjustOfferFor : "";
                  const actionCellClass =
                    row.rakeId === activeInlineRakeId
                      ? "bg-amber-50"
                      : "bg-white group-hover:bg-slate-50";

                  return (
                    <tr
                      key={row.rakeId}
                      className={`hover:bg-slate-50/60 transition-colors group [&>td]:py-5 ${
                        row.rakeId === activeInlineRakeId ? "bg-amber-50/60" : ""
                      } ${row.isDisabled ? "opacity-70" : ""}`}
                    >
                      <td
                        className={`sticky left-0 z-20 border-r border-slate-200/70 px-5 py-4 ${actionCellClass}`}
                      >
                        <div className="flex items-center justify-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => onEditOffered(row)}
                            disabled={row.isDisabled}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              row.isDisabled
                                ? "cursor-not-allowed text-slate-300"
                                : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                            title={row.isDisabled ? "Enable to edit" : "Edit"}
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenAdjustment(row)}
                            disabled={row.isDisabled}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              row.isDisabled
                                ? "cursor-not-allowed text-slate-300"
                                : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            aria-label={row.isDisabled ? "Enable to adjust" : "Adjustment"}
                            title={row.isDisabled ? "Enable to adjust" : "Adjustment"}
                          >
                            <AdjustmentIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => onLoadRedirect(row)}
                            disabled={row.isDisabled}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              row.isDisabled
                                ? "cursor-not-allowed text-slate-300"
                                : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            aria-label={row.isDisabled ? "Enable to open load management" : "Load management"}
                            title="Load management"
                          >
                            <LoadingIcon className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRequestStatusToggle(row.rakeId)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              row.isDisabled
                                ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                                : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                            title={row.isDisabled ? "Enable" : "Disable"}
                          >
                            {row.isDisabled ? <EnableIcon /> : <DisableIcon />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-semibold text-blue-600">
                          {row.rakeId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-semibold text-slate-800">{row.rakeNumber || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{row.siding || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{row.route || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{oreType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{customer}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{row.destination || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{row.wagonType || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{row.wagonSupply ?? "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{row.fNote || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">{offeredFor}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-[13px] text-slate-700">{offerDate}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{offerClock}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${
                            row.isDisabled
                              ? "border-slate-200 bg-slate-100 text-slate-500"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row.isDisabled ? "bg-slate-400" : "bg-emerald-500"
                            }`}
                          />
                          {row.isDisabled
                            ? "Cancelled"
                            : row.statusDescription || (row.status != null ? `Status ${row.status}` : "Draft")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 pb-4">
          <Pagination {...paginationProps} />
        </div>
      </div>
    </div>
  );
}
