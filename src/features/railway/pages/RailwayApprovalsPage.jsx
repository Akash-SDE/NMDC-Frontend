import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import SearchBar from "../../../components/shared/SearchBar";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import Pagination from "../../../components/shared/Pagination";
import { useClientPagination } from "../../../hooks/useClientPagination";
import { useColumnFilters } from "../../../hooks/useColumnFilters";
import ColumnFilterRow from "../../../components/shared/ColumnFilterRow";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { ApprovalTrackerPanel } from "../../../components/common/ApprovalTracker";
import RailwayWagonManifestPanel, {
  DepartmentInspectionFields,
  PriorDepartmentInspections,
} from "../../../components/railway/RailwayWagonInspection";
import { fetchWagonManifestByRakeNumber } from "../../../services/railway/railwayWagonService";
import {
  addWagonToManifest,
  buildDepartmentInspectionFromManifest,
  buildInspectionPayload,
  createEmptyWagonManifest,
  emptyDepartmentInspection,
  normalizeDepartmentInspection,
  normalizeWagonManifest,
  removeWagonFromManifest,
  wagonListFromInput,
} from "../../../utils/wagonInspectionUtils";
import { useAuth } from "../../../context/AuthContext";
import { RAILWAY_DEPARTMENT_BY_ROLE, USER_ROLES } from "../../../constants/roles";
import {
  APPROVAL_DEPARTMENTS,
  APPROVAL_STATUS,
  APPROVAL_STEP_LABELS,
  REVIEW_DEPARTMENTS,
} from "../../../constants/approval";
import {
  fetchApprovalRequests,
  saveApprovalWagonManifest,
  submitApprovalDecision,
} from "../../../store/slices/approvalSlice";
import { listLoadingRecords } from "../../../services/loadingManagementService";
import { asResults, mapReportLoading } from "../../reports/utils/reportApiMappers";
import {
  getDepartmentStepPresentation,
  getNmdcStepPresentation,
  getOverallStatusMessage,
  getPendingDepartmentForApproval,
  getPendingDepartmentsForApproval,
  isApprovalAwaitingAction,
  canUserReviewDepartment,
} from "../../../utils/approvalUtils";
import RailwayApprovalStageCell, {
  RailwayNmdcStageCell,
} from "../components/RailwayApprovalStageCell";
import { formatDateTimeForTable, getLocalDateTimeValue } from "../../../utils/dateUtils";
import { sendRailwayApprovalMemo } from "../../../services/railwayApprovalService";
import { formatRailwayApprovalMemo } from "../utils/railwayApprovalMemo";
import { markNmdcMemoSent, readNmdcMemoSentFlags } from "../utils/nmdcMemoStorage";

const STAGE_COLUMNS = [
  { id: APPROVAL_DEPARTMENTS.OPERATIONS, label: "Railway Operations" },
  { id: APPROVAL_DEPARTMENTS.CW, label: "C&W Check" },
  { id: APPROVAL_DEPARTMENTS.COMMERCIAL, label: "Commercial Check" },
];

function buildQueueFilterColumns() {
  return [
    { key: "rakeNumber", label: "Rake Number" },
    ...STAGE_COLUMNS.map((col) => ({
      key: col.id,
      label: col.label,
      type: "select",
      getValue: (approval) => {
        const presentation = getDepartmentStepPresentation(approval, col.id);
        if (presentation === "complete") return "Complete";
        if (presentation === "rejected") return "Rejected";
        if (presentation === "not_required") return "Not Required";
        if (presentation === "actionable") return "Pending";
        return "Pending";
      },
    })),
    {
      key: "nmdc",
      label: "NMDC Check",
      type: "select",
      getValue: (approval) => {
        const presentation = getNmdcStepPresentation(approval);
        if (presentation === "complete") return "Complete";
        if (presentation === "in_progress") return "In Progress";
        if (presentation === "rejected") return "Rejected";
        return "Pending";
      },
    },
    {
      key: "overallStatus",
      label: "Overall Status",
      type: "select",
      getValue: getOverallStatusMessage,
    },
  ];
}

