import { useMemo, useState } from "react";
import {
  UniformFormField,
  UniformPageShell,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";

const initialRakes = [
  {
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    wagonSupply: "NS/58",
    siding: "Siding-A",
    route: "R-14",
    customer: "JSW Steel",
    destination: "Visakhapatnam",
    fNote: "FN-23011",
    placementTime: "2026-03-19T09:20",
    offerTime: "2026-03-19T09:59",
    status: "Offered",
    isDisabled: false,
  },
  {
    rakeId: "RK-8812",
    rakeNumber: "R-2026-002",
    wagonSupply: "BCN/45",
    siding: "Siding-C",
    route: "R-09",
    customer: "Tata Steel",
    destination: "Bhilai",
    fNote: "FN-23022",
    placementTime: "2026-03-19T10:05",
    offerTime: "2026-03-19T10:17",
    status: "In Progress",
    isDisabled: false,
  },
  {
    rakeId: "RK-9003",
    rakeNumber: "R-2026-003",
    wagonSupply: "BOBRN/59",
    siding: "Siding-D",
    route: "R-05",
    customer: "SAIL",
    destination: "Raipur",
    fNote: "FN-23041",
    placementTime: "2026-03-19T10:11",
    offerTime: "2026-03-19T10:33",
    status: "Offered",
    isDisabled: false,
  },
];

const initialForm = {
  operatorFtp: "",
  wagonSick: "No",
  tonnage: "",
  stockpile: "",
  completionTime: "",
  clearanceTime: "",
  delayReason: "",
};

const loadingTabs = [
  { id: "table", label: "Loading Table" },
  { id: "form", label: "Loading Form" },
];

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DisableIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <line x1="12" y1="11" x2="12" y2="7" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EnableIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <polyline points="8 16 11 19 16 14" />
    </svg>
  );
}

function toDisplayDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationLabel(start, end) {
  if (!start || !end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "-";
  }
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return "Invalid";
  const minutes = Math.floor(diffMs / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function LoadingManagementPage() {
  const [rows, setRows] = useState(initialRakes);
  const [activeRakeId, setActiveRakeId] = useState(initialRakes[0].rakeId);
  const [activeTab, setActiveTab] = useState("table");
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("rakeNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [statusConfirmRakeId, setStatusConfirmRakeId] = useState("");

  const activeRake = useMemo(
    () => rows.find((item) => item.rakeId === activeRakeId),
    [rows, activeRakeId],
  );

  const statusConfirmRake = useMemo(
    () => rows.find((item) => item.rakeId === statusConfirmRakeId),
    [rows, statusConfirmRakeId],
  );

  const loadingDuration = useMemo(
    () => getDurationLabel(activeRake?.placementTime, form.completionTime),
    [activeRake?.placementTime, form.completionTime],
  );

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows;

    const q = tableSearch.toLowerCase();
    return rows.filter((row) =>
      [
        row.rakeNumber,
        row.wagonSupply,
        row.siding,
        row.route,
        row.customer,
        row.destination,
        row.fNote,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, tableSearch]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const aValue = String(a[sortBy] ?? "").toLowerCase();
      const bValue = String(b[sortBy] ?? "").toLowerCase();
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function onSelectRake(rakeId) {
    setActiveRakeId(rakeId);
    setMessage("");
    setActiveTab("form");
  }

  function toggleRakeStatus(rakeId) {
    setRows((prev) =>
      prev.map((item) =>
        item.rakeId === rakeId
          ? { ...item, isDisabled: !item.isDisabled }
          : item,
      ),
    );
  }

  function requestRakeStatusToggle(rakeId) {
    setStatusConfirmRakeId(rakeId);
  }

  function closeRakeStatusDialog() {
    setStatusConfirmRakeId("");
  }

  function confirmRakeStatusToggle() {
    if (!statusConfirmRakeId) return;
    toggleRakeStatus(statusConfirmRakeId);
    setStatusConfirmRakeId("");
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!activeRake) return;
    if (activeRake.isDisabled) {
      setMessage("Enable this rake before editing loading details.");
      return;
    }

    if (!form.operatorFtp.trim() || !form.tonnage || !form.stockpile.trim()) {
      setMessage("Please fill Operator FTP, Tonnage, and Stockpile.");
      return;
    }

    if (form.completionTime && new Date(form.completionTime) < new Date(activeRake.placementTime)) {
      setMessage("Completion time must be after placement time.");
      return;
    }

    setRows((prev) =>
      prev.map((item) =>
        item.rakeId === activeRake.rakeId
          ? {
              ...item,
              status: "Loading Updated",
            }
          : item,
      ),
    );

    setMessage("Loading status updated successfully.");
  }

  const inputClass = uniformInputClass;

  return (
    <UniformPageShell
      title="Loading Management"
      subtitle="Step 2 and Step 3 from workflow: review offered rakes and update rake loading status."
      tabs={loadingTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-4">
        {activeTab === "table" ? (
          <UniformSectionCard
            title="Rake Listing"
            subtitle="Use the Edit button in any row to open the loading form for that rake."
          >
            <SearchBar
              placeholder="Search rake number, customer, destination, or status"
              value={tableSearch}
              onChange={setTableSearch}
              showFilter={false}
            />

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-245">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Wagon Supply" field="wagonSupply" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Siding" field="siding" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Route" field="route" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Customer" field="customer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="FNote" field="fNote" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Placement Time" field="placementTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Offer Time" field="offerTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, index) => (
                    <tr
                      key={row.rakeId}
                      className={`border-t border-slate-200 text-sm ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} ${row.isDisabled ? "opacity-55" : ""}`}
                    >
                      <td className="px-3 py-2.5 font-semibold text-blue-700">{row.rakeNumber}</td>
                      <td className="px-3 py-2.5">{row.wagonSupply}</td>
                      <td className="px-3 py-2.5">{row.siding}</td>
                      <td className="px-3 py-2.5">{row.route}</td>
                      <td className="px-3 py-2.5">{row.customer}</td>
                      <td className="px-3 py-2.5">{row.destination}</td>
                      <td className="px-3 py-2.5">{row.fNote}</td>
                      <td className="px-3 py-2.5">{toDisplayDate(row.placementTime)}</td>
                      <td className="px-3 py-2.5">{toDisplayDate(row.offerTime)}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectRake(row.rakeId)}
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
                            onClick={() => requestRakeStatusToggle(row.rakeId)}
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
                    </tr>
                  ))}
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-500">
                        No loading rows found for this search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </UniformSectionCard>
        ) : null}

        {activeTab === "form" ? (
          <UniformSectionCard
            title="Update Rake Loading Status"
            subtitle={`Selected Rake: ${activeRake?.rakeNumber || "-"}`}
            rightSlot={
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Loading Duration: {loadingDuration}
              </span>
            }
          >
            {message ? (
              <p className="mb-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                {message}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <UniformFormField label="Operator FTP">
                <input
                  value={form.operatorFtp}
                  onChange={(event) => updateField("operatorFtp", event.target.value)}
                  className={inputClass}
                  placeholder="Enter FTP details"
                />
              </UniformFormField>

              <UniformFormField label="Wagon Sick?">
                <ThemedSelect
                  value={form.wagonSick}
                  onChange={(event) => updateField("wagonSick", event.target.value)}
                  className={inputClass}
                >
                  <option>No</option>
                  <option>Yes</option>
                </ThemedSelect>
              </UniformFormField>

              <UniformFormField label="Tonnage">
                <input
                  type="number"
                  value={form.tonnage}
                  onChange={(event) => updateField("tonnage", event.target.value)}
                  className={inputClass}
                  placeholder="Enter tonnage"
                />
              </UniformFormField>

              <UniformFormField label="Stockpile">
                <input
                  value={form.stockpile}
                  onChange={(event) => updateField("stockpile", event.target.value)}
                  className={inputClass}
                  placeholder="Enter stockpile"
                />
              </UniformFormField>

              <UniformFormField label="Completion Time">
                <input
                  type="datetime-local"
                  value={form.completionTime}
                  onChange={(event) => updateField("completionTime", event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>

              <UniformFormField label="Track Clearance Time">
                <input
                  type="datetime-local"
                  value={form.clearanceTime}
                  onChange={(event) => updateField("clearanceTime", event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>

              <div className="sm:col-span-2 xl:col-span-3">
                <UniformFormField label="Delay Reason">
                  <input
                    value={form.delayReason}
                    onChange={(event) => updateField("delayReason", event.target.value)}
                    className={inputClass}
                    placeholder="Optional reason if loading delayed"
                  />
                </UniformFormField>
              </div>

              <div className="sm:col-span-2 xl:col-span-3 flex justify-end">
                <button type="submit" className={uniformPrimaryButtonClass}>
                  Save Loading Update
                </button>
              </div>
            </form>
          </UniformSectionCard>
        ) : null}

        <ConfirmDialog
          isOpen={Boolean(statusConfirmRake)}
          onClose={closeRakeStatusDialog}
          onConfirm={confirmRakeStatusToggle}
          title={statusConfirmRake?.isDisabled ? "Enable Loading Row" : "Disable Loading Row"}
          message={
            statusConfirmRake?.isDisabled
              ? "Are you sure you want to enable this loading row?"
              : "Are you sure you want to disable this loading row?"
          }
          itemName={statusConfirmRake?.rakeNumber || ""}
          confirmLabel={statusConfirmRake?.isDisabled ? "Enable" : "Disable"}
          variant={statusConfirmRake?.isDisabled ? "warning" : "danger"}
        />
      </div>
    </UniformPageShell>
  );
}

