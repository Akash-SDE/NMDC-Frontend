import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  uniformInputClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
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
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { useRouter } from "../../../context/RouterContext";
import { delayPathForLoading, ROUTES } from "../../../constants/routes";
import { LOADING_STATUS } from "../../../constants/approval";
import { fetchApprovalRequests } from "../../../store/slices/approvalSlice";
import { getErrorMessage } from "../../../api/apiError";
import {
  createLoadingRecord,
  listLoadingRecords,
  updateLoadingRecord,
} from "../../../services/loadingManagementService";
import { createRailwayApproval } from "../../../services/railwayApprovalService";
import { listRakes } from "../../../services/rakeManagementService";
import { fetchStockpiles } from "../../../services/stockpileService";
import {
  ApprovalStatusBadge,
  ApprovalTrackerModal,
  ViewTrackerButton,
} from "../../../components/common/ApprovalTracker";
import { countPendingApprovals } from "../../../constants/approval";
import { getApprovalStatusLabel, getLoadingStatusMeta } from "../../../utils/approvalUtils";
import Pagination from "../../../components/shared/Pagination";
import { useClientPagination } from "../../../hooks/useClientPagination";
import { useColumnFilters } from "../../../hooks/useColumnFilters";
import ColumnFilterRow from "../../../components/shared/ColumnFilterRow";
import ColumnSettingsMenu from "../../../components/shared/ColumnSettingsMenu";
import { useColumnVisibility } from "../../../hooks/useColumnVisibility";

const LOADING_STATUS_CODE = {
  PENDING: 5,
  IN_PROGRESS: 10,
  AWAITING_APPROVAL: 15,
};

const WAGON_SICK_NO = "5";
const wagonSickOptions = [
  { value: WAGON_SICK_NO, label: "No" },
  { value: "10", label: "Yes" },
];
const manualLoadingTrackOptions = [
  { value: "", label: "None" },
  { value: "5", label: "Manual R3" },
  { value: "10", label: "Manual R4" },
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
  wagonSick: WAGON_SICK_NO,
  manualLoadingTrack: "",
  tonnage: "",
  stockpile: "",
  completionTime: "",
  clearanceTime: "",
  overloadedWagons: "",
  weightRemoved: "",
};

function asResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function toDateTimeLocalValue(value) {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function wagonSupplyLabel(wagonType, wagonCount) {
  const type = wagonType || "";
  const count = wagonCount == null || wagonCount === "" ? "" : String(wagonCount);
  if (type && count) return `${type}/${count}`;
  return type || count;
}

function mapApiLoading(item) {
  const track = manualLoadingTrackOptions.find(
    (option) => option.value === String(item.manual_loading_track ?? ""),
  );

  return {
    id: item.id,
    rakeId: item.rake,
    rakeNumber: item.rake_number || "",
    wagonSupply: wagonSupplyLabel(item.wagontype_name, item.wagoncount),
    siding: item.siding_name || "",
    route: item.route_name || "",
    customer: item.customer_name || "",
    destination: item.destination_name || "",
    fNote: item.fnote || "",
    placementTime: toDateTimeLocalValue(item.placement_time),
    offerTime: toDateTimeLocalValue(item.offertime),
    operatorFtp: item.operator_ftp || "",
    wagonSick: item.wagon_sick_name || "No",
    wagonSickCode: item.wagon_sick == null ? WAGON_SICK_NO : String(item.wagon_sick),
    manualLoadingTrack: track?.label && track.value ? track.label : "",
    manualLoadingTrackCode: item.manual_loading_track == null ? "" : String(item.manual_loading_track),
    tonnage: item.tonnage ?? "",
    stockpile: item.stockpile_name || "",
    stockpileId: item.stockpile == null ? "" : String(item.stockpile),
    completionTime: toDateTimeLocalValue(item.completion_time),
    clearanceTime: toDateTimeLocalValue(item.clearance_time),
    overloadedWagons: item.overloaded_wagons ?? 0,
    weightRemoved: item.weight_removed ?? 0,
    status: item.status,
    statusDescription: item.status_description || "",
    isSubmitted: Boolean(item.is_submitted),
    isDisabled: Boolean(item.is_disabled),
  };
}

function mapRakeOption(item) {
  return {
    id: item.id,
    rakeNumber: item.rake_number || "",
    wagonSupply: wagonSupplyLabel(item.wagontype_name, item.wagoncount),
    siding: item.siding_name || "",
    route: item.route_name || "",
    customer: item.customer_name || "",
    destination: item.destination_name || "",
    fNote: item.fnote || "",
    offerTime: toDateTimeLocalValue(item.offertime),
  };
}

function loadingFieldsFromForm(form) {
  const stockpile = form.stockpile === "" ? null : Number(form.stockpile);
  const track = form.manualLoadingTrack === "" ? null : Number(form.manualLoadingTrack);

  return {
    placement_time: toIsoOrNull(form.placementTime),
    operator_ftp: String(form.operatorFtp || "").trim(),
    wagon_sick: Number(form.wagonSick || WAGON_SICK_NO),
    manual_loading_track: Number.isFinite(track) ? track : null,
    tonnage: form.tonnage === "" ? null : form.tonnage,
    stockpile: Number.isFinite(stockpile) ? stockpile : null,
    completion_time: toIsoOrNull(form.completionTime),
    overloaded_wagons: form.overloadedWagons === "" ? 0 : Number(form.overloadedWagons),
    weight_removed: form.weightRemoved === "" ? "0" : String(form.weightRemoved),
  };
}

function statusKeyFromCode(code) {
  switch (Number(code)) {
    case LOADING_STATUS_CODE.IN_PROGRESS:
      return LOADING_STATUS.IN_PROGRESS;
    case LOADING_STATUS_CODE.AWAITING_APPROVAL:
      return LOADING_STATUS.AWAITING_APPROVAL;
    case 20:
      return LOADING_STATUS.READY_FOR_DISPATCH;
    case 25:
      return LOADING_STATUS.DISPATCHED;
    default:
      return LOADING_STATUS.PENDING;
  }
}

function getRowStatusMeta(row) {
  if (row.isDisabled) {
    return {
      label: "Inactive",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
      dotClass: "bg-slate-400",
    };
  }
  const meta = getLoadingStatusMeta(statusKeyFromCode(row.status));
  return { ...meta, label: row.statusDescription || meta.label };
}

function compareValues(a, b, order) {
  const left = typeof a === "string" ? a.toLowerCase() : a;
  const right = typeof b === "string" ? b.toLowerCase() : b;

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

function resolveLoadingId(row) {
  return row.id || (row.rakeId ? `LD-${row.rakeId.replace("RK-", "")}` : null);
}

const pinnedFilterShadowClass = "border-l border-slate-200/70 bg-white shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]";

const LOADING_HIDDEN_COLS_KEY = "nmdc_loading_hidden_columns";

function buildLoadingFilterColumns(approvalByLoadingId) {
  return [
    { key: "actions", type: "none", className: "sticky left-0 z-30 border-r border-slate-200/70 bg-white" },
    { key: "rakeId", label: "Rake ID" },
    { key: "rakeNumber", label: "Rake Number", getValue: (row) => row.rakeNumber || "-" },
    { key: "wagonSupply", label: "Wagon Supply", getValue: (row) => row.wagonSupply || "-" },
    { key: "siding", label: "Siding", type: "select", getValue: (row) => row.siding || "-" },
    { key: "route", label: "Route", type: "select", getValue: (row) => row.route || "-" },
    { key: "customer", label: "Customer", type: "select", getValue: (row) => row.customer || "-" },
    { key: "destination", label: "Destination", type: "select", getValue: (row) => row.destination || "-" },
    { key: "fNote", label: "F-Note", getValue: (row) => row.fNote || "-" },
    { key: "placementTime", label: "Placement Time", getValue: (row) => formatDateTimeForTable(row.placementTime) },
    { key: "offerTime", label: "Offer Time", getValue: (row) => formatDateTimeForTable(row.offerTime) },
    { key: "operatorFtp", label: "Operator FTP", getValue: (row) => row.operatorFtp || "-" },
    { key: "wagonSick", label: "Wagon Sick", type: "select", getValue: (row) => row.wagonSick || "No" },
    {
      key: "manualLoadingTrack",
      label: "Manual Track",
      type: "select",
      className: "hidden xl:table-cell",
      getValue: (row) => row.manualLoadingTrack || "-",
    },
    { key: "tonnage", label: "Tonnage", getValue: (row) => row.tonnage || "-" },
    { key: "stockpile", label: "Stockpile", type: "select", getValue: (row) => row.stockpile || "-" },
    { key: "completionTime", label: "Completion Time", getValue: (row) => formatDateTimeForTable(row.completionTime) },
    { key: "clearanceTime", label: "Clearance Time", getValue: (row) => formatDateTimeForTable(row.clearanceTime) },
    { key: "overloadedWagons", label: "No. of Overloaded Wagons", getValue: (row) => row.overloadedWagons ?? "-" },
    { key: "weightRemoved", label: "Weight Removed", getValue: (row) => row.weightRemoved ?? "-" },
    {
      key: "railwayApproval",
      label: "Railway Approval",
      type: "select",
      className: `sticky right-[142px] z-30 w-[186px] min-w-[186px] max-w-[186px] ${pinnedFilterShadowClass}`,
      getValue: (row) => {
        const approval = approvalByLoadingId[resolveLoadingId(row)];
        return approval ? getApprovalStatusLabel(approval.status) : "Not submitted";
      },
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      className: `sticky right-0 z-30 w-[142px] min-w-[142px] max-w-[142px] ${pinnedFilterShadowClass}`,
      getValue: (row) => getRowStatusMeta(row).label,
    },
  ];
}

export default function LoadingManagementPage() {
  const dispatch = useDispatch();
  const { navigate } = useRouter();
  const [searchParams] = useSearchParams();
  const rakeIdParam = searchParams.get("rakeId");
  const loadingIdParam = searchParams.get("loadingId");
  const approvalItems = useSelector((state) => state.approvals.items);
  const [rows, setRows] = useState([]);
  const [rakeOptions, setRakeOptions] = useState([]);
  const [stockpileOptions, setStockpileOptions] = useState([]);
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("rakeNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [inlineForm, setInlineForm] = useState(initialInlineForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineId, setActiveInlineId] = useState(null);
  const [saving, setSaving] = useState(false);
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
    dispatch(fetchApprovalRequests());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    async function loadScreenData() {
      try {
        const [loadingResponse, rakeResponse, stockpileResponse] = await Promise.all([
          listLoadingRecords({ page_size: 1000 }),
          listRakes({ page_size: 1000 }).catch(() => ({ results: [] })),
          fetchStockpiles({ page_size: 1000 }).catch(() => ({ results: [] })),
        ]);
        if (cancelled) return;
        const loadedRows = asResults(loadingResponse).map(mapApiLoading);
        setRows(loadedRows);
        setRakeOptions(asResults(rakeResponse).map(mapRakeOption));
        setStockpileOptions(
          asResults(stockpileResponse)
            .filter((item) => item?.id != null)
            .map((item) => ({
              id: String(item.id),
              label: item.stockpile_code || item.stockpile_desc || String(item.id),
            })),
        );
        if (loadingIdParam) {
          const linked = loadedRows.find((row) => String(row.id) === String(loadingIdParam));
          if (linked?.rakeNumber) setTableSearch(linked.rakeNumber);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(getErrorMessage(error, "Unable to load loading records."));
        }
      }
    }

    loadScreenData();
    return () => {
      cancelled = true;
    };
  }, [loadingIdParam]);

  function applyRakeSelection(rake) {
    setInlineForm((prev) => ({
      ...prev,
      rakeId: rake ? String(rake.id) : "",
      rakeNumber: rake?.rakeNumber || "",
      wagonSupply: rake?.wagonSupply || "",
      siding: rake?.siding || "",
      route: rake?.route || "",
      customer: rake?.customer || "",
      destination: rake?.destination || "",
      fNote: rake?.fNote || "",
      offerTime: rake?.offerTime || "",
    }));
    setMessage("");
  }

  useEffect(() => {
    if (!rakeIdParam || inlineForm.rakeId) return;
    const match = rakeOptions.find((item) => String(item.id) === String(rakeIdParam));
    if (!match) return;
    applyRakeSelection(match);
    setTableSearch(match.rakeNumber);
  }, [rakeIdParam, rakeOptions, inlineForm.rakeId]);

  async function reloadRows() {
    const response = await listLoadingRecords({ page_size: 1000 });
    setRows(asResults(response).map(mapApiLoading));
  }

  async function handleInlineAdjustmentSave(loadingId) {
    if (!loadingId) return;

    const existingRow = rows.find((row) => row.id === loadingId);
    if (!existingRow) return;

    setSaving(true);
    try {
      await updateLoadingRecord(loadingId, {
        overloaded_wagons:
          inlineForm.overloadedWagons === "" ? 0 : Number(inlineForm.overloadedWagons),
        weight_removed:
          inlineForm.weightRemoved === "" ? "0" : String(inlineForm.weightRemoved),
      });
      await reloadRows();
      clearInlineForm();
      setMessage(`Updated wagons and weight for rake ${existingRow.rakeNumber || existingRow.rakeId}`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to save load adjustment."));
    } finally {
      setSaving(false);
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
      wagonSick: row.wagonSickCode || WAGON_SICK_NO,
      manualLoadingTrack: row.manualLoadingTrackCode || "",
      tonnage: row.tonnage || "",
      stockpile: row.stockpileId || "",
      completionTime: row.completionTime || "",
      clearanceTime: row.clearanceTime || "",
      overloadedWagons: row.overloadedWagons !== undefined ? row.overloadedWagons : "",
      weightRemoved: row.weightRemoved !== undefined ? row.weightRemoved : "",
    });
    setInlineActionMode("adjust");
    setActiveInlineId(row.id);
    setMessage("");
  }

  function handleDelayRedirect(row) {
    const loadingId = row.id || (row.rakeId ? `LD-${row.rakeId.replace("RK-", "")}` : null);
    if (!loadingId) return;
    navigate(delayPathForLoading(loadingId));
  }

  const statusConfirmRake = useMemo(
    () => rows.find((item) => item.id === statusConfirmRakeId),
    [rows, statusConfirmRakeId],
  );

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows;

    const q = tableSearch.toLowerCase();
    return rows.filter((row) => {
      const status = getRowStatusMeta(row).label;
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

  const loadingFilterColumns = useMemo(
    () => buildLoadingFilterColumns(approvalByLoadingId),
    [approvalByLoadingId],
  );
  const columnFilters = useColumnFilters(loadingFilterColumns);
  const columnVisibility = useColumnVisibility(LOADING_HIDDEN_COLS_KEY, loadingFilterColumns, {
    pinned: ["railwayApproval", "status"],
    onHide: (keys) => keys.forEach((k) => columnFilters.setFilter(k, "")),
  });
  const { applyFilters } = columnFilters;
  const columnFilteredRows = useMemo(() => applyFilters(filteredRows), [applyFilters, filteredRows]);

  const sortedRows = useMemo(() => {
    const getComparableValue = (row, field) => {
      if (
        field === "placementTime" ||
        field === "offerTime" ||
        field === "completionTime" ||
        field === "clearanceTime"
      ) {
        const time = new Date(row[field]).getTime();
        return Number.isNaN(time) ? 0 : time;
      }

      if (field === "tonnage" || field === "overloadedWagons" || field === "weightRemoved") {
        const parsed = Number(row[field]);
        return Number.isNaN(parsed) ? 0 : parsed;
      }

      if (field === "status") {
        return getRowStatusMeta(row).label.toLowerCase();
      }

      return String(row[field] ?? "").toLowerCase();
    };

    return [...columnFilteredRows].sort((a, b) => {
      const aValue = getComparableValue(a, sortBy);
      const bValue = getComparableValue(b, sortBy);
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [columnFilteredRows, sortBy, sortOrder]);

  const { pageItems: pagedRows, paginationProps } = useClientPagination(sortedRows, {
    resetKey: `${tableSearch}|${sortBy}|${sortOrder}|${columnFilters.filterKey}`,
  });

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
    setActiveInlineId(null);
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

    if (!isAdjustmentMode) {
      const missing = [];
      if (!String(inlineForm.rakeId || "").trim()) missing.push("rake");
      if (!String(inlineForm.operatorFtp || "").trim()) missing.push("operator FTP");
      if (!String(inlineForm.tonnage || "").trim()) missing.push("tonnage");
      if (!String(inlineForm.stockpile || "").trim()) missing.push("stockpile");
      if (missing.length) {
        return `Fill ${missing.join(", ")} before saving.`;
      }
      if (Number(inlineForm.tonnage) <= 0) {
        return "Tonnage must be greater than zero.";
      }
    }

    if (
      !isAdjustmentMode &&
      inlineForm.placementTime &&
      inlineForm.completionTime &&
      new Date(inlineForm.completionTime) < new Date(inlineForm.placementTime)
    ) {
      return "Completion time must be after placement time.";
    }

    if (inlineForm.overloadedWagons && (Number.isNaN(Number(inlineForm.overloadedWagons)) || Number(inlineForm.overloadedWagons) < 0)) {
      return "No. of Overloaded Wagons must be a valid positive number.";
    }

    if (inlineForm.weightRemoved && (Number.isNaN(Number(inlineForm.weightRemoved)) || Number(inlineForm.weightRemoved) < 0)) {
      return "Weight Removed must be a valid positive number.";
    }

    return "";
  }

  async function handleInlineSave() {
    const validationMessage = validateInlineForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    if (inlineActionMode === "adjust") {
      handleInlineAdjustmentSave(activeInlineId);
      return;
    }

    const existingRow =
      inlineActionMode === "edit"
        ? rows.find((item) => item.id === activeInlineId)
        : null;

    if (existingRow?.isSubmitted) {
      setMessage("Submitted loading records are locked. Railway approval is in progress.");
      return;
    }

    setSaving(true);
    try {
      const fields = loadingFieldsFromForm(inlineForm);
      if (inlineActionMode === "edit") {
        await updateLoadingRecord(activeInlineId, fields);
      } else {
        await createLoadingRecord({
          ...fields,
          rake: Number(inlineForm.rakeId),
          status: LOADING_STATUS_CODE.IN_PROGRESS,
          is_submitted: false,
          is_disabled: false,
        });
      }
      await reloadRows();
      clearInlineForm();
      setMessage(
        inlineActionMode === "edit"
          ? "Loading row updated successfully."
          : "Loading row added successfully.",
      );
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to save loading row."));
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalSubmit(loadingId) {
    if (!loadingId) return;
    setSaving(true);
    try {
      await updateLoadingRecord(loadingId, {
        is_submitted: true,
        status: LOADING_STATUS_CODE.AWAITING_APPROVAL,
      });
      try {
        await createRailwayApproval({ loading: Number(loadingId) });
      } catch (error) {
        const alreadyExists = /already exists/i.test(getErrorMessage(error, ""));
        if (!alreadyExists) throw error;
      }
      await reloadRows();
      await dispatch(fetchApprovalRequests());
      setMessage("Loading submitted for railway approval.");
      setFinalSubmitTarget(null);
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to submit loading for railway approval."));
    } finally {
      setSaving(false);
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
      wagonSick: row.wagonSickCode || WAGON_SICK_NO,
      manualLoadingTrack: row.manualLoadingTrackCode || "",
      tonnage: row.tonnage || "",
      stockpile: row.stockpileId || "",
      completionTime: row.completionTime || "",
      clearanceTime: row.clearanceTime || "",
      overloadedWagons: row.overloadedWagons !== undefined ? row.overloadedWagons : "",
      weightRemoved: row.weightRemoved !== undefined ? row.weightRemoved : "",
    });
    setInlineActionMode("edit");
    setActiveInlineId(row.id);
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

    const existingRow = rows.find((item) => item.id === statusConfirmRakeId);
    if (!existingRow) return;

    setSaving(true);
    try {
      await updateLoadingRecord(existingRow.id, {
        is_disabled: !existingRow.isDisabled,
      });
      await reloadRows();
      setStatusConfirmRakeId("");
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to update row status."));
    } finally {
      setSaving(false);
    }
  }

  const requiredInlineMissing = [
    inlineForm.rakeId,
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

  const inlineSaveDisabled = saving || (isInlineAdjustmentMode
    ? adjustmentMissing || !activeInlineId
    : requiredInlineMissing || (isInlineEditMode && !activeInlineId));

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

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by rake, route, customer, stockpile, or status..."
              value={tableSearch}
              onChange={setTableSearch}
              showFilter={false}
            />
          </div>
          <ColumnSettingsMenu {...columnVisibility.menuProps} />
        </div>
        <style>{columnVisibility.css}</style>

        <p className="text-[13px] text-slate-500">
          Railway Approval and Status stay pinned on the right while you scroll the table horizontally.
        </p>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table data-colset={LOADING_HIDDEN_COLS_KEY} className="w-full min-w-[1400px] border-separate border-spacing-0 whitespace-nowrap">
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
                <ColumnFilterRow {...columnFilters.filterRowProps} rows={rows} />
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr data-write className="bg-blue-50/50 align-top [&>td]:py-4">
                  <td className="sticky left-0 z-20 border-r border-slate-200/70 bg-blue-50 px-5 py-3">
                    <div className="flex flex-col items-center gap-2">
                      {inlineActionMode !== "add" ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                          {inlineActionMode === "edit"
                            ? `Editing ${rows.find((item) => item.id === activeInlineId)?.rakeNumber || ""}`
                            : `Adjusting ${rows.find((item) => item.id === activeInlineId)?.rakeNumber || ""}`}
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
                    <select
                      value={inlineForm.rakeId}
                      onChange={(event) => {
                        const match = rakeOptions.find(
                          (item) => String(item.id) === String(event.target.value),
                        );
                        applyRakeSelection(match || null);
                      }}
                      className={compactInputClass}
                      disabled={!isInlineAddMode}
                    >
                      <option value="">Select rake</option>
                      {rakeOptions.map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.rakeNumber || `Rake ${option.id}`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.rakeNumber}
                      placeholder="Rake Number"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.wagonSupply}
                      placeholder="Type/Count"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.siding}
                      placeholder="Siding"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.route}
                      placeholder="Route"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.customer}
                      placeholder="Customer"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.destination}
                      placeholder="Destination"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.fNote}
                      placeholder="F-Note"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
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
                      placeholder="Offer Time"
                      className={`${compactInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                      readOnly
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
                    <select
                      value={inlineForm.wagonSick}
                      onChange={(event) => updateInline("wagonSick", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      {wagonSickOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 hidden xl:table-cell">
                    <select
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
                    </select>
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
                    <select
                      value={inlineForm.stockpile}
                      onChange={(event) => updateInline("stockpile", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    >
                      <option value="">Select stockpile</option>
                      {stockpileOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                          Try adjusting your search keyword or column filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row) => {
                    const loadingId = resolveLoadingId(row);
                    const approval = approvalByLoadingId[loadingId];
                    const statusMeta = getRowStatusMeta(row);
                    const isAdjusting =
                      inlineActionMode === "adjust" && activeInlineId === row.id;
                    const canFinalSubmit =
                      Boolean(row.completionTime) &&
                      !row.isSubmitted &&
                      !row.isDisabled;
                    const actionCellClass =
                      row.id === activeInlineId
                        ? "bg-amber-50"
                        : "bg-white group-hover:bg-slate-50";
                    const pinnedCellClass =
                      row.id === activeInlineId
                        ? "bg-amber-50"
                        : "bg-white group-hover:bg-slate-50";

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/60 transition-colors group ${
                          row.id === activeInlineId ? "bg-amber-50/60" : ""
                        } ${row.isDisabled ? "opacity-70" : ""}`}
                      >
                        <td
                          className={`sticky left-0 z-20 border-r border-slate-200/70 px-5 py-4 ${actionCellClass}`}
                        >
                          <div className="flex items-center justify-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                            <button
                              data-write
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
                              data-write
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
                              data-write
                              type="button"
                              onClick={() => requestRakeStatusToggle(row.id)}
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
                                data-write
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

          <div className="px-5 pb-4">
            <Pagination {...paginationProps} />
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