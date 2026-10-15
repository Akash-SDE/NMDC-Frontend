import { useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  ClearIcon,
  EditIcon,
  DeleteIcon,
} from "../../../components/icons";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import Pagination from "../../../components/shared/Pagination";
import { useClientPagination } from "../../../hooks/useClientPagination";
import { useColumnFilters } from "../../../hooks/useColumnFilters";
import ColumnFilterRow from "../../../components/shared/ColumnFilterRow";
import { uniformInputClass } from "../../../components/shared/UniformUi";
import { useRouter } from "../../../context/RouterContext";
import { getErrorMessage } from "../../../api/apiError";
import {
  cancelEDemand,
  createEDemand,
  listEDemands,
  listEPermits,
  updateEDemand,
  updateEPermitNumber,
} from "../../../services/edemandService";
import { fetchCustomers } from "../../../services/customerService";
import { fetchDestinations } from "../../../services/destinationService";
import { fetchOreTypes } from "../../../services/oreTypeService";
import {
  SALES_TYPE_OPTIONS,
  eDemandFormToApi,
  eDemandToForm,
} from "../../../features/edemand/utils/edemandMappers";

function asResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function toOptions(items, getLabel) {
  return items
    .filter((item) => item.status !== false)
    .map((item) => ({ id: item.id, label: getLabel(item) || `#${item.id}` }));
}

const initialDemandForm = {
  fNote: "",
  date: "",
  customer: "",
  destination: "",
  oreType: "",
  salesType: "",
};

const pageShellClass = "space-y-6 3xl:space-y-8 5xl:space-y-12";
const pageHeaderClass = "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between";
const pageTitleClass = "text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800";
const pageSubtitleClass = "mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500";
const tableCardClass = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

function formatDate(value) {
  return formatDateTimeForTable(value) || "-";
}