function rowIsActionableForUser(approval, { ownDepartment, isAdminProxy }) {
  return STAGE_COLUMNS.some((col) =>
    canUserReviewDepartment(approval, col.id, { userDepartment: ownDepartment, isAdminProxy }),
  );
}

const WAGON_LIST_FIELDS = new Set([
  "overloaded",
  "unevenRake",
  "uneven",
  "sick",
  "repair",
  "doorUnlock",
  "singleBar",
  "downsideCheck",
]);

function buildDecisionActor(user, department, isAdminProxy) {
  const baseName = user?.name || user?.email || "User";
  if (!isAdminProxy) return baseName;
  const departmentLabel = APPROVAL_STEP_LABELS[department] || department;
  return `${baseName} (on behalf of ${departmentLabel})`;
}

function joinDepartmentLabels(departments) {
  return departments.map((department) => APPROVAL_STEP_LABELS[department]).join(" & ");
}

function describeDecisionOutcome(action, department, updated, isAdminProxy) {
  const actingAs = isAdminProxy ? ` on behalf of ${APPROVAL_STEP_LABELS[department]}` : "";
  if (action !== "approve") return `Approval rejected${actingAs}.`;
  if (updated?.status === APPROVAL_STATUS.APPROVED) {
    return `Approved${actingAs}. Overall status is OK and the loading is ready for dispatch.`;
  }
  const waitingOn = getPendingDepartmentsForApproval(updated);
  if (waitingOn.length === 0) return `Approved${actingAs}.`;
  const lead = department === APPROVAL_DEPARTMENTS.OPERATIONS ? "Sent to" : "Still awaiting";
  const parallel = waitingOn.length > 1 ? " for parallel approval" : "";
  return `Approved${actingAs}. ${lead} ${joinDepartmentLabels(waitingOn)}${parallel}.`;
}

