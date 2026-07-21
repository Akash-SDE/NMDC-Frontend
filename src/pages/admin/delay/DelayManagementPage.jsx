import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  uniformInputClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import DelayProcessTimeline from "../../../components/delay/DelayProcessTimeline";
import {
  PlusIcon,
  EditIcon,
  DisableIcon,
  EnableIcon,
  AdjustIcon as AdjustmentIcon,
  LoadingIcon,
} from "../../../components/icons";
import { useRouter } from "../../../context/RouterContext";
import {
  loadingPathForLoading,
  loadingPathForRake,
  ROUTES,
} from "../../../constants/routes";
import { fetchDelayRecords, saveDelayRecord } from "../../../store/slices/delaySlice";
import { fetchLoadingById, fetchLoadingRecords } from "../../../store/slices/loadingSlice";
import { fetchRakeById } from "../../../store/slices/rakeSlice";
import { fetchApprovalRequests } from "../../../store/slices/approvalSlice";
import { toInputDateTime, toIsoDateTime } from "../../../types/transforms";
import {
  buildAllProcessDelayRows,
  buildRakeProcessDelayInsights,
  DELAY_SOURCE,
} from "../../../utils/delayProcessTimeline";

const categories = [
  "Mechanical",
  "Railway Delay",
  "Power Failure",
  "Labor Delay",
  "Weather",
  "Operational Issue",
];

const initialInlineForm = {
  rakeNumber: "",
  category: "",
  startTime: "",
  endTime: "",
  reason: "",
  reportedBy: "",
};

const sourceBadgeStyles = {
  [DELAY_SOURCE.MANUAL]: "border-amber-200 bg-amber-50 text-amber-800",
  [DELAY_SOURCE.SYSTEM]: "border-slate-200 bg-slate-50 text-slate-700",
  [DELAY_SOURCE.APPROVAL]: "border-violet-200 bg-violet-50 text-violet-800",
};

const sourceBadgeLabels = {
  [DELAY_SOURCE.MANUAL]: "Manual",
  [DELAY_SOURCE.SYSTEM]: "System",
  [DELAY_SOURCE.APPROVAL]: "Railway",
};

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

function parseDateTimeToTimestamp(value) {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
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

function getDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const start = parseDateTimeToTimestamp(startTime);
  const end = parseDateTimeToTimestamp(endTime);
  if (!start || !end || end < start) return null;
  return Math.floor((end - start) / 60000);
}

