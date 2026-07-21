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
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

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

export const APPROVAL_STATUS_TO_DEPARTMENT = {
  [APPROVAL_STATUS.AWAITING_OPERATIONS]: APPROVAL_DEPARTMENTS.OPERATIONS,
  [APPROVAL_STATUS.AWAITING_COMMERCIAL]: APPROVAL_DEPARTMENTS.COMMERCIAL,
  [APPROVAL_STATUS.AWAITING_CW]: APPROVAL_DEPARTMENTS.CW,
};

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
  if (approval.status === APPROVAL_STATUS.REJECTED) return "rejected";
  const currentDept = APPROVAL_STATUS_TO_DEPARTMENT[approval.status];
  if (currentDept === department) return "active";
  const currentIndex = APPROVAL_STEP_ORDER.indexOf(currentDept);
  const deptIndex = APPROVAL_STEP_ORDER.indexOf(department);
  if (currentIndex < 0 || deptIndex < currentIndex) return "approved";
  return "pending";
}

export function countPendingApprovals(approvals = []) {
  return approvals.filter(
    (item) =>
      item.status === APPROVAL_STATUS.AWAITING_OPERATIONS ||
      item.status === APPROVAL_STATUS.AWAITING_COMMERCIAL ||
      item.status === APPROVAL_STATUS.AWAITING_CW,
  ).length;
}
