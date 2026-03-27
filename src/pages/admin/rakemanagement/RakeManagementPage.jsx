import { useEffect, useMemo, useState } from "react";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import { useRouter } from "../../../context/RouterContext";
import SearchBar from "../../../components/shared/SearchBar";
import { PlusIcon } from "../../../components/icons";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";

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

function AdjustmentIcon() {
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
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

export default function RakeManagementPage() {
  const { navigate, currentRoute, routeParams } = useRouter();
  const [offeredRows, setOfferedRows] = useState(initialOfferedRakes);
  const [offeringForm, setOfferingForm] = useState(initialOfferingForm);
  const [offerSearch, setOfferSearch] = useState("");
  const [sortBy, setSortBy] = useState("sno");
  const [sortOrder, setSortOrder] = useState("asc");
  const [adjustRakeNumber, setAdjustRakeNumber] = useState("");
  const [adjustOfferFor, setAdjustOfferFor] = useState("");
  const [adjustOfferTime, setAdjustOfferTime] = useState("");
  const [adjustSearchRakeNumber, setAdjustSearchRakeNumber] = useState("");
  const [statusConfirmRakeId, setStatusConfirmRakeId] = useState("");

  const inputClass = uniformInputClass;
  const isOfferingPage = currentRoute === "rake-offering";
  const isAdjustmentPage = currentRoute === "rake-adjustment";

  const selectedRake = useMemo(
    () => offeredRows.find((row) => row.rakeNumber === adjustRakeNumber),
    [adjustRakeNumber, offeredRows],
  );

  const statusConfirmRake = useMemo(
    () => offeredRows.find((row) => row.rakeId === statusConfirmRakeId),
    [offeredRows, statusConfirmRakeId],
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

  useEffect(() => {
    if (!isOfferingPage) {
      return;
    }

    const prefillRow = routeParams?.prefillRow;

    if (!prefillRow) {
      setOfferingForm(initialOfferingForm);
      return;
    }

    const [oreType = "", customer = ""] = String(prefillRow.oreTypeCustomer)
      .split("/")
      .map((value) => value.trim());
    const { wagonType, noOfWagons } = parseWagonSupply(prefillRow.wagonSupply);

    setOfferingForm({
      rakeId: prefillRow.rakeId || "",
      rakeNumber: prefillRow.rakeNumber || "",
      wagonType,
      noOfWagons,
      siding: prefillRow.siding || "",
      route: prefillRow.route || "",
      oreType,
      fNote: prefillRow.fNote || "",
      customer,
      destination: prefillRow.destination || "",
      placementTime: "",
      offerTime: "",
    });
  }, [isOfferingPage, routeParams]);

  useEffect(() => {
    if (!isAdjustmentPage) {
      return;
    }

    const selectedRakeNumber = routeParams?.rakeNumber || "";
    setAdjustSearchRakeNumber(selectedRakeNumber);
    setAdjustRakeNumber(selectedRakeNumber);
    setAdjustOfferFor("");
    setAdjustOfferTime("");
  }, [isAdjustmentPage, routeParams]);

  function handleEditOffered(row) {
    if (row.isDisabled) return;

    navigate("rake-offering", { prefillRow: row });
  }

  function handleOpenAdjustment(row) {
    if (row.isDisabled) return;

    navigate("rake-adjustment", { rakeNumber: row.rakeNumber });
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

  function requestOfferedStatusToggle(rakeId) {
    setStatusConfirmRakeId(rakeId);
  }

  function closeOfferedStatusDialog() {
    setStatusConfirmRakeId("");
  }

  function confirmOfferedStatusToggle() {
    if (!statusConfirmRakeId) return;
    toggleOfferedStatus(statusConfirmRakeId);
    setStatusConfirmRakeId("");
  }

  function renderOfferingTab() {
    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
              Rake Offering
            </h2>
            <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
              Create or edit offering details in a dedicated form page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("rake-management")}
            className={uniformSecondaryButtonClass}
          >
            Back to Rake Management
          </button>
        </div>

        <UniformSectionCard
          title="Rake Offering Details"
          subtitle="Capture complete dispatch attributes with clean validation-friendly fields."
        >
          <form onSubmit={handleOfferingSubmit} className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Rake and Movement Details
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <ThemedSelect
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
                  </ThemedSelect>
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
                  <ThemedSelect
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
                  </ThemedSelect>
                </UniformFormField>
                <UniformFormField label="Route">
                  <ThemedSelect
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
                  </ThemedSelect>
                </UniformFormField>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Customer and Timing Details
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <UniformFormField label="Ore Type">
                  <ThemedSelect
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
                  </ThemedSelect>
                </UniformFormField>
                <UniformFormField label="Customer">
                  <ThemedSelect
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
                  </ThemedSelect>
                </UniformFormField>
                <UniformFormField label="Destination">
                  <ThemedSelect
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
                  </ThemedSelect>
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
            onClick={() => navigate("rake-offering")}
            className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-blue-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-all self-start active:scale-[0.98]"
          >
            <PlusIcon className="3xl:w-5 3xl:h-5" />
            <span>Add Rake</span>
          </button>
        </div>

        <SearchBar
          placeholder="Search by rake id, number, route or customer..."
          value={offerSearch}
          onChange={setOfferSearch}
          showFilter={false}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-280">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake ID" field="rakeId" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Siding / Route" field="siding" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Ore / Customer" field="oreTypeCustomer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Offer Time" field="offerTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
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
                          Try adjusting your search keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => {
                    const [oreType = "-", customer = "-"] = String(row.oreTypeCustomer)
                      .split("/")
                      .map((value) => value.trim());

                    return (
                      <tr
                        key={row.rakeId}
                        className={`hover:bg-slate-50/60 transition-colors group ${row.isDisabled ? "opacity-70" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-semibold text-blue-600">
                            {row.rakeId}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800">{row.rakeNumber}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">F-Note: {row.fNote}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[13px] font-medium text-slate-700">{row.siding}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Route: {row.route}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[13px] font-medium text-slate-700">{customer}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Ore: {oreType}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[13px] text-slate-600">{row.destination}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[13px] text-slate-700">{row.offerTime.split(" ")[0]}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{row.offerTime.split(" ")[1]}</p>
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
                            {row.isDisabled ? "Inactive" : "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
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
                              onClick={() => handleOpenAdjustment(row)}
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
                              onClick={() => requestOfferedStatusToggle(row.rakeId)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-[13px] text-slate-500">
            Showing <span className="font-semibold text-slate-700">{sortedRows.length}</span> record(s)
          </div>
        </div>
      </div>
    );
  }

  function renderAdjustmentPage() {
    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
              Rake Adjustment
            </h2>
            <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
              Adjust offered rake schedules and reasons in a dedicated page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("rake-management")}
            className={uniformSecondaryButtonClass}
          >
            Back to Rake Management
          </button>
        </div>

        <UniformSectionCard
          title="Adjustment Rake Control"
          subtitle="Search an offered rake and record operational adjustments with timestamp."
        >
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,320px)_max-content] sm:items-end">
              <UniformFormField label="Rake Number">
                <ThemedSelect
                  value={adjustSearchRakeNumber}
                  onChange={(event) => setAdjustSearchRakeNumber(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select rake number</option>
                  {offeredRows.map((row) => (
                    <option key={row.rakeNumber} value={row.rakeNumber}>
                      {row.rakeNumber}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
              <button
                type="button"
                onClick={() => setAdjustRakeNumber(adjustSearchRakeNumber)}
                className={`${uniformPrimaryButtonClass} h-10 w-full sm:w-auto sm:min-w-32 sm:justify-self-start`}
              >
                Search
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Rake Details</p>
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

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Adjustment Details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <UniformFormField label="Offer For">
                  <ThemedSelect
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
                  </ThemedSelect>
                </UniformFormField>
                <UniformFormField label="Offer Time">
                  <input
                    type="datetime-local"
                    value={adjustOfferTime}
                    onChange={(event) => setAdjustOfferTime(event.target.value)}
                    className={inputClass}
                  />
                </UniformFormField>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustOfferFor("");
                    setAdjustOfferTime("");
                  }}
                  className={uniformSecondaryButtonClass}
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={!selectedRake || !adjustOfferFor || !adjustOfferTime}
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

  if (!isOfferingPage && !isAdjustmentPage) {
    return (
      <>
        {renderOfferedTab()}
        <ConfirmDialog
          isOpen={Boolean(statusConfirmRake)}
          onClose={closeOfferedStatusDialog}
          onConfirm={confirmOfferedStatusToggle}
          title={statusConfirmRake?.isDisabled ? "Enable Rake" : "Disable Rake"}
          message={
            statusConfirmRake?.isDisabled
              ? "Are you sure you want to enable this rake?"
              : "Are you sure you want to disable this rake?"
          }
          itemName={statusConfirmRake?.rakeNumber || ""}
          confirmLabel={statusConfirmRake?.isDisabled ? "Enable" : "Disable"}
          variant={statusConfirmRake?.isDisabled ? "warning" : "danger"}
        />
      </>
    );
  }

  return isOfferingPage ? renderOfferingTab() : renderAdjustmentPage();
}


