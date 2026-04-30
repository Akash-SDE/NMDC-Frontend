import { useMemo, useState } from "react";
import {
  uniformInputClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import { DelayClockIcon, LoadAdjustIcon, PlusIcon } from "../../../components/icons";
import { useRouter } from "../../../context/RouterContext";

const wagonSickOptions = ["No", "Yes"];

const initialRows = [
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
    operatorFtp: "FTP-14",
    wagonSick: "No",
    tonnage: "3450",
    stockpile: "SP-12",
    completionTime: "2026-03-19T13:20",
    clearanceTime: "2026-03-19T13:42",
    overloadedWagons: 0,
    weightRemoved: 0,
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
    operatorFtp: "FTP-22",
    wagonSick: "Yes",
    tonnage: "2880",
    stockpile: "SP-04",
    completionTime: "",
    clearanceTime: "",
    overloadedWagons: 0,
    weightRemoved: 0,
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
    operatorFtp: "FTP-07",
    wagonSick: "No",
    tonnage: "3520",
    stockpile: "SP-18",
    completionTime: "2026-03-19T14:08",
    clearanceTime: "2026-03-19T14:24",
    overloadedWagons: 0,
    weightRemoved: 0,
    isDisabled: false,
  },
];

const initialInlineForm = {
  rakeId: "",
  rakeNumber: "",
  wagonSupply: "",
  siding: "",
  route: "",
  customer: "",
  destination: "",
  fNote: "",
  placementTime: "",
  offerTime: "",
  operatorFtp: "",
  wagonSick: "No",
  tonnage: "",
  stockpile: "",
  completionTime: "",
  clearanceTime: "",
  overloadedWagons: "",
  weightRemoved: "",
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

function ClearIcon() {
  return (
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
  );
}

function formatDateTimeForTable(value) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function parseDateTimeToTimestamp(value) {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function getStatusMeta(row) {
  if (row.isDisabled) {
    return {
      label: "Inactive",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
      dotClass: "bg-slate-400",
    };
  }

  if (row.completionTime) {
    return {
      label: "Completed",
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dotClass: "bg-emerald-500",
    };
  }

  if (row.operatorFtp || row.tonnage || row.stockpile) {
    return {
      label: "In Progress",
      badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
      dotClass: "bg-blue-500",
    };
  }

  return {
    label: "Pending",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  };
}

export default function LoadingManagementPage() {
  const { navigate } = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("rakeNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [inlineForm, setInlineForm] = useState(initialInlineForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineRakeId, setActiveInlineRakeId] = useState("");
  const [statusConfirmRakeId, setStatusConfirmRakeId] = useState("");
  const [message, setMessage] = useState("");
  const [rowEdits, setRowEdits] = useState({});
  const [activeAdjustmentRakeId, setActiveAdjustmentRakeId] = useState("");

  const compactInputClass = `${uniformInputClass} h-8 px-2 text-[11px]`;

  function handleRowEditChange(rakeId, field, value) {
    setRowEdits((prev) => ({
      ...prev,
      [rakeId]: {
        ...prev[rakeId],
        [field]: value,
      },
    }));
    setMessage("");
  }

  function handleSaveRowEdits(rakeId) {
    const edits = rowEdits[rakeId];
    if (!edits) return false;

    const overloadedWagons = edits.overloadedWagons !== undefined && edits.overloadedWagons !== "" ? Number(edits.overloadedWagons) : undefined;
    const weightRemoved = edits.weightRemoved !== undefined && edits.weightRemoved !== "" ? Number(edits.weightRemoved) : undefined;

    if (overloadedWagons !== undefined && (Number.isNaN(overloadedWagons) || overloadedWagons < 0)) {
      setMessage("No. of Overloaded Wagons must be a valid positive number.");
      return false;
    }

    if (weightRemoved !== undefined && (Number.isNaN(weightRemoved) || weightRemoved < 0)) {
      setMessage("Weight Removed must be a valid positive number.");
      return false;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.rakeId === rakeId
          ? {
              ...row,
              ...(overloadedWagons !== undefined && { overloadedWagons }),
              ...(weightRemoved !== undefined && { weightRemoved }),
            }
          : row,
      ),
    );

    setRowEdits((prev) => {
      const next = { ...prev };
      delete next[rakeId];
      return next;
    });

    setMessage(`Updated wagons and weight for rake ${rakeId}`);
    return true;
  }

  function handleAdjustmentAction(row) {
    if (row.isDisabled) {
      setMessage("Enable this row before making load adjustments.");
      return;
    }

    if (activeAdjustmentRakeId === row.rakeId) {
      if (!rowEdits[row.rakeId]) {
        setActiveAdjustmentRakeId("");
        return;
      }

      const saved = handleSaveRowEdits(row.rakeId);
      if (saved) {
        setActiveAdjustmentRakeId("");
      }
      return;
    }

    setActiveAdjustmentRakeId(row.rakeId);
    setMessage("");
  }

  function handleDelayRedirect(row) {
    if (!row?.rakeNumber) return;

    navigate("delay-management", {
      delayPrefill: {
        rakeNumber: row.rakeNumber,
      },
    });
  }

  const statusConfirmRake = useMemo(
    () => rows.find((item) => item.rakeId === statusConfirmRakeId),
    [rows, statusConfirmRakeId],
  );

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows;

    const q = tableSearch.toLowerCase();
    return rows.filter((row) => {
      const status = getStatusMeta(row).label;
      return [
        row.rakeId,
        row.rakeNumber,
        row.wagonSupply,
        row.siding,
        row.route,
        row.customer,
        row.destination,
        row.fNote,
        row.operatorFtp,
        row.stockpile,
        row.overloadedWagons,
        row.weightRemoved,
        status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, tableSearch]);

  const sortedRows = useMemo(() => {
    const getComparableValue = (row, field) => {
      if (
        field === "placementTime" ||
        field === "offerTime" ||
        field === "completionTime" ||
        field === "clearanceTime"
      ) {
        return parseDateTimeToTimestamp(row[field]);
      }

      if (field === "tonnage" || field === "overloadedWagons" || field === "weightRemoved") {
        const parsed = Number(row[field]);
        return Number.isNaN(parsed) ? 0 : parsed;
      }

      if (field === "status") {
        return getStatusMeta(row).label.toLowerCase();
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

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function updateInline(field, value) {
    setInlineForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  }

  function clearInlineForm() {
    setInlineForm(initialInlineForm);
    setInlineActionMode("add");
    setActiveInlineRakeId("");
    setMessage("");
  }

  function validateInlineForm() {
    const requiredFields = [
      inlineForm.rakeId,
      inlineForm.rakeNumber,
      inlineForm.wagonSupply,
      inlineForm.siding,
      inlineForm.route,
      inlineForm.customer,
      inlineForm.destination,
      inlineForm.offerTime,
      inlineForm.operatorFtp,
      inlineForm.tonnage,
      inlineForm.stockpile,
    ];

    if (requiredFields.some((field) => !String(field || "").trim())) {
      return "Please fill all required loading fields before saving.";
    }

    if (
      inlineForm.placementTime &&
      inlineForm.completionTime &&
      parseDateTimeToTimestamp(inlineForm.completionTime) <
        parseDateTimeToTimestamp(inlineForm.placementTime)
    ) {
      return "Completion time must be after placement time.";
    }

    if (
      inlineForm.completionTime &&
      inlineForm.clearanceTime &&
      parseDateTimeToTimestamp(inlineForm.clearanceTime) <
        parseDateTimeToTimestamp(inlineForm.completionTime)
    ) {
      return "Track clearance time must be after completion time.";
    }

    const normalizedRakeId = inlineForm.rakeId.trim();
    const duplicateRake = rows.some(
      (row) =>
        row.rakeId.toLowerCase() === normalizedRakeId.toLowerCase() &&
        row.rakeId !== activeInlineRakeId,
    );

    if (duplicateRake) {
      return "Rake ID already exists. Use a different Rake ID.";
    }

    if (inlineForm.overloadedWagons && (Number.isNaN(Number(inlineForm.overloadedWagons)) || Number(inlineForm.overloadedWagons) < 0)) {
      return "No. of Overloaded Wagons must be a valid positive number.";
    }

    if (inlineForm.weightRemoved && (Number.isNaN(Number(inlineForm.weightRemoved)) || Number(inlineForm.weightRemoved) < 0)) {
      return "Weight Removed must be a valid positive number.";
    }

    return "";
  }

  function handleInlineSave() {
    const validationMessage = validateInlineForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    const normalizedRow = {
      rakeId: inlineForm.rakeId.trim(),
      rakeNumber: inlineForm.rakeNumber.trim(),
      wagonSupply: inlineForm.wagonSupply.trim(),
      siding: inlineForm.siding.trim(),
      route: inlineForm.route.trim(),
      customer: inlineForm.customer.trim(),
      destination: inlineForm.destination.trim(),
      fNote: inlineForm.fNote.trim() || "-",
      placementTime: inlineForm.placementTime,
      offerTime: inlineForm.offerTime,
      operatorFtp: inlineForm.operatorFtp.trim(),
      wagonSick: inlineForm.wagonSick,
      tonnage: inlineForm.tonnage,
      stockpile: inlineForm.stockpile.trim(),
      completionTime: inlineForm.completionTime,
      clearanceTime: inlineForm.clearanceTime,
      overloadedWagons: inlineForm.overloadedWagons !== "" ? Number(inlineForm.overloadedWagons) : 0,
      weightRemoved: inlineForm.weightRemoved !== "" ? Number(inlineForm.weightRemoved) : 0,
    };

    if (inlineActionMode === "edit") {
      setRows((prev) =>
        prev.map((item) =>
          item.rakeId === activeInlineRakeId
            ? {
                ...item,
                ...normalizedRow,
              }
            : item,
        ),
      );
      setMessage("Loading row updated successfully.");
    } else {
      const nextRow = {
        ...normalizedRow,
        isDisabled: false,
      };

      setRows((prev) => [nextRow, ...prev]);
      setMessage("Loading row added successfully.");
    }

    setInlineForm(initialInlineForm);
    setInlineActionMode("add");
    setActiveInlineRakeId("");
  }

  function handleEditRow(row) {
    if (row.isDisabled) {
      setMessage("Enable this row before editing loading details.");
      return;
    }

    setInlineForm({
      rakeId: row.rakeId,
      rakeNumber: row.rakeNumber,
      wagonSupply: row.wagonSupply,
      siding: row.siding,
      route: row.route,
      customer: row.customer,
      destination: row.destination,
      fNote: row.fNote === "-" ? "" : row.fNote,
      placementTime: row.placementTime,
      offerTime: row.offerTime,
      operatorFtp: row.operatorFtp || "",
      wagonSick: row.wagonSick || "No",
      tonnage: row.tonnage || "",
      stockpile: row.stockpile || "",
      completionTime: row.completionTime || "",
      clearanceTime: row.clearanceTime || "",
      overloadedWagons: row.overloadedWagons !== undefined ? row.overloadedWagons : "",
      weightRemoved: row.weightRemoved !== undefined ? row.weightRemoved : "",
    });
    setInlineActionMode("edit");
    setActiveInlineRakeId(row.rakeId);
    setMessage("");
  }

  function requestRakeStatusToggle(rakeId) {
    setStatusConfirmRakeId(rakeId);
  }

  function closeRakeStatusDialog() {
    setStatusConfirmRakeId("");
  }

  function confirmRakeStatusToggle() {
    if (!statusConfirmRakeId) return;

    setRows((prev) =>
      prev.map((item) =>
        item.rakeId === statusConfirmRakeId
          ? { ...item, isDisabled: !item.isDisabled }
          : item,
      ),
    );
    setStatusConfirmRakeId("");
  }

  const requiredInlineMissing = [
    inlineForm.rakeId,
    inlineForm.rakeNumber,
    inlineForm.wagonSupply,
    inlineForm.siding,
    inlineForm.route,
    inlineForm.customer,
    inlineForm.destination,
    inlineForm.offerTime,
    inlineForm.operatorFtp,
    inlineForm.tonnage,
    inlineForm.stockpile,
  ].some((field) => !String(field || "").trim());

  const inlineSaveDisabled =
    requiredInlineMissing ||
    (inlineActionMode === "edit" && !activeInlineRakeId);

  const inlineSaveLabel =
    inlineActionMode === "edit" ? "Save Edit" : "Add Loading";

  const inlineStatusLabel = inlineActionMode === "edit" ? "Editing" : "Draft";

  return (
    <>
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Loading Management
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Update loading operations using an inline worksheet aligned with the Rake Management workflow.
          </p>
        </div>

        {message ? (
          <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            {message}
          </p>
        ) : null}

        <SearchBar
          placeholder="Search by rake, route, customer, stockpile, or status..."
          value={tableSearch}
          onChange={setTableSearch}
          showFilter={false}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-650 whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Actions
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake ID" field="rakeId" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Wagon Supply" field="wagonSupply" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Siding" field="siding" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Route" field="route" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Customer" field="customer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="F-Note" field="fNote" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Placement Time" field="placementTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Offer Time" field="offerTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Operator FTP" field="operatorFtp" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Wagon Sick" field="wagonSick" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Tonnage" field="tonnage" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Stockpile" field="stockpile" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Completion Time" field="completionTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Clearance Time" field="clearanceTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="No. of Overloaded Wagons" field="overloadedWagons" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Weight Removed" field="weightRemoved" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-blue-50/50 align-top [&>td]:py-4">
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-center gap-2">
                      {inlineActionMode === "edit" ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                          Editing {activeInlineRakeId}
                        </span>
                      ) : null}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleInlineSave}
                          disabled={inlineSaveDisabled}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors ${
                            inlineSaveDisabled
                              ? "cursor-not-allowed bg-slate-300"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          aria-label={inlineSaveLabel}
                          title={inlineSaveLabel}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={clearInlineForm}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100"
                          aria-label="Clear form"
                          title="Clear form"
                        >
                          <ClearIcon />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.rakeId}
                      onChange={(event) => updateInline("rakeId", event.target.value)}
                      placeholder="Rake ID"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.rakeNumber}
                      onChange={(event) => updateInline("rakeNumber", event.target.value)}
                      placeholder="Rake Number"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.wagonSupply}
                      onChange={(event) => updateInline("wagonSupply", event.target.value)}
                      placeholder="Type/Count"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.siding}
                      onChange={(event) => updateInline("siding", event.target.value)}
                      placeholder="Siding"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.route}
                      onChange={(event) => updateInline("route", event.target.value)}
                      placeholder="Route"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.customer}
                      onChange={(event) => updateInline("customer", event.target.value)}
                      placeholder="Customer"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.destination}
                      onChange={(event) => updateInline("destination", event.target.value)}
                      placeholder="Destination"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.fNote}
                      onChange={(event) => updateInline("fNote", event.target.value)}
                      placeholder="F-Note"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.placementTime}
                      onChange={(event) => updateInline("placementTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.offerTime}
                      onChange={(event) => updateInline("offerTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.operatorFtp}
                      onChange={(event) => updateInline("operatorFtp", event.target.value)}
                      placeholder="Operator FTP"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={inlineForm.wagonSick}
                      onChange={(event) => updateInline("wagonSick", event.target.value)}
                      className={compactInputClass}
                    >
                      {wagonSickOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      value={inlineForm.tonnage}
                      onChange={(event) => updateInline("tonnage", event.target.value)}
                      placeholder="Tonnage"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.stockpile}
                      onChange={(event) => updateInline("stockpile", event.target.value)}
                      placeholder="Stockpile"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.completionTime}
                      onChange={(event) => updateInline("completionTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.clearanceTime}
                      onChange={(event) => updateInline("clearanceTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      value={inlineForm.overloadedWagons}
                      onChange={(event) => updateInline("overloadedWagons", event.target.value)}
                      placeholder="Wagons"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      step="any"
                      value={inlineForm.weightRemoved}
                      onChange={(event) => updateInline("weightRemoved", event.target.value)}
                      placeholder="Weight"
                      className={compactInputClass}
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
                    <td colSpan={20} className="px-5 py-12 text-center">
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
                          No loading rows found
                        </p>
                        <p className="text-[13px] text-slate-400">
                          Try adjusting your search keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => {
                    const statusMeta = getStatusMeta(row);
                    const isAdjusting = activeAdjustmentRakeId === row.rakeId;
                    const adjustmentEditable = isAdjusting && !row.isDisabled;
                    const overloadedDisplayValue =
                      isAdjusting && rowEdits[row.rakeId]?.overloadedWagons !== undefined
                        ? rowEdits[row.rakeId].overloadedWagons
                        : row.overloadedWagons || "";
                    const weightRemovedDisplayValue =
                      isAdjusting && rowEdits[row.rakeId]?.weightRemoved !== undefined
                        ? rowEdits[row.rakeId].weightRemoved
                        : row.weightRemoved || "";

                    return (
                      <tr
                        key={row.rakeId}
                        className={`hover:bg-slate-50/60 transition-colors group [&>td]:py-5 ${
                          row.rakeId === activeInlineRakeId ? "bg-amber-50/60" : ""
                        } ${row.isDisabled ? "opacity-70" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEditRow(row)}
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
                              onClick={() => handleAdjustmentAction(row)}
                              disabled={row.isDisabled}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled
                                  ? "cursor-not-allowed text-slate-300"
                                  : isAdjusting
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                              title={isAdjusting ? "Save adjustment" : "Start adjustment"}
                            >
                              <LoadAdjustIcon className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelayRedirect(row)}
                              disabled={row.isDisabled}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled
                                  ? "cursor-not-allowed text-slate-300"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                              title="Delay management"
                            >
                              <DelayClockIcon className="h-4 w-4" />
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
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-semibold text-blue-600">{row.rakeId}</span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.rakeNumber || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.wagonSupply || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.siding || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.route || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.customer || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.destination || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.fNote || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.placementTime)}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.offerTime)}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.operatorFtp || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.wagonSick || "No"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.tonnage || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.stockpile || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.completionTime)}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.clearanceTime)}</td>
                        <td className="px-5 py-3">
                          <input
                            type="number"
                            value={overloadedDisplayValue}
                            onChange={(e) => handleRowEditChange(row.rakeId, "overloadedWagons", e.target.value)}
                            placeholder="0"
                            className={`${compactInputClass} w-20`}
                            disabled={!adjustmentEditable}
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="number"
                            step="any"
                            value={weightRemovedDisplayValue}
                            onChange={(e) => handleRowEditChange(row.rakeId, "weightRemoved", e.target.value)}
                            placeholder="0.0"
                            className={`${compactInputClass} w-24`}
                            disabled={!adjustmentEditable}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${statusMeta.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                            {statusMeta.label}
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
            <p>
              Showing <span className="font-semibold text-slate-700">{sortedRows.length}</span> record(s)
            </p>
          </div>
        </div>
      </div>

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
    </>
  );
}