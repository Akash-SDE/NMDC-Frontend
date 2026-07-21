import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../../../components/shared/SearchBar";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
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
import { USER_ROLES } from "../../../constants/roles";
import {
  APPROVAL_DEPARTMENTS,
  APPROVAL_STEP_LABELS,
  countPendingApprovals,
} from "../../../constants/approval";
import {
  fetchApprovalRequests,
  saveApprovalWagonManifest,
  submitApprovalDecision,
} from "../../../store/slices/approvalSlice";
import { fetchLoadingRecords } from "../../../store/slices/loadingSlice";
import {
  canDepartmentAct,
  getPendingDepartmentForApproval,
  isApprovalAwaitingAction,
} from "../../../utils/approvalUtils";
import { formatDateTimeForTable, getLocalDateTimeValue } from "../../../utils/dateUtils";

const ADMIN_ALL_TAB = "all";

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

const DEPARTMENT_TABS = [
  { id: APPROVAL_DEPARTMENTS.OPERATIONS, label: "Railway Operations" },
  { id: APPROVAL_DEPARTMENTS.COMMERCIAL, label: "Railway Commercial" },
  { id: APPROVAL_DEPARTMENTS.CW, label: "Railway C&W" },
];

function resolveDefaultDepartment(userRole) {
  if (userRole === USER_ROLES.ADMIN) return ADMIN_ALL_TAB;
  if (userRole === USER_ROLES.COMMERCIAL) return APPROVAL_DEPARTMENTS.COMMERCIAL;
  if (userRole === USER_ROLES.CW_INSPECTOR) return APPROVAL_DEPARTMENTS.CW;
  return APPROVAL_DEPARTMENTS.OPERATIONS;
}

function buildDecisionActor(user, department, isAdminProxy) {
  const baseName = user?.name || user?.email || "User";
  if (!isAdminProxy) return baseName;
  const departmentLabel = APPROVAL_STEP_LABELS[department] || department;
  return `${baseName} (on behalf of ${departmentLabel})`;
}