export default function RailwayApprovalsPage() {
  const dispatch = useDispatch();
  const { user, userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const approvals = useSelector((state) => state.approvals.items);
  const approvalStatus = useSelector((state) => state.approvals.status);
  const approvalError = useSelector((state) => state.approvals.error);
  const [loadingItems, setLoadingItems] = useState([]);

  const isAdminProxy = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.SUPERADMIN;
  const ownDepartment = isAdminProxy
    ? null
    : RAILWAY_DEPARTMENT_BY_ROLE[userRole] ?? APPROVAL_DEPARTMENTS.OPERATIONS;

  const focusedLoadingId = searchParams.get("loadingId");
  const [search, setSearch] = useState("");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [reviewDepartment, setReviewDepartment] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [trackClearanceTime, setTrackClearanceTime] = useState(getLocalDateTimeValue());
  const [inspectionForm, setInspectionForm] = useState(emptyDepartmentInspection());
  const [wagonManifest, setWagonManifest] = useState(null);
  const [manifestSaving, setManifestSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [approvalTargets, setApprovalTargets] = useState([]);
  const [message, setMessage] = useState("");
  const [nmdcMemoSentByApprovalId, setNmdcMemoSentByApprovalId] = useState(() =>
    readNmdcMemoSentFlags(),
  );
  const [memoPreviewOpen, setMemoPreviewOpen] = useState(false);
  const [memoPreviewText, setMemoPreviewText] = useState("");
  const [memoSending, setMemoSending] = useState(false);

  const reloadLoadingItems = useCallback(
    () =>
      listLoadingRecords({ page_size: 1000 })
        .then((response) => setLoadingItems(asResults(response).map(mapReportLoading)))
        .catch(() => setLoadingItems([])),
    [],
  );

  useEffect(() => {
    dispatch(fetchApprovalRequests());
    reloadLoadingItems();
  }, [dispatch, reloadLoadingItems]);

  const loadingById = useMemo(
    () => Object.fromEntries(loadingItems.map((item) => [item.id, item])),
    [loadingItems],
  );

  const visibleQueueItems = useMemo(() => {
    if (focusedLoadingId) {
      return approvals.filter(
        (approval) => String(approval.loadingId) === String(focusedLoadingId),
      );
    }
    return approvals.filter(isApprovalAwaitingAction);
  }, [approvals, focusedLoadingId]);

  const searchedQueueItems = useMemo(() => {
    if (!search.trim()) return visibleQueueItems;
    const q = search.toLowerCase();
    return visibleQueueItems.filter((approval) =>
      [approval.rakeNumber, approval.customer, approval.siding, approval.loadingId]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [visibleQueueItems, search]);

  const queueFilterColumns = useMemo(() => buildQueueFilterColumns(), []);
  const columnFilters = useColumnFilters(queueFilterColumns);
  const { applyFilters } = columnFilters;
  const queueItems = useMemo(
    () => applyFilters(searchedQueueItems),
    [applyFilters, searchedQueueItems],
  );

  const { pageItems: pagedQueueItems, paginationProps } = useClientPagination(queueItems, {
    resetKey: `${search}|${focusedLoadingId ?? ""}|${columnFilters.filterKey}`,
  });

  const refreshQueue = useCallback(() => {
    dispatch(fetchApprovalRequests());
    reloadLoadingItems();
  }, [dispatch, reloadLoadingItems]);

  const openApproval = useCallback(async (approval, preferredDepartment = null) => {
    const pendingDepartment = getPendingDepartmentForApproval(approval, preferredDepartment);
    if (!pendingDepartment) return;

    setSelectedApproval(approval);
    setReviewDepartment(pendingDepartment);
    setRemarks("");
    setTrackClearanceTime(getLocalDateTimeValue());
    setInspectionForm(emptyDepartmentInspection());
    setApprovalTargets(
      pendingDepartment === APPROVAL_DEPARTMENTS.OPERATIONS ? [...REVIEW_DEPARTMENTS] : [],
    );
    setWagonManifest(null);

    try {
      const apiManifest = await fetchWagonManifestByRakeNumber(approval.rakeNumber);
      const baseManifest =
        approval.wagonManifest ?? apiManifest ?? createEmptyWagonManifest(approval);
      const manifest = normalizeWagonManifest(baseManifest, approval);
      setWagonManifest(manifest);
      setInspectionForm(buildDepartmentInspectionFromManifest(pendingDepartment, manifest));
    } catch {
      const fallbackManifest = normalizeWagonManifest(
        approval.wagonManifest ?? createEmptyWagonManifest(approval),
        approval,
      );
      setWagonManifest(fallbackManifest);
      setInspectionForm(buildDepartmentInspectionFromManifest(pendingDepartment, fallbackManifest));
    }
  }, []);

  function syncInspectionFromManifest(manifest, department = reviewDepartment) {
    if (!manifest || !department) return;
    setInspectionForm(buildDepartmentInspectionFromManifest(department, manifest));
  }

  function switchReviewDepartment(department) {
    if (department === reviewDepartment) return;
    setReviewDepartment(department);
    setRemarks("");
    setInspectionForm(
      wagonManifest
        ? buildDepartmentInspectionFromManifest(department, wagonManifest)
        : emptyDepartmentInspection(),
    );
  }

  function toggleApprovalTarget(department, checked) {
    setApprovalTargets((prev) =>
      checked
        ? REVIEW_DEPARTMENTS.filter((item) => item === department || prev.includes(item))
        : prev.filter((item) => item !== department),
    );
  }

  function closeApproval() {
    setSelectedApproval(null);
    setReviewDepartment(null);
    setWagonManifest(null);
    setInspectionForm(emptyDepartmentInspection());
    setConfirmAction(null);
    setApprovalTargets([]);
  }

  async function persistWagonManifest(nextManifest) {
    if (!selectedApproval) return null;
    setManifestSaving(true);
    try {
      const saved = await dispatch(
        saveApprovalWagonManifest({
          approvalId: selectedApproval.id,
          manifest: nextManifest,
        }),
      ).unwrap();
      setWagonManifest(saved.wagonManifest);
      setSelectedApproval(saved);
      return saved.wagonManifest;
    } finally {
      setManifestSaving(false);
    }
  }

  async function handleAddWagon(wagonNumber, flags) {
    if (!wagonManifest) return;
    const nextManifest = addWagonToManifest(wagonManifest, wagonNumber, flags);
    const saved = await persistWagonManifest(nextManifest);
    if (saved) {
      syncInspectionFromManifest(saved);
    }
    setMessage(`Wagon ${wagonNumber} added to railway register.`);
  }

  async function handleRemoveWagon(wagonNumber) {
    if (!wagonManifest) return;
    const nextManifest = removeWagonFromManifest(wagonManifest, wagonNumber);
    const saved = await persistWagonManifest(nextManifest);
    if (saved) {
      syncInspectionFromManifest(saved);
    }
    setMessage(`Wagon ${wagonNumber} removed from railway register.`);
  }

  function handleInspectionChange(field, value) {
    setInspectionForm((prev) => {
      if (WAGON_LIST_FIELDS.has(field)) {
        return { ...prev, [field]: wagonListFromInput(value) };
      }
      return { ...prev, [field]: value };
    });
  }

  function requestDecision(action) {
    if (reviewDepartment === APPROVAL_DEPARTMENTS.OPERATIONS && action === "approve") {
      if (!trackClearanceTime) {
        setMessage("Track clearance time is required for operations approval.");
        return;
      }
      if (approvalTargets.length === 0) {
        setMessage("Select at least one department (Railway Commercial or Railway C&W) to send the approval to.");
        return;
      }
    }
    setConfirmAction(action);
  }

  function openMemoPreview() {
    if (!selectedApproval || !reviewDepartment) return;
    if (!REVIEW_DEPARTMENTS.includes(reviewDepartment)) return;
    setMemoPreviewText(
      formatRailwayApprovalMemo({
        approval: selectedApproval,
        department: reviewDepartment,
        actor: buildDecisionActor(user, reviewDepartment, isAdminProxy),
        remarks,
        loading: loadingById[selectedApproval.loadingId],
      }),
    );
    setMemoPreviewOpen(true);
  }

  async function confirmSendMemo() {
    if (!selectedApproval || !reviewDepartment) return;
    setMemoSending(true);
    try {
      const result = await sendRailwayApprovalMemo(selectedApproval, {
        department: reviewDepartment,
        actor: buildDecisionActor(user, reviewDepartment, isAdminProxy),
        remarks,
        loading: loadingById[selectedApproval.loadingId],
      });
      setNmdcMemoSentByApprovalId(markNmdcMemoSent(selectedApproval.id));
      setMemoPreviewOpen(false);
      const fromLine = result?.from_email ? ` From ${result.from_email}.` : "";
      const toLine =
        Array.isArray(result?.recipients) && result.recipients.length
          ? ` Delivered to ${result.recipients.join(", ")}.`
          : "";
      setMessage(`Memo sent to NMDC.${fromLine}${toLine}`);
    } catch (error) {
      setMessage(error?.message || "Unable to send memo to NMDC.");
    } finally {
      setMemoSending(false);
    }
  }

  async function confirmDecision() {
    if (!selectedApproval || !confirmAction || !reviewDepartment) return;

    try {
      const inspectionPayload = buildInspectionPayload(
        reviewDepartment,
        normalizeDepartmentInspection({
          ...inspectionForm,
          ...(reviewDepartment === APPROVAL_DEPARTMENTS.OPERATIONS
            ? { trackClearanceTime }
            : {}),
        }),
      );

      const result = await dispatch(
        submitApprovalDecision({
          approval: selectedApproval,
          department: reviewDepartment,
          decision: {
            action: confirmAction,
            actor: buildDecisionActor(user, reviewDepartment, isAdminProxy),
            remarks,
            inspection: inspectionPayload,
            ...(reviewDepartment === APPROVAL_DEPARTMENTS.OPERATIONS
              ? { trackClearanceTime }
              : {}),
          },
          targets:
            reviewDepartment === APPROVAL_DEPARTMENTS.OPERATIONS ? approvalTargets : undefined,
        }),
      ).unwrap();

      setConfirmAction(null);
      await dispatch(fetchApprovalRequests());
      await reloadLoadingItems();
      setMessage(
        describeDecisionOutcome(confirmAction, reviewDepartment, result?.approval, isAdminProxy),
      );
      closeApproval();
    } catch (error) {
      setConfirmAction(null);
      setMessage(error?.message || "Unable to submit approval decision.");
    }
  }

  const selectedLoading = selectedApproval
    ? loadingById[selectedApproval.loadingId]
    : null;

  const reviewDepartmentLabel = reviewDepartment
    ? APPROVAL_STEP_LABELS[reviewDepartment]
    : "";

  const selectedPendingDepartments = getPendingDepartmentsForApproval(selectedApproval);

  const routingNote =
    reviewDepartment === APPROVAL_DEPARTMENTS.OPERATIONS && approvalTargets.length > 0
      ? ` This will send the approval to ${joinDepartmentLabels(approvalTargets)}${
          approvalTargets.length > 1 ? " for parallel approval" : ""
        }.`
      : "";

  const canSendNmdcMemo =
    Boolean(selectedApproval) &&
    Boolean(reviewDepartment) &&
    REVIEW_DEPARTMENTS.includes(reviewDepartment);

  function nmdcPresentationFor(approval) {
    return getNmdcStepPresentation(approval, {
      memoSent: Boolean(nmdcMemoSentByApprovalId[String(approval.id)]),
    });
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">
            Railway Approval Queue
          </h2>
          <p className="mt-1 text-[14px] text-slate-500">
            {isAdminProxy
              ? "Review and approve loading records on behalf of railway departments when required."
              : "Review completed loading records and grant railway approvals. Railway Commercial and C&W review in parallel once Operations sends a rake to both."}
          </p>
        </div>

        {isAdminProxy ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">Administrator proxy mode</p>
            <p className="mt-1 text-[13px] text-amber-800">
              All approval stages appear in one table. Use the <strong>Review</strong> button in the
              active column to act on behalf of Railway Operations, Commercial, or C&amp;W. Each
              decision is recorded as admin acting on behalf of that department.
            </p>
          </div>
        ) : null}

        {approvalError ? (
          <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {approvalError}
          </p>
        ) : null}

        {message ? (
          <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            {message}
          </p>
        ) : null}

        <SearchBar
          placeholder="Search by rake number, customer, siding..."
          value={search}
          onChange={setSearch}
          showFilter={false}
        />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Rake Number
                  </th>
                  {STAGE_COLUMNS.map((col) => (
                    <th
                      key={col.id}
                      className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    NMDC Check
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Overall Status
                  </th>
                </tr>
                <ColumnFilterRow
                  {...columnFilters.filterRowProps}
                  rows={visibleQueueItems}
                  cellClassName="px-5 py-2"
                />
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvalStatus === "loading" && queueItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                      Loading railway approvals...
                    </td>
                  </tr>
                ) : queueItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                      {visibleQueueItems.length > 0
                        ? "No approvals match your search or column filters."
                        : focusedLoadingId
                          ? "No railway approval was found for this loading record."
                          : "No loading records are awaiting railway approval."}
                    </td>
                  </tr>
                ) : (
                  pagedQueueItems.map((approval) => {
                    const rowActive = rowIsActionableForUser(approval, {
                      ownDepartment,
                      isAdminProxy,
                    });
                    const overallStatus = getOverallStatusMessage(approval);
                    return (
                      <tr
                        key={approval.id}
                        className={`transition-colors ${
                          rowActive ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-[14px] font-bold text-[#2563eb]">
                          {approval.rakeNumber}
                        </td>
                        {STAGE_COLUMNS.map((col) => (
                          <td key={col.id} className="px-5 py-4 align-middle">
                            <RailwayApprovalStageCell
                              approval={approval}
                              department={col.id}
                              presentation={getDepartmentStepPresentation(approval, col.id)}
                              onReview={openApproval}
                              userDepartment={ownDepartment}
                              isAdminProxy={isAdminProxy}
                            />
                          </td>
                        ))}
                        <td className="px-5 py-4 align-middle">
                          <RailwayNmdcStageCell presentation={nmdcPresentationFor(approval)} />
                        </td>
                        <td
                          className={`px-5 py-4 text-[13px] font-medium ${
                            overallStatus === "OK" ? "font-semibold text-emerald-700" : "text-slate-700"
                          }`}
                        >
                          {overallStatus}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
            <button
              type="button"
              onClick={refreshQueue}
              disabled={approvalStatus === "loading"}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${approvalStatus === "loading" ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {queueItems.length > 0 ? <Pagination {...paginationProps} /> : null}
          </div>
        </div>
      </div>

      {selectedApproval && reviewDepartment
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Review {selectedApproval.rakeNumber}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedApproval.customer} · {selectedApproval.siding}
                </p>
                {isAdminProxy ? (
                  <p className="mt-1 text-[12px] font-semibold text-amber-700">
                    Acting on behalf of {reviewDepartmentLabel}
                  </p>
                ) : null}
                {isAdminProxy && selectedPendingDepartments.length > 1 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPendingDepartments.map((department) => (
                      <button
                        key={department}
                        type="button"
                        onClick={() => switchReviewDepartment(department)}
                        className={`rounded-md border px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                          reviewDepartment === department
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        Review as {APPROVAL_STEP_LABELS[department]}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={closeApproval} className={uniformSecondaryButtonClass}>
                Close
              </button>
            </div>

            <UniformSectionCard
              title="Loading Summary"
              subtitle="Read-only operational details from the loading application."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <UniformFormField label="Rake Number">
                  <input readOnly className={uniformInputClass} value={selectedApproval.rakeNumber} />
                </UniformFormField>
                <UniformFormField label="Tonnage">
                  <input
                    readOnly
                    className={uniformInputClass}
                    value={selectedLoading?.tonnage || selectedApproval.tonnage || "-"}
                  />
                </UniformFormField>
                <UniformFormField label="Completion Time">
                  <input
                    readOnly
                    className={uniformInputClass}
                    value={formatDateTimeForTable(
                      selectedLoading?.completionTime || selectedApproval.completionTime,
                    )}
                  />
                </UniformFormField>
              </div>
            </UniformSectionCard>

            <div className="mt-4">
              <RailwayWagonManifestPanel
                manifest={wagonManifest}
                loading={selectedLoading}
                editable
                saving={manifestSaving}
                onAddWagon={handleAddWagon}
                onRemoveWagon={handleRemoveWagon}
              />
            </div>

            <div className="mt-4">
              <ApprovalTrackerPanel approval={selectedApproval} showHistory />
            </div>

            <div className="mt-4">
              <PriorDepartmentInspections
                approval={selectedApproval}
                reviewDepartment={reviewDepartment}
              />
            </div>

            <div className="mt-4">
              <UniformSectionCard
                title={`${reviewDepartmentLabel} Wagon Inspection`}
                subtitle={
                  reviewDepartment === APPROVAL_DEPARTMENTS.COMMERCIAL
                    ? "Fields auto-fill from wagon numbers and railway flags added in the register above. You can edit before approving."
                    : "Record wagon counts, wagon numbers, and checklist results for this department."
                }
              >
                <DepartmentInspectionFields
                  department={reviewDepartment}
                  form={inspectionForm}
                  onChange={handleInspectionChange}
                  trackClearanceTime={trackClearanceTime}
                  onTrackClearanceTimeChange={setTrackClearanceTime}
                />
              </UniformSectionCard>
            </div>

            <div className="mt-4">
              <UniformSectionCard
                title={`${reviewDepartmentLabel} Decision`}
                subtitle={
                  isAdminProxy
                    ? "Record the railway decision as administrator proxy for this department."
                    : "Record the railway decision for the active department."
                }
              >
              <UniformFormField label="Remarks">
                <textarea
                  className={`${uniformInputClass} min-h-20`}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Approval remarks..."
                />
              </UniformFormField>

              {reviewDepartment === APPROVAL_DEPARTMENTS.OPERATIONS && (
                <div className="mt-4">
                  <UniformFormField label="Send Approval To" required>
                    <div className="space-y-2">
                      {REVIEW_DEPARTMENTS.map((department) => (
                        <label
                          key={department}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={approvalTargets.includes(department)}
                            onChange={(event) =>
                              toggleApprovalTarget(department, event.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium">{APPROVAL_STEP_LABELS[department]}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {approvalTargets.length > 1
                        ? "Both selected: the rake appears in the Railway Commercial and Railway C&W queues at the same time and is approved once both departments approve."
                        : approvalTargets.length === 1
                          ? `Only ${APPROVAL_STEP_LABELS[approvalTargets[0]]} will review; the other department is marked Not Required.`
                          : "Select at least one department."}
                    </p>
                  </UniformFormField>
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => requestDecision("reject")}
                  className="inline-flex h-10 items-center rounded-lg border border-rose-300 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Reject
                </button>
                {canSendNmdcMemo ? (
                  <button
                    type="button"
                    onClick={openMemoPreview}
                    disabled={memoSending}
                    className={uniformSecondaryButtonClass}
                  >
                    Send Memo
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => requestDecision("approve")}
                  className={uniformPrimaryButtonClass}
                >
                  Approve
                </button>
              </div>
            </UniformSectionCard>
            </div>
          </div>
            </div>,
            document.body,
          )
        : null}

      {memoPreviewOpen
        ? createPortal(
            <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-900/40 p-4">
              <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white p-5 shadow-xl">
                <h3 className="text-lg font-bold text-slate-800">Send memo to NMDC</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Review the formatted memo below. It will be sent to NMDC administration for this
                  rake.
                </p>
                <textarea
                  readOnly
                  className={`${uniformInputClass} mt-4 min-h-[320px] flex-1 font-mono text-xs leading-relaxed`}
                  value={memoPreviewText}
                />
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMemoPreviewOpen(false)}
                    disabled={memoSending}
                    className={uniformSecondaryButtonClass}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmSendMemo}
                    disabled={memoSending}
                    className={uniformPrimaryButtonClass}
                  >
                    {memoSending ? "Sending…" : "Send to NMDC"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {Boolean(confirmAction)
        ? createPortal(
            <ConfirmDialog
              isOpen
              onClose={() => setConfirmAction(null)}
              onConfirm={confirmDecision}
              title={confirmAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              message={
                confirmAction === "approve"
                  ? isAdminProxy
                    ? `Approve this step on behalf of ${reviewDepartmentLabel}?${routingNote}`
                    : `Are you sure you want to approve this railway step?${routingNote}`
                  : isAdminProxy
                    ? `Reject this step on behalf of ${reviewDepartmentLabel}?`
                    : "Are you sure you want to reject this railway approval step?"
              }
              itemName={selectedApproval?.rakeNumber || ""}
              confirmLabel={confirmAction === "approve" ? "Approve" : "Reject"}
              variant={confirmAction === "approve" ? "warning" : "danger"}
              overlayClassName="z-[110]"
            />,
            document.body,
          )
        : null}
    </>
  );
}
