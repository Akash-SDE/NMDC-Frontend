import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  uniformInputClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import {
  DelayIcon,
  AdjustIcon as AdjustmentIcon,
  PlusIcon,
  EditIcon,
  DeleteIcon,
  ClearIcon,
  DisableIcon,
  EnableIcon,
} from "../../../components/icons";
import {
  formatDateTimeForTable,
  formatTableDateTimeForInput,
  getLocalDateTimeValue,
  parseDateTimeToTimestamp,
} from "../../../utils/dateUtils";
import { useRouter } from "../../../context/RouterContext";
import { delayPathForLoading, ROUTES } from "../../../constants/routes";
import { LOADING_STATUS } from "../../../constants/approval";
import { fetchLoadingRecords, fetchLoadingById, saveLoadingRecord } from "../../../store/slices/loadingSlice";
import { fetchRakeById } from "../../../store/slices/rakeSlice";
import {
  completeLoadingAndRequestApproval,
  fetchApprovalRequests,
} from "../../../store/slices/approvalSlice";
import { toInputDateTime } from "../../../types/transforms";
import {
  ApprovalStatusBadge,
  ApprovalTrackerModal,
  ViewTrackerButton,
} from "../../../components/common/ApprovalTracker";
import {
  countPendingApprovals,
  deriveLoadingStatus,
} from "../../../constants/approval";
import { getLoadingStatusMeta } from "../../../utils/approvalUtils";

const wagonSickOptions = ["No", "Yes"];
const manualLoadingTrackOptions = [
  { value: "", label: "None" },
  { value: "R3", label: "Manual R3" },
  { value: "R4", label: "Manual R4" },
];

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
  manualLoadingTrack: "",
  tonnage: "",
  stockpile: "",
  completionTime: "",
  clearanceTime: "",
  overloadedWagons: "",
  weightRemoved: "",
};

function mapStoreRow(item) {
  return {
    ...item,
    placementTime: item.placementTime ? toInputDateTime(item.placementTime) : "",
    offerTime: item.offerTime ? toInputDateTime(item.offerTime) : "",
    completionTime: item.completionTime ? toInputDateTime(item.completionTime) : "",
    clearanceTime: item.clearanceTime ? toInputDateTime(item.clearanceTime) : "",
  };
}

function getRowStatusMeta(row, approval) {
  if (row.isDisabled) {
    return {
      label: "Inactive",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
      dotClass: "bg-slate-400",
    };
  }
  return getLoadingStatusMeta(deriveLoadingStatus(row, approval));
}

