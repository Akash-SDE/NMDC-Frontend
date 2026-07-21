import {
  APPROVAL_DEPARTMENTS,
  APPROVAL_STATUS,
  LOADING_STATUS,
} from "../constants/approval";
import { toIsoDateTime } from "./transforms";
import {
  emptyDepartmentInspection,
  normalizeDepartmentInspection,
  normalizeWagonManifest,
} from "../utils/wagonInspectionUtils";

function emptyStep() {
  return {
    status: "pending",
    approvedBy: null,
    approvedAt: null,
    remarks: "",
    trackClearanceTime: null,
    wagonObservations: "",
    inspection: emptyDepartmentInspection(),
  };
}

function normalizeStep(step = {}) {
  return {
    ...emptyStep(),
    ...step,
    inspection: normalizeDepartmentInspection(step.inspection),
  };
}

/** @returns {import('./approval').RailwayApprovalRequest} */
export function fromApprovalApiPayload(dto) {
  return {
    id: dto.id ?? `APR-${Date.now()}`,
    loadingId: dto.loading_id ?? dto.loadingId ?? "",
    rakeId: dto.rake_id ?? dto.rakeId ?? "",
    rakeNumber: dto.rake_number ?? dto.rakeNumber ?? "",
    customer: dto.customer ?? "",
    siding: dto.siding ?? "",
    status: dto.status ?? APPROVAL_STATUS.AWAITING_OPERATIONS,
    operations: normalizeStep(dto.operations),
    commercial: normalizeStep(dto.commercial),
    cw: normalizeStep(dto.cw),
    history: Array.isArray(dto.history) ? dto.history : [],
    wagonManifest: dto.wagonManifest
      ? normalizeWagonManifest(dto.wagonManifest, dto)
      : dto.wagon_manifest
        ? normalizeWagonManifest(dto.wagon_manifest, dto)
        : null,
    createdAt: dto.created_at ?? dto.createdAt ?? new Date().toISOString(),
    updatedAt: dto.updated_at ?? dto.updatedAt ?? null,
  };
}

export function createApprovalRequestFromLoading(loading) {
  const now = new Date().toISOString();
  return fromApprovalApiPayload({
    id: `APR-${String(loading.id).replace("LD-", "")}`,
    loadingId: loading.id,
    rakeId: loading.rakeId,
    rakeNumber: loading.rakeNumber,
    customer: loading.customer,
    siding: loading.siding,
    status: APPROVAL_STATUS.AWAITING_OPERATIONS,
    operations: emptyStep(),
    commercial: emptyStep(),
    cw: emptyStep(),
    history: [
      {
        step: "system",
        action: "created",
        actor: "Loading System",
        timestamp: now,
        remarks: "Railway approval request created after loading completion.",
      },
    ],
    createdAt: now,
  });
}

export function nextApprovalStatusAfterApprove(department) {
  if (department === APPROVAL_DEPARTMENTS.OPERATIONS) {
    return APPROVAL_STATUS.AWAITING_COMMERCIAL;
  }
  if (department === APPROVAL_DEPARTMENTS.COMMERCIAL) {
    return APPROVAL_STATUS.AWAITING_CW;
  }
  if (department === APPROVAL_DEPARTMENTS.CW) {
    return APPROVAL_STATUS.APPROVED;
  }
  return APPROVAL_STATUS.AWAITING_OPERATIONS;
}

export function applyApprovalDecision(approval, department, decision) {
  const now = new Date().toISOString();
  const stepKey = department;
  const next = structuredClone(approval);
  const mergedInspection = normalizeDepartmentInspection({
    ...next[stepKey].inspection,
    ...(decision.inspection ?? {}),
  });

  if (decision.trackClearanceTime) {
    mergedInspection.trackClearanceTime = toIsoDateTime(decision.trackClearanceTime);
  }

  const wagonSummary = [
    summarizeInspectionLine(mergedInspection.overloaded, "Overloaded"),
    summarizeInspectionLine(mergedInspection.unevenRake, "Uneven rake"),
    summarizeInspectionLine(mergedInspection.uneven, "Uneven"),
    summarizeInspectionLine(mergedInspection.sick, "Sick"),
    summarizeInspectionLine(mergedInspection.repair, "Repair"),
    summarizeInspectionLine(mergedInspection.doorUnlock, "Door/unlock"),
    summarizeInspectionLine(mergedInspection.singleBar, "Single bar"),
    summarizeInspectionLine(mergedInspection.downsideCheck, "Downside"),
  ]
    .filter(Boolean)
    .join("; ");

  if (decision.action === "reject") {
    next[stepKey] = {
      ...next[stepKey],
      status: "rejected",
      approvedBy: decision.actor,
      approvedAt: now,
      remarks: decision.remarks || "",
      trackClearanceTime: mergedInspection.trackClearanceTime,
      wagonObservations: decision.wagonObservations || wagonSummary,
      inspection: mergedInspection,
    };
    next.status = APPROVAL_STATUS.REJECTED;
    next.history = [
      ...next.history,
      {
        step: department,
        action: "rejected",
        actor: decision.actor,
        timestamp: now,
        remarks: decision.remarks || "",
      },
    ];
    next.updatedAt = now;
    return next;
  }

  next[stepKey] = {
    ...next[stepKey],
    status: "approved",
    approvedBy: decision.actor,
    approvedAt: now,
    remarks: decision.remarks || "",
    trackClearanceTime: mergedInspection.trackClearanceTime,
    wagonObservations: decision.wagonObservations || wagonSummary,
    inspection: mergedInspection,
  };
  next.status = nextApprovalStatusAfterApprove(department);
  next.history = [
    ...next.history,
    {
      step: department,
      action: "approved",
      actor: decision.actor,
      timestamp: now,
      remarks: decision.remarks || "",
    },
  ];
  next.updatedAt = now;
  return next;
}

export function loadingStatusAfterApproval(approval) {
  if (approval.status === APPROVAL_STATUS.APPROVED) {
    return LOADING_STATUS.READY_FOR_DISPATCH;
  }
  return LOADING_STATUS.AWAITING_APPROVAL;
}

function summarizeInspectionLine(list, label) {
  if (!list?.count) return "";
  return `${label}: ${list.count}`;
}
