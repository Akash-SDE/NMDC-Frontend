export const LOADING_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  AWAITING_APPROVAL: "AWAITING_APPROVAL",
  READY_FOR_DISPATCH: "READY_FOR_DISPATCH",
  DISPATCHED: "DISPATCHED",
};

export const APPROVAL_STATUS = {
  AWAITING_OPERATIONS: "AWAITING_OPERATIONS",
  AWAITING_COMMERCIAL: "AWAITING_COMMERCIAL",
  AWAITING_CW: "AWAITING_CW",
  AWAITING_COMMERCIAL_CW: "AWAITING_COMMERCIAL_CW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const STEP_NOT_REQUIRED = "not_required";

export const APPROVAL_DEPARTMENTS = {
  OPERATIONS: "operations",
  COMMERCIAL: "commercial",
  CW: "cw",
};

export const APPROVAL_STEP_ORDER = [
  APPROVAL_DEPARTMENTS.OPERATIONS,
  APPROVAL_DEPARTMENTS.COMMERCIAL,
  APPROVAL_DEPARTMENTS.CW,
];

export const APPROVAL_STEP_LABELS = {
  [APPROVAL_DEPARTMENTS.OPERATIONS]: "Railway Operations",
  [APPROVAL_DEPARTMENTS.COMMERCIAL]: "Railway Commercial",
  [APPROVAL_DEPARTMENTS.CW]: "Railway C&W",
};

/** Review departments Operations can route to; when both are selected they approve in parallel. */
export const REVIEW_DEPARTMENTS = [APPROVAL_DEPARTMENTS.COMMERCIAL, APPROVAL_DEPARTMENTS.CW];

export const APPROVAL_STATUS_TO_DEPARTMENTS = {
  [APPROVAL_STATUS.AWAITING_OPERATIONS]: [APPROVAL_DEPARTMENTS.OPERATIONS],
  [APPROVAL_STATUS.AWAITING_COMMERCIAL]: [APPROVAL_DEPARTMENTS.COMMERCIAL],
  [APPROVAL_STATUS.AWAITING_CW]: [APPROVAL_DEPARTMENTS.CW],
  [APPROVAL_STATUS.AWAITING_COMMERCIAL_CW]: REVIEW_DEPARTMENTS,
};

export function getPendingDepartments(approval) {
  if (!approval) return [];
  return APPROVAL_STATUS_TO_DEPARTMENTS[approval.status] ?? [];
}

/** Mirrors the backend: any rejection closes the request, Operations goes first, then every required review step. */
export function deriveApprovalStatus(approval) {
  const steps = APPROVAL_STEP_ORDER.map((department) => approval?.[department]?.status || "pending");
  if (steps.includes("rejected")) return APPROVAL_STATUS.REJECTED;
  if (approval?.operations?.status !== "approved") return APPROVAL_STATUS.AWAITING_OPERATIONS;
  const awaiting = REVIEW_DEPARTMENTS.filter(
    (department) => (approval?.[department]?.status || "pending") === "pending",
  );
  if (awaiting.length === REVIEW_DEPARTMENTS.length) return APPROVAL_STATUS.AWAITING_COMMERCIAL_CW;
  if (awaiting.includes(APPROVAL_DEPARTMENTS.COMMERCIAL)) return APPROVAL_STATUS.AWAITING_COMMERCIAL;
  if (awaiting.includes(APPROVAL_DEPARTMENTS.CW)) return APPROVAL_STATUS.AWAITING_CW;
  return APPROVAL_STATUS.APPROVED;
}

export function deriveLoadingStatus(loading, approval) {
  if (loading?.status) return loading.status;
  if (loading?.isDisabled) return LOADING_STATUS.PENDING;
  if (approval?.status === APPROVAL_STATUS.APPROVED) return LOADING_STATUS.READY_FOR_DISPATCH;
  if (approval && approval.status !== APPROVAL_STATUS.REJECTED) {
    return LOADING_STATUS.AWAITING_APPROVAL;
  }
  if (loading?.completionTime && loading?.isSubmitted) return LOADING_STATUS.AWAITING_APPROVAL;
  if (loading?.completionTime) return LOADING_STATUS.AWAITING_APPROVAL;
  if (loading?.operatorFtp || loading?.tonnage || loading?.stockpile) {
    return LOADING_STATUS.IN_PROGRESS;
  }
  return LOADING_STATUS.PENDING;
}

export function getApprovalStepState(approval, department) {
  if (!approval) return "pending";
  const step = approval[department];
  if (step?.status === "approved") return "approved";
  if (step?.status === "rejected") return "rejected";
  if (step?.status === STEP_NOT_REQUIRED) return "skipped";
  if (approval.status === APPROVAL_STATUS.REJECTED) return "rejected";
  const pendingDepartments = getPendingDepartments(approval);
  if (pendingDepartments.includes(department)) return "active";
  const currentIndex = Math.min(
    ...pendingDepartments.map((pending) => APPROVAL_STEP_ORDER.indexOf(pending)),
  );
  const deptIndex = APPROVAL_STEP_ORDER.indexOf(department);
  if (!Number.isFinite(currentIndex) || deptIndex < currentIndex) return "approved";
  return "pending";
}

export function countPendingApprovals(approvals = []) {
  return approvals.filter((item) => getPendingDepartments(item).length > 0).length;
}