function compareValues(a, b, order) {
  const left = typeof a === "string" ? a.toLowerCase() : a;
  const right = typeof b === "string" ? b.toLowerCase() : b;

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

export default function LoadingManagementPage() {
  const dispatch = useDispatch();
  const { navigate } = useRouter();
  const [searchParams] = useSearchParams();
  const rakeIdParam = searchParams.get("rakeId");
  const loadingIdParam = searchParams.get("loadingId");
  const storeItems = useSelector((state) => state.loading.items);
  const approvalItems = useSelector((state) => state.approvals.items);
  const selectedRake = useSelector((state) => state.rakes.selected);
  const selectedLoading = useSelector((state) => state.loading.selected);
  const [rows, setRows] = useState(initialRows);
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("rakeNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [inlineForm, setInlineForm] = useState(initialInlineForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineRakeId, setActiveInlineRakeId] = useState("");
  const [statusConfirmRakeId, setStatusConfirmRakeId] = useState("");
  const [message, setMessage] = useState("");
  const [approvalDetailId, setApprovalDetailId] = useState(null);
  const [finalSubmitTarget, setFinalSubmitTarget] = useState(null);

  const approvalByLoadingId = useMemo(
    () => Object.fromEntries(approvalItems.map((item) => [item.loadingId, item])),
    [approvalItems],
  );

  const pendingApprovalCount = useMemo(
    () => countPendingApprovals(approvalItems),
    [approvalItems],
  );

  const selectedApprovalDetail = approvalDetailId
    ? approvalItems.find((item) => item.id === approvalDetailId)
    : null;

  const compactInputClass = `${uniformInputClass} h-8 px-2 text-[11px]`;
  const pinnedStatusWidthClass = "w-[142px] min-w-[142px] max-w-[142px]";
  const pinnedApprovalWidthClass = "w-[186px] min-w-[186px] max-w-[186px]";
  const stickyStatusHeaderClass = `sticky right-0 z-30 ${pinnedStatusWidthClass} border-l border-slate-200/70 bg-slate-50 px-4 py-3.5 text-left align-middle text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`;
  const stickyApprovalHeaderClass = `sticky right-[142px] z-30 ${pinnedApprovalWidthClass} border-l border-slate-200/70 bg-slate-50 px-4 py-3.5 text-left align-middle text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`;
  const stickyStatusCellBase = `sticky right-0 z-20 ${pinnedStatusWidthClass} border-l border-slate-200/70 px-4 align-middle shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`;
  const stickyApprovalCellBase = `sticky right-[142px] z-20 ${pinnedApprovalWidthClass} border-l border-slate-200/70 px-4 align-middle shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`;

  useEffect(() => {
    dispatch(fetchLoadingRecords());
    dispatch(fetchApprovalRequests());
  }, [dispatch]);

  useEffect(() => {
    if (storeItems.length > 0) {
      setRows(storeItems.map(mapStoreRow));
    }
  }, [storeItems]);

  useEffect(() => {
    if (loadingIdParam) dispatch(fetchLoadingById(loadingIdParam));
    else if (rakeIdParam) dispatch(fetchRakeById(rakeIdParam));
  }, [dispatch, loadingIdParam, rakeIdParam]);

  useEffect(() => {
    if (selectedLoading) {
      setInlineForm({
        ...initialInlineForm,
        rakeId: selectedLoading.rakeId,
        rakeNumber: selectedLoading.rakeNumber,
        wagonSupply: selectedLoading.wagonSupply,
        siding: selectedLoading.siding,
        route: selectedLoading.route,
        customer: selectedLoading.customer,
        destination: selectedLoading.destination,
        fNote: selectedLoading.fNote,
        offerTime: selectedLoading.offerTime ? toInputDateTime(selectedLoading.offerTime) : "",
        placementTime: selectedLoading.placementTime
          ? toInputDateTime(selectedLoading.placementTime)
          : "",
      });
      setInlineActionMode("add");
      setActiveInlineRakeId("");
      setTableSearch(selectedLoading.rakeNumber);
      return;
    }

    if (!selectedRake) return;
    setInlineForm({
      ...initialInlineForm,
      rakeId: selectedRake.id,
      rakeNumber: selectedRake.rakeNumber,
      wagonSupply: selectedRake.wagonSupply,
      siding: selectedRake.siding,
      route: selectedRake.route,
      customer: selectedRake.customer,
      destination: selectedRake.destination,
      fNote: selectedRake.fNote,
      offerTime: selectedRake.offerTime ? toInputDateTime(selectedRake.offerTime) : "",
    });
    setInlineActionMode("add");
    setActiveInlineRakeId("");
    setTableSearch(selectedRake.rakeNumber);
  }, [selectedLoading, selectedRake]);

  async function handleInlineAdjustmentSave(rakeId) {
    if (!rakeId) return;

    const existingRow = rows.find((row) => row.rakeId === rakeId);
    if (!existingRow) return;

    const overloadedWagons =
      inlineForm.overloadedWagons !== "" ? Number(inlineForm.overloadedWagons) : undefined;
    const weightRemoved =
      inlineForm.weightRemoved !== "" ? Number(inlineForm.weightRemoved) : undefined;

    try {
      const record = buildCanonicalRow(
        {
          ...existingRow,
          overloadedWagons:
            overloadedWagons !== undefined ? overloadedWagons : existingRow.overloadedWagons,
          weightRemoved:
            weightRemoved !== undefined ? weightRemoved : existingRow.weightRemoved,
        },
        existingRow,
      );
      await persistRow(record);
      setMessage(`Updated wagons and weight for rake ${rakeId}`);
      clearInlineForm();
    } catch (error) {
      setMessage(error?.message || "Unable to save load adjustment.");
    }
  }

  function handleOpenAdjustment(row) {
    if (row.isDisabled) {
      setMessage("Enable this row before making load adjustments.");
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
      manualLoadingTrack: row.manualLoadingTrack || "",
      tonnage: row.tonnage || "",
      stockpile: row.stockpile || "",
      completionTime: row.completionTime || "",
      clearanceTime: row.clearanceTime || "",
      overloadedWagons: row.overloadedWagons !== undefined ? row.overloadedWagons : "",
      weightRemoved: row.weightRemoved !== undefined ? row.weightRemoved : "",
    });
    setInlineActionMode("adjust");
    setActiveInlineRakeId(row.rakeId);
    setMessage("");
  }

  function handleDelayRedirect(row) {
    const loadingId = row.id || (row.rakeId ? `LD-${row.rakeId.replace("RK-", "")}` : null);
    if (!loadingId) return;
    navigate(delayPathForLoading(loadingId));
  }

  const statusConfirmRake = useMemo(
    () => rows.find((item) => item.rakeId === statusConfirmRakeId),
    [rows, statusConfirmRakeId],
  );

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows;

    const q = tableSearch.toLowerCase();
    return rows.filter((row) => {
      const approval = approvalByLoadingId[row.id];
      const status = getRowStatusMeta(row, approval).label;
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
  }, [rows, tableSearch, approvalByLoadingId]);

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
        const approval = approvalByLoadingId[row.id];
        return getRowStatusMeta(row, approval).label.toLowerCase();
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
  }, [filteredRows, sortBy, sortOrder, approvalByLoadingId]);

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
    const isAdjustmentMode = inlineActionMode === "adjust";

    if (isAdjustmentMode) {
      const hasAdjustmentValue =
        String(inlineForm.overloadedWagons || "").trim() ||
        String(inlineForm.weightRemoved || "").trim();

      if (!hasAdjustmentValue) {
        return "Enter overloaded wagons or weight removed before saving adjustment.";
      }
    }

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

    if (!isAdjustmentMode && requiredFields.some((field) => !String(field || "").trim())) {
      return "Please fill all required loading fields before saving.";
    }

    if (!isAdjustmentMode &&
      (
      inlineForm.placementTime &&
      inlineForm.completionTime &&
      parseDateTimeToTimestamp(inlineForm.completionTime) <
        parseDateTimeToTimestamp(inlineForm.placementTime)
      )
    ) {
      return "Completion time must be after placement time.";
    }

    if (!isAdjustmentMode) {
      const normalizedRakeId = inlineForm.rakeId.trim();
      const duplicateRake = rows.some(
        (row) =>
          row.rakeId.toLowerCase() === normalizedRakeId.toLowerCase() &&
          row.rakeId !== activeInlineRakeId,
      );

      if (duplicateRake) {
        return "Rake ID already exists. Use a different Rake ID.";
      }
    }

    if (inlineForm.overloadedWagons && (Number.isNaN(Number(inlineForm.overloadedWagons)) || Number(inlineForm.overloadedWagons) < 0)) {
      return "No. of Overloaded Wagons must be a valid positive number.";
    }

    if (inlineForm.weightRemoved && (Number.isNaN(Number(inlineForm.weightRemoved)) || Number(inlineForm.weightRemoved) < 0)) {
      return "Weight Removed must be a valid positive number.";
    }

    return "";
  }

  function buildCanonicalRow(source = inlineForm, existingRow = null) {
    const rakeId = source.rakeId.trim();
    return {
      id: existingRow?.id || `LD-${rakeId.replace("RK-", "")}`,
      rakeId,
      rakeNumber: source.rakeNumber.trim(),
      wagonSupply: source.wagonSupply.trim(),
      siding: source.siding.trim(),
      route: source.route.trim(),
      customer: source.customer.trim(),
      destination: source.destination.trim(),
      fNote: source.fNote.trim() || "-",
      placementTime: source.placementTime,
      offerTime: source.offerTime,
      operatorFtp: source.operatorFtp.trim(),
      wagonSick: source.wagonSick,
      manualLoadingTrack: source.manualLoadingTrack || "",
      tonnage: source.tonnage,
      stockpile: source.stockpile.trim(),
      completionTime: source.completionTime || null,
      clearanceTime: existingRow?.clearanceTime ?? null,
      overloadedWagons: source.overloadedWagons !== "" ? Number(source.overloadedWagons) : 0,
      weightRemoved: source.weightRemoved !== "" ? Number(source.weightRemoved) : 0,
      isDisabled: existingRow?.isDisabled ?? false,
      status:
        existingRow?.status ??
        (source.operatorFtp || source.tonnage || source.stockpile
          ? LOADING_STATUS.IN_PROGRESS
          : LOADING_STATUS.PENDING),
      isSubmitted: existingRow?.isSubmitted ?? false,
    };
  }

  async function persistRow(record) {
    await dispatch(saveLoadingRecord(record)).unwrap();
    await dispatch(fetchLoadingRecords());
    await dispatch(fetchApprovalRequests());
  }

  async function handleInlineSave() {
    const validationMessage = validateInlineForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    if (inlineActionMode === "adjust") {
      handleInlineAdjustmentSave(activeInlineRakeId);
      return;
    }

    const existingRow =
      inlineActionMode === "edit"
        ? rows.find((item) => item.rakeId === activeInlineRakeId)
        : null;

    if (existingRow?.isSubmitted) {
      setMessage("Submitted loading records are locked. Railway approval is in progress.");
      return;
    }

    try {
      const record = buildCanonicalRow(inlineForm, existingRow);
      await persistRow(record);
      setMessage(
        inlineActionMode === "edit"
          ? "Loading row updated successfully."
          : "Loading row added successfully.",
      );
      clearInlineForm();
    } catch (error) {
      setMessage(error?.message || "Unable to save loading row.");
    }
  }

  async function handleFinalSubmit(loadingId) {
    if (!loadingId) return;
    try {
      await dispatch(completeLoadingAndRequestApproval(loadingId)).unwrap();
      await dispatch(fetchLoadingRecords());
      await dispatch(fetchApprovalRequests());
      setMessage("Loading submitted. Railway approval request created.");
      setFinalSubmitTarget(null);
    } catch (error) {
      setMessage(error?.message || "Unable to submit loading for railway approval.");
    }
  }

  function handleEditRow(row) {
    if (row.isDisabled) {
      setMessage("Enable this row before editing loading details.");
      return;
    }

    if (row.isSubmitted) {
      setMessage("This loading record is locked while railway approvals are in progress.");
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
      manualLoadingTrack: row.manualLoadingTrack || "",
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

  async function confirmRakeStatusToggle() {
    if (!statusConfirmRakeId) return;

    const existingRow = rows.find((item) => item.rakeId === statusConfirmRakeId);
    if (!existingRow) return;

    try {
      await persistRow({
        ...buildCanonicalRow(existingRow, existingRow),
        isDisabled: !existingRow.isDisabled,
      });
      setStatusConfirmRakeId("");
    } catch (error) {
      setMessage(error?.message || "Unable to update row status.");
    }
  }

  function resolveLoadingId(row) {
    return row.id || (row.rakeId ? `LD-${row.rakeId.replace("RK-", "")}` : null);
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

  const isInlineAdjustmentMode = inlineActionMode === "adjust";
  const isInlineEditMode = inlineActionMode === "edit";
  const isInlineAddMode = inlineActionMode === "add";
  const areMainFieldsEditable = !isInlineAdjustmentMode;
  const areAdjustmentFieldsEditable = isInlineAdjustmentMode || isInlineAddMode;

  const adjustmentMissing =
    !String(inlineForm.overloadedWagons || "").trim() &&
    !String(inlineForm.weightRemoved || "").trim();

  const inlineSaveDisabled = isInlineAdjustmentMode
    ? adjustmentMissing || !activeInlineRakeId
    : requiredInlineMissing || (isInlineEditMode && !activeInlineRakeId);

  const inlineSaveLabel = isInlineAdjustmentMode
    ? "Save Adjustment"
    : isInlineEditMode
      ? "Save Edit"
      : "Add Loading";

  const inlineStatusLabel = isInlineAdjustmentMode
    ? "Adjusting"
    : isInlineEditMode
      ? "Editing"
      : "Draft";

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

        {pendingApprovalCount > 0 ? (
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-800">
                  {pendingApprovalCount} loading record(s) awaiting railway approval
                </p>
                <p className="mt-0.5 text-[13px] text-violet-700">
                  Approve as admin on behalf of railway staff, or ask the railway team to log in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN.RAILWAY_APPROVALS)}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-violet-700"
              >
                Open Railway Approvals
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-slate-600">
                After final submit, use Railway Approvals to complete Operations → Commercial → C&amp;W steps.
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN.RAILWAY_APPROVALS)}
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open Railway Approvals
              </button>
            </div>
          </div>
        )}

        <SearchBar
          placeholder="Search by rake, route, customer, stockpile, or status..."
          value={tableSearch}
          onChange={setTableSearch}
          showFilter={false}
        />

        <p className="text-[13px] text-slate-500">
          Railway Approval and Status stay pinned on the right while you scroll the table horizontally.
        </p>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] border-separate border-spacing-0 whitespace-nowrap">
              <colgroup>
                <col className="w-[108px]" />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col className="w-[186px]" />
                <col className="w-[142px]" />
              </colgroup>
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
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden xl:table-cell">
                    Manual Track
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
                  <th className={stickyApprovalHeaderClass}>
                    <span className="block leading-snug">Railway</span>
                    <span className="block leading-snug">Approval</span>
                  </th>
                  <th className={stickyStatusHeaderClass}>
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
                          {inlineActionMode === "edit"
                            ? `Editing ${activeInlineRakeId}`
                            : `Adjusting ${activeInlineRakeId}`}
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
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.rakeNumber}
                      onChange={(event) => updateInline("rakeNumber", event.target.value)}
                      placeholder="Rake Number"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.wagonSupply}
                      onChange={(event) => updateInline("wagonSupply", event.target.value)}
                      placeholder="Type/Count"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.siding}
                      onChange={(event) => updateInline("siding", event.target.value)}
                      placeholder="Siding"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.route}
                      onChange={(event) => updateInline("route", event.target.value)}
                      placeholder="Route"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.customer}
                      onChange={(event) => updateInline("customer", event.target.value)}
                      placeholder="Customer"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.destination}
                      onChange={(event) => updateInline("destination", event.target.value)}
                      placeholder="Destination"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.fNote}
                      onChange={(event) => updateInline("fNote", event.target.value)}
                      placeholder="F-Note"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.placementTime}
                      onChange={(event) => updateInline("placementTime", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.offerTime}
                      onChange={(event) => updateInline("offerTime", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.operatorFtp}
                      onChange={(event) => updateInline("operatorFtp", event.target.value)}
                      placeholder="Operator FTP"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={inlineForm.wagonSick}
                      onChange={(event) => updateInline("wagonSick", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      {wagonSickOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3 hidden xl:table-cell">
                    <ThemedSelect
                      value={inlineForm.manualLoadingTrack}
                      onChange={(event) => updateInline("manualLoadingTrack", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                      title="Used in Rake Incentive report for manual R3/R4 loading counts"
                    >
                      {manualLoadingTrackOptions.map((option) => (
                        <option key={option.value || "none"} value={option.value}>
                          {option.label}
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
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.stockpile}
                      onChange={(event) => updateInline("stockpile", event.target.value)}
                      placeholder="Stockpile"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.completionTime}
                      onChange={(event) => updateInline("completionTime", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.clearanceTime}
                      readOnly
                      placeholder="Set by Railway Ops"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      title="Track clearance is recorded during Railway Operations approval"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      value={inlineForm.overloadedWagons}
                      onChange={(event) => updateInline("overloadedWagons", event.target.value)}
                      placeholder="Wagons"
                      className={compactInputClass}
                      disabled={!areAdjustmentFieldsEditable}
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
                      disabled={!areAdjustmentFieldsEditable}
                    />
                  </td>
                  <td className={`${stickyApprovalCellBase} bg-blue-50 py-4`}>
                    <div className="flex min-h-[36px] items-center">
                      <span className="text-[11px] text-slate-400">—</span>
                    </div>
                  </td>
                  <td className={`${stickyStatusCellBase} bg-blue-50 py-4`}>
                    <div className="flex min-h-[36px] items-center">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        {inlineStatusLabel}
                      </span>
                    </div>
                  </td>
                </tr>

                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="px-5 py-12 text-center">
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
                    const loadingId = resolveLoadingId(row);
                    const approval = approvalByLoadingId[loadingId];
                    const statusMeta = getRowStatusMeta(row, approval);
                    const isAdjusting =
                      inlineActionMode === "adjust" && activeInlineRakeId === row.rakeId;
                    const canFinalSubmit =
                      Boolean(row.completionTime) &&
                      !row.isSubmitted &&
                      !row.isDisabled;
                    const actionCellClass =
                      row.rakeId === activeInlineRakeId
                        ? "bg-amber-50"
                        : "bg-white group-hover:bg-slate-50";
                    const pinnedCellClass =
                      row.rakeId === activeInlineRakeId
                        ? "bg-amber-50"
                        : "bg-white group-hover:bg-slate-50";

                    return (
                      <tr
                        key={row.rakeId}
                        className={`hover:bg-slate-50/60 transition-colors group ${
                          row.rakeId === activeInlineRakeId ? "bg-amber-50/60" : ""
                        } ${row.isDisabled ? "opacity-70" : ""}`}
                      >
                        <td
                          className={`sticky left-0 z-20 border-r border-slate-200/70 px-5 py-4 ${actionCellClass}`}
                        >
                          <div className="flex items-center justify-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEditRow(row)}
                              disabled={row.isDisabled || row.isSubmitted}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled || row.isSubmitted
                                  ? "cursor-not-allowed text-slate-300"
                                  : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                              title={
                                row.isSubmitted
                                  ? "Locked after final submit"
                                  : row.isDisabled
                                    ? "Enable to edit"
                                    : "Edit"
                              }
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
                                  : isAdjusting
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                              aria-label={row.isDisabled ? "Enable to adjust" : "Adjustment"}
                              title={row.isDisabled ? "Enable to adjust" : "Adjustment"}
                            >
                              <AdjustmentIcon className="h-4 w-4" />
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
                              <DelayIcon className="h-4 w-4" />
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

                            {canFinalSubmit ? (
                              <button
                                type="button"
                                onClick={() => setFinalSubmitTarget(loadingId)}
                                className="inline-flex h-8 items-center rounded-lg border border-violet-300 bg-violet-50 px-2 text-[10px] font-bold uppercase tracking-[0.04em] text-violet-700 transition-colors hover:bg-violet-100"
                                title="Submit loading for railway approval"
                              >
                                Submit
                              </button>
                            ) : null}
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
                        <td className="px-5 py-4 text-[13px] text-slate-700 hidden xl:table-cell">
                          {row.manualLoadingTrack || "-"}
                        </td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.tonnage || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.stockpile || "-"}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.completionTime)}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.clearanceTime)}</td>
                        <td className="px-5 py-3">
                          <span className="text-[13px] text-slate-700">
                            {row.overloadedWagons ?? "-"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[13px] text-slate-700">
                            {row.weightRemoved ?? "-"}
                          </span>
                        </td>
                        <td className={`${stickyApprovalCellBase} py-4 ${pinnedCellClass}`}>
                          <div className="flex min-h-[36px] flex-col justify-center gap-1.5">
                            <ApprovalStatusBadge approval={approval} compact />
                            {approval ? (
                              <ViewTrackerButton onClick={() => setApprovalDetailId(approval.id)} />
                            ) : row.isSubmitted ? (
                              <span className="text-[11px] leading-none text-slate-400">
                                Pending creation
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className={`${stickyStatusCellBase} py-4 ${pinnedCellClass}`}>
                          <div className="flex min-h-[36px] items-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold leading-none ${statusMeta.badgeClass}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                              {statusMeta.label}
                            </span>
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

      <ConfirmDialog
        isOpen={Boolean(finalSubmitTarget)}
        onClose={() => setFinalSubmitTarget(null)}
        onConfirm={() => handleFinalSubmit(finalSubmitTarget)}
        title="Final Submit for Railway Approval"
        message="This will lock the loading record and create a railway approval request. Track clearance will be recorded by Railway Operations."
        itemName={finalSubmitTarget || ""}
        confirmLabel="Submit"
        variant="warning"
      />

      <ApprovalTrackerModal
        approval={selectedApprovalDetail}
        isOpen={Boolean(selectedApprovalDetail)}
        onClose={() => setApprovalDetailId(null)}
      />
    </>
  );
}