export default function RailwayApprovalsPage() {
  const dispatch = useDispatch();
  const { user, userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const approvals = useSelector((state) => state.approvals.items);
  const loadingItems = useSelector((state) => state.loading.items);

  const isAdminProxy = userRole === USER_ROLES.ADMIN;
  const visibleTabs = isAdminProxy
    ? [{ id: ADMIN_ALL_TAB, label: "All Pending" }, ...DEPARTMENT_TABS]
    : DEPARTMENT_TABS;

  const activeDepartment =
    searchParams.get("dept") || resolveDefaultDepartment(userRole);
  const [search, setSearch] = useState("");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [reviewDepartment, setReviewDepartment] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [trackClearanceTime, setTrackClearanceTime] = useState(getLocalDateTimeValue());
  const [inspectionForm, setInspectionForm] = useState(emptyDepartmentInspection());
  const [wagonManifest, setWagonManifest] = useState(null);
  const [manifestSaving, setManifestSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchApprovalRequests());
    dispatch(fetchLoadingRecords());
  }, [dispatch]);

  const loadingById = useMemo(
    () => Object.fromEntries(loadingItems.map((item) => [item.id, item])),
    [loadingItems],
  );

  const pendingCount = useMemo(() => countPendingApprovals(approvals), [approvals]);

  const queueItems = useMemo(() => {
    const matchesSearch = (approval) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [approval.rakeNumber, approval.customer, approval.siding, approval.loadingId]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    if (isAdminProxy && activeDepartment === ADMIN_ALL_TAB) {
      return approvals.filter(isApprovalAwaitingAction).filter(matchesSearch);
    }

    return approvals
      .filter((approval) => canDepartmentAct(approval, activeDepartment))
      .filter(matchesSearch);
  }, [approvals, activeDepartment, search, isAdminProxy]);

  async function openApproval(approval) {
    const pendingDepartment = getPendingDepartmentForApproval(approval);
    setSelectedApproval(approval);
    setReviewDepartment(pendingDepartment);
    setRemarks("");
    setTrackClearanceTime(getLocalDateTimeValue());
    setInspectionForm(emptyDepartmentInspection());

    const apiManifest = await fetchWagonManifestByRakeNumber(approval.rakeNumber);
    const baseManifest =
      approval.wagonManifest ??
      apiManifest ??
      createEmptyWagonManifest(approval);
    setWagonManifest(normalizeWagonManifest(baseManifest, approval));
    if (baseManifest && pendingDepartment) {
      const manifest = normalizeWagonManifest(baseManifest, approval);
      setInspectionForm(buildDepartmentInspectionFromManifest(pendingDepartment, manifest));
    }
  }

  function syncInspectionFromManifest(manifest, department = reviewDepartment) {
    if (!manifest || !department) return;
    setInspectionForm(buildDepartmentInspectionFromManifest(department, manifest));
  }

  function closeApproval() {
    setSelectedApproval(null);
    setReviewDepartment(null);
    setWagonManifest(null);
    setInspectionForm(emptyDepartmentInspection());
    setConfirmAction(null);
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
    }
    setConfirmAction(action);
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

      await dispatch(
        submitApprovalDecision({
          approvalId: selectedApproval.id,
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
        }),
      ).unwrap();

      await dispatch(fetchApprovalRequests());
      await dispatch(fetchLoadingRecords());
      setMessage(
        confirmAction === "approve"
          ? isAdminProxy
            ? `Approved on behalf of ${APPROVAL_STEP_LABELS[reviewDepartment]}.`
            : "Approval recorded successfully."
          : "Approval rejection recorded.",
      );
      closeApproval();
    } catch (error) {
      setMessage(error?.message || "Unable to submit approval decision.");
    }
  }

  const selectedLoading = selectedApproval
    ? loadingById[selectedApproval.loadingId]
    : null;

  const reviewDepartmentLabel = reviewDepartment
    ? APPROVAL_STEP_LABELS[reviewDepartment]
    : "";

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
              : "Review completed loading records and grant sequential railway approvals."}
          </p>
        </div>

        {isAdminProxy ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">Administrator proxy mode</p>
            <p className="mt-1 text-[13px] text-amber-800">
              Use <strong>All Pending</strong> to see every step waiting for approval, or switch
              tabs to act as Railway Operations, Commercial, or C&amp;W. Each decision is recorded
              as admin acting on behalf of that department.
            </p>
          </div>
        ) : null}

        {message ? (
          <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ dept: tab.id })}
              className={`rounded-lg border px-4 py-2 text-[13px] font-semibold transition-colors ${
                activeDepartment === tab.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.id === ADMIN_ALL_TAB && pendingCount > 0 ? (
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                  {pendingCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <SearchBar
          placeholder="Search by rake number, customer, siding..."
          value={search}
          onChange={setSearch}
          showFilter={false}
        />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Rake Number</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Customer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Siding</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Completion</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Current Step</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      {isAdminProxy && activeDepartment === ADMIN_ALL_TAB
                        ? "No loading records are awaiting railway approval."
                        : "No pending approvals for this department."}
                    </td>
                  </tr>
                ) : (
                  queueItems.map((approval) => {
                    const loading = loadingById[approval.loadingId];
                    const pendingDepartment = getPendingDepartmentForApproval(approval);
                    return (
                      <tr key={approval.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-[13px] font-semibold text-blue-600">
                          {approval.rakeNumber}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-700">{approval.customer}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-700">{approval.siding}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-700">
                          {formatDateTimeForTable(loading?.completionTime)}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-700">
                          {APPROVAL_STEP_LABELS[pendingDepartment] || approval.status}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openApproval(approval)}
                            className={uniformPrimaryButtonClass}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedApproval && reviewDepartment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
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
                  <input readOnly className={uniformInputClass} value={selectedLoading?.tonnage || "-"} />
                </UniformFormField>
                <UniformFormField label="Completion Time">
                  <input
                    readOnly
                    className={uniformInputClass}
                    value={formatDateTimeForTable(selectedLoading?.completionTime)}
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

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => requestDecision("reject")}
                  className="inline-flex h-10 items-center rounded-lg border border-rose-300 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Reject
                </button>
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
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmDecision}
        title={confirmAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
        message={
          confirmAction === "approve"
            ? isAdminProxy
              ? `Approve this step on behalf of ${reviewDepartmentLabel}?`
              : "Are you sure you want to approve this railway step?"
            : isAdminProxy
              ? `Reject this step on behalf of ${reviewDepartmentLabel}?`
              : "Are you sure you want to reject this railway approval step?"
        }
        itemName={selectedApproval?.rakeNumber || ""}
        confirmLabel={confirmAction === "approve" ? "Approve" : "Reject"}
        variant={confirmAction === "approve" ? "warning" : "danger"}
      />
    </>
  );
}