function compareValues(a, b, order) {
  const left = typeof a === "string" ? a.toLowerCase() : a;
  const right = typeof b === "string" ? b.toLowerCase() : b;

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

const DEMAND_FILTER_COLUMNS = [
  { key: "actions", type: "none", className: "sticky left-0 z-30 border-r border-slate-200/70 bg-white" },
  { key: "id", label: "Sl No", type: "none" },
  { key: "fNote", label: "F-Note" },
  { key: "date", label: "Date", getValue: (row) => formatDate(row.date) },
  { key: "customer", label: "Customer", type: "select" },
  { key: "destination", label: "Destination", type: "select" },
  { key: "oreType", label: "Ore Type", type: "select", className: "hidden lg:table-cell" },
  { key: "salesType", label: "Sales Type", type: "select", className: "hidden xl:table-cell" },
];

const PERMIT_FILTER_COLUMNS = [
  { key: "id", label: "Sl No", type: "none" },
  { key: "rakeNumber", label: "Rack Number" },
  { key: "customer", label: "Customer", type: "select" },
  { key: "stockpile", label: "Stockpile", type: "select", className: "hidden xl:table-cell" },
  {
    key: "quantity",
    label: "Quantity",
    className: "hidden lg:table-cell",
    getValue: (row) => Number(row.quantity ?? 0).toFixed(2),
  },
  {
    key: "completedOn",
    label: "Completed On",
    className: "hidden 2xl:table-cell",
    getValue: (row) => formatDate(row.completedOn),
  },
  { key: "ePermitNumber", label: "E-Permit Number" },
  {
    key: "railwayTransitPass",
    label: "Railway Transit Pass",
    className: "hidden 2xl:table-cell",
    getValue: (row) => row.railwayTransitPass || "-",
  },
];

export default function EDemandManagementPage() {
  const { currentRoute } = useRouter();
  const isPermitRoute = currentRoute === "manage-e-permit";

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [lookupOptions, setLookupOptions] = useState({
    customers: [],
    destinations: [],
    oreTypes: [],
  });
  const [demands, setDemands] = useState([]);
  const [demandsLoading, setDemandsLoading] = useState(true);
  const [demandSearch, setDemandSearch] = useState("");
  const [demandSortBy, setDemandSortBy] = useState("id");
  const [demandSortOrder, setDemandSortOrder] = useState("asc");
  const [demandForm, setDemandForm] = useState(initialDemandForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineDemandId, setActiveInlineDemandId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [permitData, setPermitData] = useState([]);
  const [permitsLoading, setPermitsLoading] = useState(true);
  const [savedPermitNumbers, setSavedPermitNumbers] = useState({});
  const [permitSearch, setPermitSearch] = useState("");
  const [permitSortBy, setPermitSortBy] = useState("id");
  const [permitSortOrder, setPermitSortOrder] = useState("asc");

  useEffect(() => {
    if (isPermitRoute) return undefined;

    let active = true;

    async function loadDemands() {
      setDemandsLoading(true);
      try {
        const [rows, customers, destinations, oreTypes] = await Promise.all([
          listEDemands(),
          fetchCustomers({ page_size: 1000 }),
          fetchDestinations({ page_size: 1000 }),
          fetchOreTypes({ page_size: 1000 }),
        ]);
        if (!active) return;
        setDemands(rows);
        setLookupOptions({
          customers: toOptions(asResults(customers), (item) => item.customer_name),
          destinations: toOptions(asResults(destinations), (item) => item.destination_name),
          oreTypes: toOptions(asResults(oreTypes), (item) => item.ore_type),
        });
      } catch (error) {
        if (active) setMessage(getErrorMessage(error, "Failed to load E-Demand records."));
      } finally {
        if (active) setDemandsLoading(false);
      }
    }

    loadDemands();
    return () => {
      active = false;
    };
  }, [isPermitRoute]);

  useEffect(() => {
    if (!isPermitRoute) return undefined;

    let active = true;

    async function loadPermits() {
      setPermitsLoading(true);
      try {
        const rows = await listEPermits();
        if (!active) return;
        setPermitData(rows);
        setSavedPermitNumbers(
          rows.reduce((accumulator, row) => {
            accumulator[row.id] = row.ePermitNumber;
            return accumulator;
          }, {}),
        );
      } catch (error) {
        if (active) setMessage(getErrorMessage(error, "Failed to load E-Permit register."));
      } finally {
        if (active) setPermitsLoading(false);
      }
    }

    loadPermits();
    return () => {
      active = false;
    };
  }, [isPermitRoute]);

  const demandSearchRows = useMemo(() => {
    const query = demandSearch.trim().toLowerCase();
    if (!query) return demands;

    return demands.filter((row) =>
      [
        row.id,
        row.fNote,
        row.date,
        row.customer,
        row.destination,
        row.oreType,
        row.salesType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [demands, demandSearch]);

  const demandColumnFilters = useColumnFilters(DEMAND_FILTER_COLUMNS);
  const { applyFilters: applyDemandFilters } = demandColumnFilters;

  const demandRows = useMemo(
    () =>
      [...applyDemandFilters(demandSearchRows)].sort((a, b) =>
        compareValues(a[demandSortBy], b[demandSortBy], demandSortOrder),
      ),
    [applyDemandFilters, demandSearchRows, demandSortBy, demandSortOrder],
  );

  const permitSearchRows = useMemo(() => {
    const query = permitSearch.trim().toLowerCase();
    if (!query) return permitData;

    return permitData.filter((row) =>
      [
        row.id,
        row.rakeNumber,
        row.customer,
        row.stockpile,
        row.quantity,
        row.completedOn,
        row.ePermitNumber,
        row.railwayTransitPass,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [permitData, permitSearch]);

  const permitColumnFilters = useColumnFilters(PERMIT_FILTER_COLUMNS);
  const { applyFilters: applyPermitFilters } = permitColumnFilters;

  const permitRows = useMemo(
    () =>
      [...applyPermitFilters(permitSearchRows)].sort((a, b) =>
        compareValues(a[permitSortBy], b[permitSortBy], permitSortOrder),
      ),
    [applyPermitFilters, permitSearchRows, permitSortBy, permitSortOrder],
  );

  const demandPaging = useClientPagination(demandRows, {
    resetKey: `${demandSearch}|${demandSortBy}|${demandSortOrder}|${demandColumnFilters.filterKey}`,
  });
  const permitPaging = useClientPagination(permitRows, {
    resetKey: `${permitSearch}|${permitSortBy}|${permitSortOrder}|${permitColumnFilters.filterKey}`,
  });

  const isDemandListNarrowed = Boolean(demandSearch.trim()) || demandColumnFilters.isFiltering;
  const isPermitListNarrowed = Boolean(permitSearch.trim()) || permitColumnFilters.isFiltering;

  const compactInputClass = `${uniformInputClass} h-8 px-2 text-[11px]`;

  const requiredInlineMissing =
    !demandForm.date ||
    !demandForm.customer ||
    !demandForm.destination ||
    !demandForm.oreType ||
    !demandForm.salesType;

  const inlineSaveDisabled =
    saving ||
    requiredInlineMissing ||
    (inlineActionMode === "edit" && activeInlineDemandId === null);

  const inlineActionLabel =
    inlineActionMode === "edit" ? "Save Edit" : "Add E-Demand";

  function handleDemandSort(field) {
    if (demandSortBy === field) {
      setDemandSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setDemandSortBy(field);
    setDemandSortOrder("asc");
  }

  function handlePermitSort(field) {
    if (permitSortBy === field) {
      setPermitSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setPermitSortBy(field);
    setPermitSortOrder("asc");
  }

  function handlePermitNumberChange(rowId, value) {
    setPermitData((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          ePermitNumber: value,
        };
      }),
    );
  }

  function handleSavePermitNumber(rowId) {
    const currentRow = permitData.find((row) => row.id === rowId);
    if (!currentRow) return;

    setMessage("");
    updateEPermitNumber(rowId, currentRow.ePermitNumber)
      .then((saved) => {
        setPermitData((prev) =>
          prev.map((row) => (row.id === rowId ? { ...row, ...saved } : row)),
        );
        setSavedPermitNumbers((prev) => ({
          ...prev,
          [rowId]: saved.ePermitNumber,
        }));
        setMessage(`E-Permit number saved for rake ${saved.rakeNumber}.`);
      })
      .catch((error) => {
        setMessage(getErrorMessage(error, "Unable to save E-Permit number."));
      });
  }

  function updateDemandField(field, value) {
    setDemandForm((prev) => ({ ...prev, [field]: value }));
  }

  function clearInlineDemand() {
    setDemandForm(initialDemandForm);
    setInlineActionMode("add");
    setActiveInlineDemandId(null);
  }

  async function handleInlineSaveDemand() {
    if (
      !demandForm.date ||
      !demandForm.customer ||
      !demandForm.destination ||
      !demandForm.oreType ||
      !demandForm.salesType
    ) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const payload = eDemandFormToApi(demandForm);

      if (inlineActionMode === "edit" && activeInlineDemandId !== null) {
        const currentRow = demands.find((row) => row.id === activeInlineDemandId);
        if (!payload.fnote) payload.fnote = currentRow?.fNote || null;
        const updated = await updateEDemand(activeInlineDemandId, payload);
        setDemands((prev) =>
          prev.map((row) => (row.id === activeInlineDemandId ? updated : row)),
        );
        setMessage(`E-Demand ${updated.fNote} updated.`);
      } else {
        const created = await createEDemand(payload);
        setDemands((prev) => [created, ...prev]);
        setMessage(`E-Demand ${created.fNote} added.`);
      }
      clearInlineDemand();
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to save E-Demand."));
    } finally {
      setSaving(false);
    }
  }

  function handleEditDemand(row) {
    setDemandForm(eDemandToForm(row));
    setInlineActionMode("edit");
    setActiveInlineDemandId(row.id);
  }

  function requestDemandDelete(row) {
    setDeleteTarget(row);
  }

  function closeDemandDelete() {
    setDeleteTarget(null);
  }

  async function confirmDemandDelete() {
    if (!deleteTarget) return;
    setMessage("");
    try {
      await cancelEDemand(deleteTarget.id);
      setDemands((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      if (activeInlineDemandId === deleteTarget.id) {
        clearInlineDemand();
      }
      setMessage(`E-Demand ${deleteTarget.fNote} deleted.`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to delete E-Demand."));
    } finally {
      setDeleteTarget(null);
    }
  }

  const messageBanner = message ? (
    <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
      {message}
    </p>
  ) : null;

  if (isPermitRoute) {
    return (
      <div className={pageShellClass}>
        <div className={pageHeaderClass}>
          <div>
            <h2 className={pageTitleClass}>Manage E-Permit</h2>
            <p className={pageSubtitleClass}>
              Completed loads sync here automatically. Edit E-Permit numbers — changes appear in Load Adjustment reports.
            </p>
          </div>
        </div>

        {messageBanner}

        <SearchBar
          placeholder="Search rack, customer, stockpile or permit number"
          value={permitSearch}
          onChange={setPermitSearch}
          showFilter={false}
        />

        <div className={tableCardClass}>
          <div className="overflow-x-auto">
            <table className="w-full" data-print-table>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    <SortHeaderButton
                      label="Sl No"
                      field="id"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    <SortHeaderButton
                      label="Rack Number"
                      field="rakeNumber"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    <SortHeaderButton
                      label="Customer"
                      field="customer"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden xl:table-cell">
                    <SortHeaderButton
                      label="Stockpile"
                      field="stockpile"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                    <SortHeaderButton
                      label="Quantity"
                      field="quantity"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden 2xl:table-cell">
                    <SortHeaderButton
                      label="Completed On"
                      field="completedOn"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    E-Permit Number
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden 2xl:table-cell">
                    <SortHeaderButton
                      label="Railway Transit Pass"
                      field="railwayTransitPass"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                </tr>
                <ColumnFilterRow {...permitColumnFilters.filterRowProps} rows={permitData} />
              </thead>
              <tbody>
                {permitsLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-[14px] text-slate-500"
                    >
                      Loading E-Permit register…
                    </td>
                  </tr>
                ) : permitRows.length > 0 ? (
                  permitPaging.pageItems.map((row) => {
                    const isPermitNumberDirty = (savedPermitNumbers[row.id] ?? "") !== row.ePermitNumber;

                    return (
                      <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                          {row.id}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-800 font-semibold">
                          {row.rakeNumber}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                          {row.customer}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden xl:table-cell">
                          {row.stockpile}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden lg:table-cell">
                          {row.quantity.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden 2xl:table-cell">
                          {formatDate(row.completedOn)}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                          <div className="relative">
                            <input
                              type="text"
                              value={row.ePermitNumber}
                              onChange={(event) => handlePermitNumberChange(row.id, event.target.value)}
                              className="h-9 w-full min-w-30 rounded-md border border-slate-200 bg-white px-2.5 pr-9 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 3xl:h-10 3xl:text-[14px] 5xl:h-12 5xl:text-[18px]"
                              aria-label={`E-Permit Number for row ${row.id}`}
                            />
                            {isPermitNumberDirty ? (
                              <button
                                type="button"
                                onClick={() => handleSavePermitNumber(row.id)}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                aria-label={`Save E-Permit Number for row ${row.id}`}
                                title="Save"
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
                                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                  <polyline points="17 21 17 13 7 13 7 21" />
                                  <polyline points="7 3 7 8 15 8" />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden 2xl:table-cell">
                          {row.railwayTransitPass || "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500"
                    >
                      {isPermitListNarrowed
                        ? "No E-Permit records match your search or column filters."
                        : "There is no E-Permit data to display."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {permitRows.length > 0 ? (
            <div className="px-5 pb-4">
              <Pagination {...permitPaging.paginationProps} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClass}>
      <div className={pageHeaderClass}>
        <div>
          <h2 className={pageTitleClass}>Manage E-Demand</h2>
          <p className={pageSubtitleClass}>
            Create and manage E-Demand records. Saved entries feed the E-Demand Summary report.
          </p>
        </div>
      </div>

      {messageBanner}

      <SearchBar
        placeholder="Search by f-note, customer, destination, ore type or sales type"
        value={demandSearch}
        onChange={setDemandSearch}
        showFilter={false}
      />

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="sticky left-0 z-30 border-r border-slate-200/70 bg-slate-50 px-5 py-3.5 text-center text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Sl No"
                    field="id"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="F-Note"
                    field="fNote"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Date"
                    field="date"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Customer"
                    field="customer"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Destination"
                    field="destination"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  <SortHeaderButton
                    label="Ore Type"
                    field="oreType"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden xl:table-cell">
                  <SortHeaderButton
                    label="Sales Type"
                    field="salesType"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
              </tr>
              <ColumnFilterRow {...demandColumnFilters.filterRowProps} rows={demands} />
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Inline Action Row */}
              <tr className="bg-blue-50/50 align-top [&>td]:py-4">
                <td className="sticky left-0 z-20 border-r border-slate-200/70 bg-blue-50 px-5 py-3">
                  <div className="flex flex-col items-center gap-2">
                    {inlineActionMode === "edit" ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                        Editing ID: {activeInlineDemandId}
                      </span>
                    ) : null}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleInlineSaveDemand}
                        disabled={inlineSaveDisabled}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors ${
                          inlineSaveDisabled
                            ? "cursor-not-allowed bg-slate-300"
                            : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                        }`}
                        title={inlineActionLabel}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={clearInlineDemand}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                        title="Clear form"
                      >
                        <ClearIcon />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {/* Sl No - auto managed */}
                  <div className="h-8 flex items-center text-[11px] text-slate-400 italic">
                    {inlineActionMode === "edit" ? activeInlineDemandId : "Auto"}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={demandForm.fNote}
                    onChange={(e) => updateDemandField("fNote", e.target.value)}
                    placeholder="F-Note"
                    className={compactInputClass}
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="date"
                    value={demandForm.date}
                    onChange={(e) => updateDemandField("date", e.target.value)}
                    className={compactInputClass}
                  />
                </td>
                <td className="px-5 py-3">
                  <ThemedSelect
                    value={demandForm.customer}
                    onChange={(e) => updateDemandField("customer", e.target.value)}
                    className={compactInputClass}
                  >
                    <option value="">Select Customer</option>
                    {lookupOptions.customers.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </ThemedSelect>
                </td>
                <td className="px-5 py-3">
                  <ThemedSelect
                    value={demandForm.destination}
                    onChange={(e) => updateDemandField("destination", e.target.value)}
                    className={compactInputClass}
                  >
                    <option value="">Select Destination</option>
                    {lookupOptions.destinations.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </ThemedSelect>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <ThemedSelect
                    value={demandForm.oreType}
                    onChange={(e) => updateDemandField("oreType", e.target.value)}
                    className={compactInputClass}
                  >
                    <option value="">Select Ore Type</option>
                    {lookupOptions.oreTypes.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </ThemedSelect>
                </td>
                <td className="px-5 py-3 hidden xl:table-cell">
                  <ThemedSelect
                    value={demandForm.salesType}
                    onChange={(e) => updateDemandField("salesType", e.target.value)}
                    className={compactInputClass}
                  >
                    <option value="">Select Sales Type</option>
                    {SALES_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </ThemedSelect>
                </td>
              </tr>

              {demandsLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-[14px] text-slate-500"
                  >
                    Loading E-Demand records…
                  </td>
                </tr>
              ) : demandRows.length > 0 ? (
                demandPaging.pageItems.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                      row.id === activeInlineDemandId
                        ? "bg-amber-50/50"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="px-5 py-3.5 sticky left-0 z-10 border-r border-slate-200/50 bg-white group-hover:bg-slate-50">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditDemand(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDemandDelete(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {row.id}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-slate-800">
                      {row.fNote}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {row.customer}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {row.destination}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden lg:table-cell">
                      {row.oreType}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden xl:table-cell">
                      {row.salesType}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500"
                  >
                    {isDemandListNarrowed
                      ? "No E-Demand records match your search or column filters."
                      : "There is no E-Demand data to display."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {demandRows.length > 0 ? (
          <div className="px-5 pb-4">
            <Pagination {...demandPaging.paginationProps} />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={closeDemandDelete}
        onConfirm={confirmDemandDelete}
        title="Delete E-Demand"
        message="Are you sure you want to delete this E-Demand?"
        itemName={deleteTarget ? `F-Note ${deleteTarget.fNote} - ${deleteTarget.customer}` : ""}
      />
    </div>
  );
}

