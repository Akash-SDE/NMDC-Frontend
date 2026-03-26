import { useMemo, useState } from "react";
import {
  UniformFormField,
  UniformPageShell,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";

const tabs = [
  { id: "offering", label: "Rake Offering" },
  { id: "offered", label: "Offered Rakes" },
  { id: "adjustment", label: "Adjustment" },
];

const wagonTypeOptions = ["BOXN", "BOXNHL", "BOBRN", "BCN"];
const sidingOptions = ["Siding-A", "Siding-B", "Siding-C", "Siding-D"];
const routeOptions = ["R-14", "R-22", "R-05", "R-09"];
const oreTypeOptions = ["LUMP", "FINES", "PELLET", "SINTER"];
const customerOptions = ["JSW Steel", "Tata Steel", "SAIL", "NMDC"];
const destinationOptions = ["Visakhapatnam", "Bhilai", "Raipur", "Nagpur"];
const adjustmentReasonOptions = [
  "Customer Priority",
  "Wagon Shortage",
  "Route Congestion",
  "Loading Delay",
];

const initialOfferedRakes = [
  {
    sno: 1,
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    wagonSupply: 58,
    siding: "Siding-A",
    route: "R-14",
    oreTypeCustomer: "LUMP / JSW Steel",
    destination: "Visakhapatnam",
    fNote: "FN-23011",
    offerTime: "19/03/2026 09:59",
    isDisabled: false,
  },
  {
    sno: 2,
    rakeId: "RK-8812",
    rakeNumber: "R-2026-002",
    wagonSupply: 45,
    siding: "Siding-C",
    route: "R-09",
    oreTypeCustomer: "FINES / Tata Steel",
    destination: "Bhilai",
    fNote: "FN-23022",
    offerTime: "19/03/2026 10:17",
    isDisabled: false,
  },
  {
    sno: 3,
    rakeId: "RK-9003",
    rakeNumber: "R-2026-003",
    wagonSupply: 59,
    siding: "Siding-D",
    route: "R-05",
    oreTypeCustomer: "PELLET / SAIL",
    destination: "Raipur",
    fNote: "FN-23041",
    offerTime: "19/03/2026 10:33",
    isDisabled: false,
  },
];

const initialOfferingForm = {
  rakeId: "",
  rakeNumber: "",
  wagonType: "",
  noOfWagons: "",
  siding: "",
  route: "",
  oreType: "",
  fNote: "",
  customer: "",
  destination: "",
  placementTime: "",
  offerTime: "",
};

function SearchIcon() {
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
      className="text-slate-400"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

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

export default function RakeManagementPage() {
  const [activeTab, setActiveTab] = useState("offering");
  const [offeredRows, setOfferedRows] = useState(initialOfferedRakes);
  const [offeringForm, setOfferingForm] = useState(initialOfferingForm);
  const [offerSearch, setOfferSearch] = useState("");
  const [sortBy, setSortBy] = useState("sno");
  const [sortOrder, setSortOrder] = useState("asc");
  const [adjustRakeNumber, setAdjustRakeNumber] = useState("");
  const [adjustOfferFor, setAdjustOfferFor] = useState("");
  const [adjustOfferTime, setAdjustOfferTime] = useState("");

  const inputClass = uniformInputClass;

  const selectedRake = useMemo(
    () => offeredRows.find((row) => row.rakeNumber === adjustRakeNumber),
    [adjustRakeNumber, offeredRows],
  );

  const filteredRows = useMemo(() => {
    if (!offerSearch.trim()) return offeredRows;

    const q = offerSearch.toLowerCase();
    return offeredRows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(q),
    );
  }, [offerSearch, offeredRows]);

  const sortedRows = useMemo(() => {
    const getComparableValue = (row, field) => {
      if (field === "status") return row.isDisabled ? "disabled" : "enabled";
      if (field === "wagonSupply" || field === "sno") {
        const parsed = Number(row[field]);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return String(row[field] ?? "").toLowerCase();
    };

    return [...filteredRows].sort((a, b) => {
      const aValue = getComparableValue(a, sortBy);
      const bValue = getComparableValue(b, sortBy);
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  function updateOffering(field, value) {
    setOfferingForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOfferingSubmit(event) {
    event.preventDefault();
  }

  function handleOfferingClear() {
    setOfferingForm(initialOfferingForm);
  }

  function parseWagonSupply(value) {
    if (typeof value === "number") {
      return { wagonType: "", noOfWagons: String(value) };
    }

    const [wagonType = "", count = ""] = String(value).split("/");
    return { wagonType, noOfWagons: count };
  }

  function handleEditOffered(row) {
    if (row.isDisabled) return;

    const [oreType = "", customer = ""] = String(row.oreTypeCustomer)
      .split("/")
      .map((value) => value.trim());
    const { wagonType, noOfWagons } = parseWagonSupply(row.wagonSupply);

    setOfferingForm({
      rakeId: row.rakeId || "",
      rakeNumber: row.rakeNumber || "",
      wagonType,
      noOfWagons,
      siding: row.siding || "",
      route: row.route || "",
      oreType,
      fNote: row.fNote || "",
      customer,
      destination: row.destination || "",
      placementTime: "",
      offerTime: "",
    });

    setActiveTab("offering");
  }

  function toggleOfferedStatus(rakeId) {
    setOfferedRows((prev) =>
      prev.map((row) =>
        row.rakeId === rakeId
          ? { ...row, isDisabled: !row.isDisabled }
          : row,
      ),
    );
  }

  function renderOfferingTab() {
    return (
      <div className="space-y-4 animate-fadeIn">
        <UniformSectionCard
          title="Rake Offering Details"
          subtitle="Capture complete dispatch attributes with clean validation-friendly fields."
        >
          <form onSubmit={handleOfferingSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <UniformFormField label="Rake ID">
                <input
                  type="text"
                  value={offeringForm.rakeId}
                  onChange={(event) => updateOffering("rakeId", event.target.value)}
                  className={inputClass}
                  placeholder="Enter Rake ID"
                />
              </UniformFormField>
              <UniformFormField label="Rake Number">
                <input
                  type="text"
                  value={offeringForm.rakeNumber}
                  onChange={(event) => updateOffering("rakeNumber", event.target.value)}
                  className={inputClass}
                  placeholder="Enter Rake Number"
                />
              </UniformFormField>
              <UniformFormField label="Wagon Type">
                <select
                  value={offeringForm.wagonType}
                  onChange={(event) => updateOffering("wagonType", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select wagon type</option>
                  {wagonTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </UniformFormField>
              <UniformFormField label="No of Wagons">
                <input
                  type="number"
                  value={offeringForm.noOfWagons}
                  onChange={(event) => updateOffering("noOfWagons", event.target.value)}
                  className={inputClass}
                  placeholder="Enter wagon count"
                />
              </UniformFormField>
              <UniformFormField label="Siding">
                <select
                  value={offeringForm.siding}
                  onChange={(event) => updateOffering("siding", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select siding</option>
                  {sidingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </UniformFormField>
              <UniformFormField label="Route">
                <select
                  value={offeringForm.route}
                  onChange={(event) => updateOffering("route", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select route</option>
                  {routeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </UniformFormField>
              <UniformFormField label="Ore Type">
                <select
                  value={offeringForm.oreType}
                  onChange={(event) => updateOffering("oreType", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select ore type</option>
                  {oreTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </UniformFormField>
              <UniformFormField label="F-Note">
                <input
                  type="text"
                  value={offeringForm.fNote}
                  onChange={(event) => updateOffering("fNote", event.target.value)}
                  className={inputClass}
                  placeholder="Enter F-Note"
                />
              </UniformFormField>
              <UniformFormField label="Customer">
                <select
                  value={offeringForm.customer}
                  onChange={(event) => updateOffering("customer", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select customer</option>
                  {customerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </UniformFormField>
              <UniformFormField label="Destination">
                <select
                  value={offeringForm.destination}
                  onChange={(event) => updateOffering("destination", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select destination</option>
                  {destinationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </UniformFormField>
              <UniformFormField label="Placement Time">
                <input
                  type="datetime-local"
                  value={offeringForm.placementTime}
                  onChange={(event) => updateOffering("placementTime", event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>
              <UniformFormField label="Offer Time">
                <input
                  type="datetime-local"
                  value={offeringForm.offerTime}
                  onChange={(event) => updateOffering("offerTime", event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleOfferingClear}
                className={uniformSecondaryButtonClass}
              >
                Clear
              </button>
              <button
                type="submit"
                className={uniformPrimaryButtonClass}
              >
                Submit Offering
              </button>
            </div>
          </form>
        </UniformSectionCard>
      </div>
    );
  }

  function renderOfferedTab() {
    return (
      <div className="space-y-4 animate-fadeIn">
        <UniformSectionCard
          title="Offered Rake Registry"
          subtitle="Track all offered rake records with searchable production context."
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={offerSearch}
                onChange={(event) => setOfferSearch(event.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="Search by rake, route, customer"
              />
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Total Records: {sortedRows.length}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-245">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeaderButton label="SNo" field="sno" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeaderButton label="Rake ID" field="rakeId" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
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
                    <SortHeaderButton label="Ore Type / Customer" field="oreTypeCustomer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeaderButton label="F-Note" field="fNote" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
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
                {sortedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-3 py-10 text-center text-sm font-medium text-slate-500"
                    >
                      No records found for this search.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row, index) => (
                    <tr
                      key={row.rakeId}
                      className={`border-t border-slate-200 text-sm text-slate-700 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } ${row.isDisabled ? "opacity-60" : ""}`}
                    >
                      <td className="px-3 py-2.5">{row.sno}</td>
                      <td className="px-3 py-2.5 font-semibold text-blue-700">{row.rakeId}</td>
                      <td className="px-3 py-2.5">{row.rakeNumber}</td>
                      <td className="px-3 py-2.5">{row.wagonSupply}</td>
                      <td className="px-3 py-2.5">{row.siding}</td>
                      <td className="px-3 py-2.5">{row.route}</td>
                      <td className="px-3 py-2.5">{row.oreTypeCustomer}</td>
                      <td className="px-3 py-2.5">{row.destination}</td>
                      <td className="px-3 py-2.5">{row.fNote}</td>
                      <td className="px-3 py-2.5">{row.offerTime}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            row.isDisabled
                              ? "bg-slate-200 text-slate-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {row.isDisabled ? "Disabled" : "Enabled"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditOffered(row)}
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
                            onClick={() => toggleOfferedStatus(row.rakeId)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </UniformSectionCard>
      </div>
    );
  }

  function renderAdjustmentTab() {
    return (
      <div className="space-y-4 animate-fadeIn">
        <UniformSectionCard
          title="Adjustment Rake Control"
          subtitle="Search an offered rake and record operational adjustments with timestamp."
        >
          <div className="mb-5 grid grid-cols-1 gap-3 border-b border-slate-100 pb-5 sm:grid-cols-[minmax(0,360px)_auto] sm:items-end">
            <UniformFormField label="Rake Number">
              <select
                value={adjustRakeNumber}
                onChange={(event) => setAdjustRakeNumber(event.target.value)}
                className={inputClass}
              >
                <option value="">Select rake number</option>
                {offeredRows.map((row) => (
                  <option key={row.rakeNumber} value={row.rakeNumber}>
                    {row.rakeNumber}
                  </option>
                ))}
              </select>
            </UniformFormField>
            <button
              type="button"
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">Rake Details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <UniformFormField label="Rake Number">
                  <input value={selectedRake?.rakeNumber || ""} readOnly className={inputClass} />
                </UniformFormField>
                <UniformFormField label="Wagon Supply">
                  <input value={selectedRake?.wagonSupply || ""} readOnly className={inputClass} />
                </UniformFormField>
                <UniformFormField label="Customer">
                  <input
                    value={selectedRake?.oreTypeCustomer?.split("/")[1]?.trim() || ""}
                    readOnly
                    className={inputClass}
                  />
                </UniformFormField>
                <UniformFormField label="F-Note">
                  <input value={selectedRake?.fNote || ""} readOnly className={inputClass} />
                </UniformFormField>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">Adjustment Details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <UniformFormField label="Offer For">
                  <select
                    value={adjustOfferFor}
                    onChange={(event) => setAdjustOfferFor(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select adjustment reason</option>
                    {adjustmentReasonOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </UniformFormField>
                <UniformFormField label="Offer Time">
                  <input
                    type="datetime-local"
                    value={adjustOfferTime}
                    onChange={(event) => setAdjustOfferTime(event.target.value)}
                    className={inputClass}
                  />
                </UniformFormField>
                <button
                  type="button"
                  className={uniformPrimaryButtonClass}
                >
                  Save Adjustment
                </button>
              </div>
            </div>
          </div>
        </UniformSectionCard>
      </div>
    );
  }

  return (
    <UniformPageShell
      title="Rake Management Workspace"
      subtitle="Manage offering, review offered data, and submit adjustments."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        {activeTab === "offering" ? renderOfferingTab() : null}
        {activeTab === "offered" ? renderOfferedTab() : null}
        {activeTab === "adjustment" ? renderAdjustmentTab() : null}
    </UniformPageShell>
  );
}
