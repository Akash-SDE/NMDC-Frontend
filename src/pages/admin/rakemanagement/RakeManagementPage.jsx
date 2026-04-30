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
import {
  PlusIcon,
  EditIcon,
  DisableIcon,
  EnableIcon,
  AdjustIcon as AdjustmentIcon,
} from "../../../components/icons";
import {
  formatDateTimeForTable,
  formatTableDateTimeForInput,
  getLocalDateTimeValue,
  parseDateTimeToTimestamp as parseTableDateTimeToTimestamp,
} from "../../../utils/dateUtils";
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
const upcomingDraftRowCount = 5;

const initialOfferedRakes = [
  {
    sno: 1,
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    wagonSupply: 58,
    wagonType: "BOXNHL",
    siding: "Siding-A",
    route: "R-14",
    oreType: "LUMP",
    customer: "JSW Steel",
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
    wagonType: "BOXN",
    siding: "Siding-C",
    route: "R-09",
    oreType: "FINES",
    customer: "Tata Steel",
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
    wagonType: "BOBRN",
    siding: "Siding-D",
    route: "R-05",
    oreType: "PELLET",
    customer: "SAIL",
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

function createUpcomingRow(index = 0) {
  return {
    id: `upcoming-${Date.now()}-${index}`,
    oreType: "",
    siding: "",
    destination: "",
    placementTime: getLocalDateTimeValue(),
  };
}

function createInitialUpcomingRows(count = upcomingDraftRowCount) {
  return Array.from({ length: count }, (_, index) => createUpcomingRow(index));
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
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineRakeId, setActiveInlineRakeId] = useState("");
  const [upcomingRows, setUpcomingRows] = useState(() => createInitialUpcomingRows());
  const [upcomingMessage, setUpcomingMessage] = useState("");

  const inputClass = uniformInputClass;
  const isUpcomingPage = currentRoute === "rake-upcoming";
  const isOfferingPage = currentRoute === "rake-offering" || currentRoute === "rake-adjustment";
  const isAdjustmentPage = currentRoute === "rake-adjustment";
  const isAdjustmentFlow = routeParams?.formType === "adjustment" || currentRoute === "rake-adjustment";

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
      if (field === "offerTime") return parseTableDateTimeToTimestamp(row.offerTime);
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

  function updateUpcomingRow(rowId, field, value) {
    setUpcomingRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, [field]: value }
          : row,
      ),
    );
    setUpcomingMessage("");
  }

  function handleAddUpcomingRow() {
    setUpcomingRows((prev) => [...prev, createUpcomingRow(prev.length)]);
    setUpcomingMessage("");
  }

  function handleClearUpcomingRakes() {
    setUpcomingRows(createInitialUpcomingRows());
    setUpcomingMessage("");
  }

  function handleSaveUpcomingRakes() {
    const readyRows = upcomingRows.filter((row) =>
      [row.oreType, row.siding, row.destination, row.placementTime].every((value) =>
        String(value || "").trim(),
      ),
    );

    if (readyRows.length === 0) {
      setUpcomingMessage("Fill ore type, siding, destination, and placement time for at least one row.");
      return;
    }

    const nextSno = offeredRows.length > 0
      ? Math.max(...offeredRows.map((row) => Number(row.sno) || 0)) + 1
      : 1;
    const maxRakeIdNumber = offeredRows.reduce((max, row) => {
      const matchedDigits = String(row.rakeId || "").match(/(\d+)$/);
      const parsed = matchedDigits ? Number(matchedDigits[1]) : 0;
      return Math.max(max, Number.isNaN(parsed) ? 0 : parsed);
    }, 0);
    const year = new Date().getFullYear();
    const defaultWagonType = wagonTypeOptions[0] || "BOXN";
    const defaultRoute = routeOptions[0] || "R-14";
    const defaultCustomer = customerOptions[0] || "NMDC";

    const normalizedRows = readyRows.map((row, index) => {
      const sequence = nextSno + index;
      const rakeIdNumber = maxRakeIdNumber + index + 1;
      const offeredTime = formatDateTimeForTable(row.placementTime);

      return {
        sno: sequence,
        rakeId: `RK-${String(rakeIdNumber).padStart(4, "0")}`,
        rakeNumber: `R-${year}-${String(sequence).padStart(3, "0")}`,
        wagonSupply: 58,
        wagonType: defaultWagonType,
        siding: row.siding,
        route: defaultRoute,
        oreType: row.oreType,
        customer: defaultCustomer,
        oreTypeCustomer: `${row.oreType} / ${defaultCustomer}`,
        destination: row.destination,
        fNote: "-",
        placementTime: offeredTime,
        offerTime: offeredTime,
        adjustOfferFor: "-",
        adjustedOfferTime: "-",
        isDisabled: false,
      };
    });

    setOfferedRows((prev) => [...normalizedRows, ...prev]);
    setUpcomingRows(createInitialUpcomingRows());
    setUpcomingMessage(`${normalizedRows.length} upcoming rake(s) saved to offered list.`);
  }

  function handleOfferingSubmit(event) {
    event.preventDefault();
  }

  function handleInlineAddRake() {
    const requiredValues = [
      offeringForm.rakeId,
      offeringForm.rakeNumber,
      offeringForm.noOfWagons,
      offeringForm.wagonType,
      offeringForm.siding,
      offeringForm.route,
      offeringForm.oreType,
      offeringForm.customer,
      offeringForm.destination,
      offeringForm.offerTime,
    ];

    if (requiredValues.some((value) => !String(value || "").trim())) {
      return;
    }

    if (inlineActionMode === "adjust") {
      if (!activeInlineRakeId) return;
      handleSaveInlineAdjustment(activeInlineRakeId);
      return;
    }

    const nextSno = offeredRows.length > 0 ? Math.max(...offeredRows.map((row) => Number(row.sno) || 0)) + 1 : 1;

    const normalizedRow = {
      rakeId: offeringForm.rakeId.trim(),
      rakeNumber: offeringForm.rakeNumber.trim(),
      wagonSupply: Number(offeringForm.noOfWagons) || 0,
      wagonType: offeringForm.wagonType,
      siding: offeringForm.siding,
      route: offeringForm.route,
      oreType: offeringForm.oreType,
      customer: offeringForm.customer,
      oreTypeCustomer: `${offeringForm.oreType} / ${offeringForm.customer}`,
      destination: offeringForm.destination,
      fNote: offeringForm.fNote.trim() || "-",
      offerTime: formatDateTimeForTable(offeringForm.offerTime),
    };

    if (inlineActionMode === "add") {
      const nextRow = {
        sno: nextSno,
        ...normalizedRow,
        adjustOfferFor: "-",
        adjustedOfferTime: "-",
        isDisabled: false,
      };
      setOfferedRows((prev) => [nextRow, ...prev]);
    } else {
      setOfferedRows((prev) =>
        prev.map((row) =>
          row.rakeId === activeInlineRakeId
            ? {
                ...row,
                ...normalizedRow,
              }
            : row,
        ),
      );
    }

    setOfferingForm(initialOfferingForm);
    setAdjustOfferFor("");
    setAdjustOfferTime("");
    setInlineActionMode("add");
    setActiveInlineRakeId("");
  }

  function handleOfferingClear() {
    setOfferingForm(initialOfferingForm);
    setAdjustOfferFor("");
    setAdjustOfferTime("");
    setInlineActionMode("add");
    setActiveInlineRakeId("");
  }

  function parseWagonSupply(value) {
    if (typeof value === "number") {
      return { wagonType: "", noOfWagons: String(value) };
    }

    if (!value || typeof value !== "string") {
      return { wagonType: "", noOfWagons: "" };
    }

    if (value.includes("/")) {
      const [wagonType = "", count = ""] = value.split("/");
      return { wagonType: wagonType.trim(), noOfWagons: count.trim() };
    }

    return { wagonType: "", noOfWagons: value.trim() };
  }

  useEffect(() => {
    if (!isOfferingPage) {
      return;
    }

    const prefillRow =
      routeParams?.prefillRow ||
      (routeParams?.rakeNumber
        ? offeredRows.find((row) => row.rakeNumber === routeParams.rakeNumber)
        : null);

    if (!prefillRow) {
      setOfferingForm(initialOfferingForm);
      setAdjustOfferFor("");
      setAdjustOfferTime("");
      return;
    }

    const [legacyOreType = "", legacyCustomer = ""] = String(prefillRow.oreTypeCustomer)
      .split("/")
      .map((value) => value.trim());
    const { wagonType: parsedWagonType, noOfWagons: parsedNoOfWagons } = parseWagonSupply(prefillRow.wagonSupply);
    const oreType = prefillRow.oreType || legacyOreType;
    const customer = prefillRow.customer || legacyCustomer;
    const wagonType = prefillRow.wagonType || parsedWagonType;
    const noOfWagons =
      prefillRow.wagonSupply !== undefined && prefillRow.wagonSupply !== null
        ? String(prefillRow.wagonSupply)
        : parsedNoOfWagons;

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

    if (isAdjustmentFlow) {
      setAdjustOfferFor("");
      setAdjustOfferTime("");
    }
  }, [isOfferingPage, isAdjustmentFlow, offeredRows, routeParams]);

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

    setOfferingForm({
      rakeId: row.rakeId || "",
      rakeNumber: row.rakeNumber || "",
      wagonType: row.wagonType || "",
      noOfWagons: String(row.wagonSupply ?? ""),
      siding: row.siding || "",
      route: row.route || "",
      oreType: row.oreType || "",
      fNote: row.fNote || "",
      customer: row.customer || "",
      destination: row.destination || "",
      placementTime: "",
      offerTime: formatTableDateTimeForInput(row.offerTime),
    });
    setInlineActionMode("edit");
    setActiveInlineRakeId(row.rakeId);
    setAdjustOfferFor(row.adjustOfferFor && row.adjustOfferFor !== "-" ? row.adjustOfferFor : "");
    setAdjustOfferTime("");
  }

  function handleOpenAdjustment(row) {
    if (row.isDisabled) return;

    setOfferingForm({
      rakeId: row.rakeId || "",
      rakeNumber: row.rakeNumber || "",
      wagonType: row.wagonType || "",
      noOfWagons: String(row.wagonSupply ?? ""),
      siding: row.siding || "",
      route: row.route || "",
      oreType: row.oreType || "",
      fNote: row.fNote || "",
      customer: row.customer || "",
      destination: row.destination || "",
      placementTime: "",
      offerTime: formatTableDateTimeForInput(row.offerTime),
    });

    setInlineActionMode("adjust");
    setActiveInlineRakeId(row.rakeId);
    setAdjustOfferFor(row.adjustOfferFor && row.adjustOfferFor !== "-" ? row.adjustOfferFor : "");
    setAdjustOfferTime(
      row.adjustedOfferTime && row.adjustedOfferTime !== "-"
        ? formatTableDateTimeForInput(row.adjustedOfferTime)
        : formatTableDateTimeForInput(row.offerTime),
    );
  }

  function handleSaveInlineAdjustment(rakeId) {
    if (!adjustOfferFor || !adjustOfferTime) {
      return;
    }

    const adjustedOfferTime = formatDateTimeForTable(adjustOfferTime);

    setOfferedRows((prev) =>
      prev.map((row) =>
        row.rakeId === rakeId
          ? {
              ...row,
              adjustOfferFor,
              adjustedOfferTime,
              offerTime: adjustedOfferTime,
            }
          : row,
      ),
    );

    setAdjustOfferFor("");
    setAdjustOfferTime("");
    setInlineActionMode("add");
    setActiveInlineRakeId("");
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
    const submitDisabled =
      isAdjustmentFlow && (!adjustOfferFor || !adjustOfferTime);

    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
              {isAdjustmentFlow ? "Rake Offering Adjustment" : "Rake Offering"}
            </h2>
            <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
              {isAdjustmentFlow
                ? "Edit and adjust rake offering details in one unified form."
                : "Create or edit offering details in a dedicated form page."}
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
          subtitle={
            isAdjustmentFlow
              ? "Use the same Add Rake Offering structure with adjustment details below."
              : "Capture complete dispatch attributes with clean validation-friendly fields."
          }
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

            {isAdjustmentFlow ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Adjustment Details
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  <UniformFormField label="Adjusted Offer Time">
                    <input
                      type="datetime-local"
                      value={adjustOfferTime}
                      onChange={(event) => setAdjustOfferTime(event.target.value)}
                      className={inputClass}
                    />
                  </UniformFormField>
                </div>
              </div>
            ) : null}

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
                disabled={submitDisabled}
                className={`${uniformPrimaryButtonClass} ${submitDisabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isAdjustmentFlow ? "Save Adjustment" : "Submit Offering"}
              </button>
            </div>
          </form>
        </UniformSectionCard>
      </div>
    );
  }

  function renderOfferedTab() {
    const compactInputClass = `${inputClass} h-8 px-2 text-[11px]`;
    const requiredFieldsMissing =
      !offeringForm.rakeId ||
      !offeringForm.rakeNumber ||
      !offeringForm.noOfWagons ||
      !offeringForm.wagonType ||
      !offeringForm.siding ||
      !offeringForm.route ||
      !offeringForm.oreType ||
      !offeringForm.customer ||
      !offeringForm.destination ||
      !offeringForm.offerTime;
    const inlineAddDisabled =
      inlineActionMode === "adjust"
        ? !activeInlineRakeId || !adjustOfferFor || !adjustOfferTime
        : requiredFieldsMissing;
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
            onClick={() => navigate("rake-upcoming")}
            className={uniformPrimaryButtonClass}
          >
            Add Upcoming Rakes
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
            <table className="w-full min-w-475 whitespace-nowrap">
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
                          onClick={handleInlineAddRake}
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
                          onClick={handleOfferingClear}
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
                      value={offeringForm.rakeId}
                      onChange={(event) => updateOffering("rakeId", event.target.value)}
                      placeholder="Rake ID"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
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
                    <ThemedSelect
                      value={offeringForm.siding}
                      onChange={(event) => updateOffering("siding", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Siding</option>
                      {sidingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={offeringForm.route}
                      onChange={(event) => updateOffering("route", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Route</option>
                      {routeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={offeringForm.oreType}
                      onChange={(event) => updateOffering("oreType", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Ore Type</option>
                      {oreTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={offeringForm.customer}
                      onChange={(event) => updateOffering("customer", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Customer</option>
                      {customerOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={offeringForm.destination}
                      onChange={(event) => updateOffering("destination", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Destination</option>
                      {destinationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={offeringForm.wagonType}
                      onChange={(event) => updateOffering("wagonType", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Wagon Type</option>
                      {wagonTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
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
                      <ThemedSelect
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
                      </ThemedSelect>
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

                {sortedRows.length === 0 ? (
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
                          Try adjusting your search keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => {
                    const [offerDate = "-", offerClock = "-"] = String(row.offerTime || "-").split(" ");
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
                            {row.isDisabled ? "Inactive" : "Active"}
                          </span>
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

  function renderUpcomingRakesTable() {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-slate-800">Add Upcoming Rakes</h3>
            <p className="mt-0.5 text-[12px] text-slate-600">
              Prepare upcoming placements and push them into the offered rake list.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddUpcomingRow}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add Row
            </button>
            <button
              type="button"
              onClick={handleSaveUpcomingRakes}
              className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleClearUpcomingRakes}
              className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">SNo</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">Ore Type</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">Siding</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">Destination</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">Placement Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingRows.map((row, index) => (
                <tr key={row.id} className="bg-white [&>td]:py-2.5">
                  <td className="px-4 text-[12px] font-semibold text-slate-500">{index + 1}</td>
                  <td className="px-4">
                    <ThemedSelect
                      value={row.oreType}
                      onChange={(event) => updateUpcomingRow(row.id, "oreType", event.target.value)}
                      className={`${inputClass} h-9`}
                    >
                      <option value="">--Select--</option>
                      {oreTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-4">
                    <ThemedSelect
                      value={row.siding}
                      onChange={(event) => updateUpcomingRow(row.id, "siding", event.target.value)}
                      className={`${inputClass} h-9`}
                    >
                      <option value="">--Select--</option>
                      {sidingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-4">
                    <ThemedSelect
                      value={row.destination}
                      onChange={(event) => updateUpcomingRow(row.id, "destination", event.target.value)}
                      className={`${inputClass} h-9`}
                    >
                      <option value="">--Select--</option>
                      {destinationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-4">
                    <input
                      type="datetime-local"
                      value={row.placementTime}
                      onChange={(event) => updateUpcomingRow(row.id, "placementTime", event.target.value)}
                      className={`${inputClass} h-9`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {upcomingMessage ? (
          <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[12px] font-medium text-slate-600">
            {upcomingMessage}
          </p>
        ) : null}
      </div>
    );
  }

  function renderUpcomingPage() {
    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
              Upcoming Rakes
            </h2>
            <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
              Prepare and stage upcoming rake entries before moving them into the offered list.
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

        {renderUpcomingRakesTable()}
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
                    value={selectedRake?.customer || selectedRake?.oreTypeCustomer?.split("/")[1]?.trim() || ""}
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

  if (isUpcomingPage) {
    return renderUpcomingPage();
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