function formatDuration(minutes) {
  if (minutes === null || Number.isNaN(minutes)) return "-";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function getStatusMeta(row) {
  if (row.isDisabled) {
    return {
      label: "Inactive",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
      dotClass: "bg-slate-400",
    };
  }

  if (row.isReadOnly) {
    return {
      label: "Detected",
      badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
      dotClass: "bg-violet-500",
    };
  }

  const duration = getDurationMinutes(row.startTime, row.endTime) ?? 0;
  if (duration >= 120) {
    return {
      label: "Critical",
      badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
      dotClass: "bg-rose-500",
    };
  }

  return {
    label: "Logged",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  };
}

function inferManualStageFromCategory(category) {
  const value = String(category || "").toLowerCase();
  if (value.includes("wagon")) return "Wagon Supply";
  if (value.includes("railway")) return "Railway Operations";
  return "Loading";
}

function resolveLoadingForRakeNumber(rakeNumber, loadingItems, selectedLoading, selectedRake) {
  if (selectedLoading?.rakeNumber === rakeNumber) return selectedLoading;
  if (selectedRake?.rakeNumber === rakeNumber) {
    return loadingItems.find((item) => item.rakeId === selectedRake.id) ?? null;
  }
  return loadingItems.find((item) => item.rakeNumber === rakeNumber) ?? null;
}

export default function DelayManagementPage() {
  const dispatch = useDispatch();
  const { navigate } = useRouter();
  const [searchParams] = useSearchParams();
  const loadingIdParam = searchParams.get("loadingId");
  const rakeIdParam = searchParams.get("rakeId");
  const storeItems = useSelector((state) => state.delay.items);
  const loadingItems = useSelector((state) => state.loading.items);
  const approvalItems = useSelector((state) => state.approvals.items);
  const selectedLoading = useSelector((state) => state.loading.selected);
  const selectedRake = useSelector((state) => state.rakes.selected);
  const [viewMode, setViewMode] = useState("register");
  const [includeProcessDelays, setIncludeProcessDelays] = useState(true);
  const [expandedTimelineKey, setExpandedTimelineKey] = useState(null);
  const [selectedJourneyLoadingId, setSelectedJourneyLoadingId] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [inlineForm, setInlineForm] = useState(initialInlineForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineLogId, setActiveInlineLogId] = useState(null);
  const [statusConfirmLogId, setStatusConfirmLogId] = useState(null);
  const [message, setMessage] = useState("");

  const compactInputClass = `${uniformInputClass} h-8 px-2 text-[11px]`;

  useEffect(() => {
    dispatch(fetchDelayRecords());
    dispatch(fetchLoadingRecords());
    dispatch(fetchApprovalRequests());
  }, [dispatch]);

  const manualRows = useMemo(
    () =>
      storeItems.map((item) => ({
        ...item,
        source: DELAY_SOURCE.MANUAL,
        processStage: item.processStage || inferManualStageFromCategory(item.category),
        isReadOnly: false,
        startTime: item.startTime ? toInputDateTime(item.startTime) : "",
        endTime: item.endTime ? toInputDateTime(item.endTime) : "",
      })),
    [storeItems],
  );

  const processDelayRows = useMemo(
    () =>
      buildAllProcessDelayRows({
        loadingRecords: loadingItems,
        approvals: approvalItems,
        manualDelays: storeItems,
      }).filter((item) => item.source !== DELAY_SOURCE.MANUAL),
    [loadingItems, approvalItems, storeItems],
  );

  const registerRows = useMemo(() => {
    const manualOnly = manualRows.filter((item) => !item.isDisabled);
    if (!includeProcessDelays) return manualOnly;
    return [...manualOnly, ...processDelayRows].sort(
      (a, b) => parseDateTimeToTimestamp(b.startTime) - parseDateTimeToTimestamp(a.startTime),
    );
  }, [manualRows, processDelayRows, includeProcessDelays]);

  const journeyOptions = useMemo(
    () =>
      loadingItems
        .filter((item) => !item.isDisabled)
        .map((item) => ({
          id: item.id,
          label: `${item.rakeNumber} · ${item.siding} · ${item.customer}`,
        })),
    [loadingItems],
  );

  const selectedJourney = useMemo(() => {
    const loading =
      loadingItems.find((item) => item.id === selectedJourneyLoadingId) ??
      selectedLoading ??
      loadingItems[0] ??
      null;
    if (!loading) return null;

    const approval =
      approvalItems.find((item) => item.loadingId === loading.id) ?? null;
    const relatedManual = storeItems.filter(
      (item) =>
        item.loadingId === loading.id ||
        item.rakeId === loading.rakeId ||
        item.rakeNumber === loading.rakeNumber,
    );

    return {
      loading,
      approval,
      insights: buildRakeProcessDelayInsights({
        loading,
        approval,
        manualDelays: relatedManual,
      }),
    };
  }, [
    loadingItems,
    approvalItems,
    storeItems,
    selectedJourneyLoadingId,
    selectedLoading,
  ]);

  const summaryStats = useMemo(() => {
    const visible = registerRows;
    const critical = visible.filter(
      (row) => (getDurationMinutes(row.startTime, row.endTime) ?? 0) >= 120,
    ).length;
    return {
      total: visible.length,
      manual: visible.filter((row) => row.source === DELAY_SOURCE.MANUAL).length,
      railway: visible.filter((row) => row.source === DELAY_SOURCE.APPROVAL).length,
      system: visible.filter((row) => row.source === DELAY_SOURCE.SYSTEM).length,
      critical,
    };
  }, [registerRows]);

  useEffect(() => {
    if (loadingIdParam) {
      dispatch(fetchLoadingById(loadingIdParam));
      setSelectedJourneyLoadingId(loadingIdParam);
      setViewMode("journey");
    } else if (rakeIdParam) {
      dispatch(fetchRakeById(rakeIdParam));
    }
  }, [dispatch, loadingIdParam, rakeIdParam]);

  useEffect(() => {
    if (selectedJourneyLoadingId || journeyOptions.length === 0) return;
    setSelectedJourneyLoadingId(journeyOptions[0].id);
  }, [journeyOptions, selectedJourneyLoadingId]);

  useEffect(() => {
    const source = selectedLoading ?? selectedRake;
    if (!source) return;

    setInlineForm({
      ...initialInlineForm,
      rakeNumber: source.rakeNumber ?? "",
    });
    setInlineActionMode("add");
    setActiveInlineLogId(null);
    setTableSearch(source.rakeNumber ?? "");
  }, [selectedLoading, selectedRake]);

  const currentInlineDuration = useMemo(
    () => formatDuration(getDurationMinutes(inlineForm.startTime, inlineForm.endTime)),
    [inlineForm.startTime, inlineForm.endTime],
  );

  const statusConfirmLog = useMemo(
    () => manualRows.find((item) => item.id === statusConfirmLogId),
    [manualRows, statusConfirmLogId],
  );

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return registerRows;

    const q = tableSearch.toLowerCase();
    return registerRows.filter((row) => {
      const durationLabel = formatDuration(
        getDurationMinutes(row.startTime, row.endTime),
      );
      const status = getStatusMeta(row).label;

      return [
        row.rakeNumber,
        row.category,
        row.processStage,
        row.source,
        row.startTime,
        row.endTime,
        row.reason,
        row.reportedBy,
        durationLabel,
        status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [registerRows, tableSearch]);

  const sortedRows = useMemo(() => {
    const getComparableValue = (row, field) => {
      if (field === "startTime" || field === "endTime") {
        return parseDateTimeToTimestamp(row[field]);
      }

      if (field === "duration") {
        return getDurationMinutes(row.startTime, row.endTime) ?? -1;
      }

      if (field === "status") {
        return getStatusMeta(row).label.toLowerCase();
      }

      if (field === "id") {
        return Number(row.id) || 0;
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
    setActiveInlineLogId(null);
    setMessage("");
  }

  function validateInlineForm() {
    if (inlineActionMode === "adjust") {
      if (!inlineForm.category || !inlineForm.endTime || !inlineForm.reason.trim()) {
        return "Fill category, end time, and reason before saving adjustment.";
      }

      const duration = getDurationMinutes(inlineForm.startTime, inlineForm.endTime);
      if (duration === null) {
        return "End time must be greater than start time.";
      }

      return "";
    }

    const requiredFields = [
      inlineForm.rakeNumber,
      inlineForm.category,
      inlineForm.startTime,
      inlineForm.endTime,
      inlineForm.reason,
      inlineForm.reportedBy,
    ];

    if (requiredFields.some((field) => !String(field || "").trim())) {
      return "Please fill all delay fields before saving.";
    }

    const duration = getDurationMinutes(inlineForm.startTime, inlineForm.endTime);
    if (duration === null) {
      return "End time must be greater than start time.";
    }

    return "";
  }

  async function handleInlineSave() {
    const validationMessage = validateInlineForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    const loadingContext = resolveLoadingForRakeNumber(
      inlineForm.rakeNumber.trim(),
      loadingItems,
      selectedLoading,
      selectedRake,
    );

    if (inlineActionMode === "adjust" && activeInlineLogId !== null) {
      const existing = manualRows.find((item) => item.id === activeInlineLogId);
      if (!existing) return;

      try {
        await dispatch(
          saveDelayRecord({
            ...existing,
            category: inlineForm.category,
            endTime: toIsoDateTime(inlineForm.endTime),
            reason: inlineForm.reason.trim(),
            startTime: toIsoDateTime(existing.startTime),
          }),
        ).unwrap();
        setMessage("Delay adjustment saved successfully.");
        clearInlineForm();
      } catch (error) {
        setMessage(error?.message || "Unable to save delay adjustment.");
      }
      return;
    }

    const normalized = {
      rakeNumber: inlineForm.rakeNumber.trim(),
      category: inlineForm.category,
      startTime: toIsoDateTime(inlineForm.startTime),
      endTime: toIsoDateTime(inlineForm.endTime),
      reason: inlineForm.reason.trim(),
      reportedBy: inlineForm.reportedBy.trim(),
      processStage: inferManualStageFromCategory(inlineForm.category),
      rakeId: loadingContext?.rakeId ?? selectedRake?.id ?? "",
      loadingId: loadingContext?.id ?? selectedLoading?.id ?? "",
      isDisabled: false,
    };

    if (inlineActionMode === "edit" && activeInlineLogId !== null) {
      const existing = manualRows.find((item) => item.id === activeInlineLogId);
      if (!existing) return;

      try {
        await dispatch(
          saveDelayRecord({
            ...existing,
            ...normalized,
          }),
        ).unwrap();
        setMessage("Delay log updated successfully.");
        clearInlineForm();
      } catch (error) {
        setMessage(error?.message || "Unable to update delay log.");
      }
      return;
    }

    try {
      await dispatch(
        saveDelayRecord({
          id: `DL-${Date.now()}`,
          ...normalized,
        }),
      ).unwrap();
      setMessage("Delay log added successfully.");
      clearInlineForm();
    } catch (error) {
      setMessage(error?.message || "Unable to add delay log.");
    }
  }

  function handleEditRow(row) {
    if (row.isReadOnly) {
      setMessage("System and railway approval delays are read-only. Log a manual delay if you need to annotate further.");
      return;
    }

    if (row.isDisabled) {
      setMessage("Enable this delay log before editing.");
      return;
    }

    setInlineForm({
      rakeNumber: row.rakeNumber,
      category: row.category,
      startTime: row.startTime,
      endTime: row.endTime,
      reason: row.reason,
      reportedBy: row.reportedBy,
    });
    setInlineActionMode("edit");
    setActiveInlineLogId(row.id);
    setMessage("");
  }

  function handleOpenAdjustment(row) {
    if (row.isReadOnly) {
      setMessage("Only manual delay logs can be adjusted.");
      return;
    }

    if (row.isDisabled) {
      setMessage("Enable this delay log before making adjustments.");
      return;
    }

    setInlineForm({
      rakeNumber: row.rakeNumber,
      category: row.category,
      startTime: row.startTime,
      endTime: row.endTime,
      reason: row.reason,
      reportedBy: row.reportedBy,
    });
    setInlineActionMode("adjust");
    setActiveInlineLogId(row.id);
    setMessage("");
  }

  function handleLoadRedirect(row) {
    if (row.isDisabled) return;

    if (row.loadingId) {
      navigate(loadingPathForLoading(row.loadingId));
      return;
    }

    if (row.rakeId) {
      navigate(loadingPathForRake(row.rakeId));
    }
  }

  function requestLogStatusToggle(logId) {
    setStatusConfirmLogId(logId);
  }

  function closeLogStatusDialog() {
    setStatusConfirmLogId(null);
  }

  function confirmLogStatusToggle() {
    if (statusConfirmLogId === null) return;
    const existing = manualRows.find((item) => item.id === statusConfirmLogId);
    if (!existing) return;

    dispatch(
      saveDelayRecord({
        ...existing,
        isDisabled: !existing.isDisabled,
        startTime: toIsoDateTime(existing.startTime),
        endTime: toIsoDateTime(existing.endTime),
      }),
    );
    setStatusConfirmLogId(null);
  }

  function toggleTimelineRow(row) {
    const key = row.loadingId || row.rakeNumber || row.id;
    setExpandedTimelineKey((current) => (current === key ? null : key));
  }

  function openRailwayApproval(loadingId) {
    if (!loadingId) return;
    navigate(`${ROUTES.ADMIN.RAILWAY_APPROVALS}?loadingId=${encodeURIComponent(loadingId)}`);
  }

  const inlineSaveDisabled =
    inlineActionMode === "adjust"
      ? !inlineForm.category ||
        !inlineForm.endTime ||
        !inlineForm.reason.trim()
      : !inlineForm.rakeNumber.trim() ||
        !inlineForm.category ||
        !inlineForm.startTime ||
        !inlineForm.endTime ||
        !inlineForm.reason.trim() ||
        !inlineForm.reportedBy.trim();

  const inlineSaveLabel =
    inlineActionMode === "edit"
      ? "Save Edit"
      : inlineActionMode === "adjust"
        ? "Save Adjustment"
        : "Add Delay";
  const inlineStatusLabel =
    inlineActionMode === "edit"
      ? "Editing"
      : inlineActionMode === "adjust"
        ? "Adjusting"
        : "Draft";
  const isInlineAdjustmentMode = inlineActionMode === "adjust";
  const areMainFieldsEditable = !isInlineAdjustmentMode;

  return (
    <>
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Delay Management
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Track manual delay logs together with end-to-end process delays from loading and railway approvals.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Visible delays</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{summaryStats.total}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/70">Manual logs</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{summaryStats.manual}</p>
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-700/70">Railway approval</p>
            <p className="mt-1 text-2xl font-bold text-violet-800">{summaryStats.railway}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">System detected</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{summaryStats.system}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700/70">Critical</p>
            <p className="mt-1 text-2xl font-bold text-rose-800">{summaryStats.critical}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("register")}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                viewMode === "register"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Delay Register
            </button>
            <button
              type="button"
              onClick={() => setViewMode("journey")}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                viewMode === "journey"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Rake Journey
            </button>
          </div>

          {viewMode === "register" ? (
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm">
              <input
                type="checkbox"
                checked={includeProcessDelays}
                onChange={(event) => setIncludeProcessDelays(event.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Include system & railway approval delays
            </label>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <ThemedSelect
                value={selectedJourneyLoadingId}
                onChange={(event) => setSelectedJourneyLoadingId(event.target.value)}
                className={`${compactInputClass} min-w-[260px]`}
              >
                <option value="">Select rake journey</option>
                {journeyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </ThemedSelect>
              {selectedJourney?.loading?.id ? (
                <button
                  type="button"
                  onClick={() => openRailwayApproval(selectedJourney.loading.id)}
                  className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                >
                  Open Railway Approval
                </button>
              ) : null}
            </div>
          )}
        </div>

        {message ? (
          <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            {message}
          </p>
        ) : null}

        {viewMode === "journey" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedJourney ? (
              <DelayProcessTimeline
                milestones={selectedJourney.insights.milestones}
                delays={selectedJourney.insights.delays}
                summary={selectedJourney.insights.summary}
                approval={selectedJourney.approval}
              />
            ) : (
              <p className="text-[14px] text-slate-500">
                Select a rake with loading data to review the end-to-end delay journey.
              </p>
            )}
          </div>
        ) : (
          <>
        <SearchBar
          placeholder="Search by rake number, category, process stage, source, reason, or status..."
          value={tableSearch}
          onChange={setTableSearch}
          showFilter={false}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-425 whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="sticky left-0 z-30 border-r border-slate-200/70 bg-slate-50 px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Actions
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Log ID" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Source
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Process Stage
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Category" field="category" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Start Time" field="startTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="End Time" field="endTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Duration" field="duration" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Reason" field="reason" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Reported By" field="reportedBy" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
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
                          {inlineActionMode === "edit"
                            ? `Editing #${activeInlineLogId}`
                            : `Adjusting #${activeInlineLogId}`}
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
                      value={activeInlineLogId ?? "New"}
                      className={compactInputClass}
                      readOnly
                      disabled
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
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                      Manual
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inferManualStageFromCategory(inlineForm.category) || "Auto"}
                      className={compactInputClass}
                      readOnly
                      disabled
                    />
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={inlineForm.category}
                      onChange={(event) => updateInline("category", event.target.value)}
                      className={compactInputClass}
                    >
                      <option value="">Category</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.startTime}
                      onChange={(event) => updateInline("startTime", event.target.value)}
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.endTime}
                      onChange={(event) => updateInline("endTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={currentInlineDuration}
                      className={compactInputClass}
                      readOnly
                      disabled
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.reason}
                      onChange={(event) => updateInline("reason", event.target.value)}
                      placeholder="Reason"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.reportedBy}
                      onChange={(event) => updateInline("reportedBy", event.target.value)}
                      placeholder="Reported By"
                      className={compactInputClass}
                      disabled={!areMainFieldsEditable}
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
                    <td colSpan={12} className="px-5 py-12 text-center">
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
                          No delay logs found
                        </p>
                        <p className="text-[13px] text-slate-400">
                          Try adjusting your search keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => {
                    const duration = formatDuration(
                      getDurationMinutes(row.startTime, row.endTime),
                    );
                    const statusMeta = getStatusMeta(row);
                    const isAdjusting =
                      inlineActionMode === "adjust" && activeInlineLogId === row.id;
                    const actionCellClass =
                      row.id === activeInlineLogId
                        ? "bg-amber-50"
                        : "bg-white group-hover:bg-slate-50";
                    const timelineKey = row.loadingId || row.rakeNumber || row.id;
                    const isTimelineOpen = expandedTimelineKey === timelineKey;
                    const rowLoading = loadingItems.find(
                      (item) =>
                        item.id === row.loadingId ||
                        item.rakeNumber === row.rakeNumber ||
                        item.rakeId === row.rakeId,
                    );
                    const rowApproval = rowLoading
                      ? approvalItems.find((item) => item.loadingId === rowLoading.id)
                      : null;
                    const rowInsights =
                      rowLoading &&
                      buildRakeProcessDelayInsights({
                        loading: rowLoading,
                        approval: rowApproval,
                        manualDelays: storeItems.filter(
                          (item) =>
                            item.loadingId === rowLoading.id ||
                            item.rakeNumber === rowLoading.rakeNumber,
                        ),
                      });

                    return (
                      <Fragment key={row.id}>
                      <tr
                        className={`hover:bg-slate-50/60 transition-colors group [&>td]:py-5 ${
                          row.id === activeInlineLogId ? "bg-amber-50/60" : ""
                        } ${row.isDisabled ? "opacity-70" : ""}`}
                      >
                        <td
                          className={`sticky left-0 z-20 border-r border-slate-200/70 px-5 py-4 ${actionCellClass}`}
                        >
                          <div className="flex items-center justify-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEditRow(row)}
                              disabled={row.isDisabled || row.isReadOnly}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled || row.isReadOnly
                                  ? "cursor-not-allowed text-slate-300"
                                  : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                              title={row.isReadOnly ? "Read-only delay" : row.isDisabled ? "Enable to edit" : "Edit"}
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAdjustment(row)}
                              disabled={row.isDisabled || row.isReadOnly}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled || row.isReadOnly
                                  ? "cursor-not-allowed text-slate-300"
                                  : isAdjusting
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                              aria-label={row.isReadOnly ? "Read-only delay" : "Adjustment"}
                              title={row.isReadOnly ? "Read-only delay" : "Adjustment"}
                            >
                              <AdjustmentIcon className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLoadRedirect(row)}
                              disabled={row.isDisabled || (!row.loadingId && !row.rakeId)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled || (!row.loadingId && !row.rakeId)
                                  ? "cursor-not-allowed text-slate-300"
                                  : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                              }`}
                              aria-label="Load management"
                              title="Load management"
                            >
                              <LoadingIcon className="h-4 w-4" />
                            </button>

                            {rowLoading ? (
                              <button
                                type="button"
                                onClick={() => toggleTimelineRow(row)}
                                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                                  isTimelineOpen
                                    ? "bg-violet-100 text-violet-700"
                                    : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                                }`}
                              >
                                Journey
                              </button>
                            ) : null}

                            {!row.isReadOnly ? (
                              <button
                                type="button"
                                onClick={() => requestLogStatusToggle(row.id)}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                  row.isDisabled
                                    ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                                    : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                }`}
                                title={row.isDisabled ? "Enable" : "Disable"}
                              >
                                {row.isDisabled ? <EnableIcon /> : <DisableIcon />}
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-blue-600">#{row.id}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.rakeNumber}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${
                              sourceBadgeStyles[row.source] ?? sourceBadgeStyles[DELAY_SOURCE.MANUAL]
                            }`}
                          >
                            {sourceBadgeLabels[row.source] ?? "Manual"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.processStage || "-"}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.startTime)}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.endTime)}</td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-blue-700">{duration}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.reason}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.reportedBy}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${statusMeta.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                            {statusMeta.label}
                          </span>
                        </td>
                      </tr>
                      {isTimelineOpen && rowInsights ? (
                        <tr key={`${row.id}-timeline`}>
                          <td colSpan={12} className="bg-slate-50/80 px-5 py-4">
                            <DelayProcessTimeline
                              milestones={rowInsights.milestones}
                              delays={rowInsights.delays}
                              summary={rowInsights.summary}
                              approval={rowApproval}
                              compact
                            />
                          </td>
                        </tr>
                      ) : null}
                      </Fragment>
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
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(statusConfirmLog)}
        onClose={closeLogStatusDialog}
        onConfirm={confirmLogStatusToggle}
        title={statusConfirmLog?.isDisabled ? "Enable Delay Log" : "Disable Delay Log"}
        message={
          statusConfirmLog?.isDisabled
            ? "Are you sure you want to enable this delay log?"
            : "Are you sure you want to disable this delay log?"
        }
        itemName={
          statusConfirmLog
            ? `${statusConfirmLog.rakeNumber} - ${statusConfirmLog.category}`
            : ""
        }
        confirmLabel={statusConfirmLog?.isDisabled ? "Enable" : "Disable"}
        variant={statusConfirmLog?.isDisabled ? "warning" : "danger"}
      />
    </>
  );
}