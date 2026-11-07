import {
  APPROVAL_STATUS,
  APPROVAL_STEP_LABELS,
  APPROVAL_STEP_ORDER,
  LOADING_STATUS,
  REVIEW_DEPARTMENTS,
  STEP_NOT_REQUIRED,
  deriveLoadingStatus,
  getApprovalStepState,
  getPendingDepartments,
} from "../constants/approval";

export function getLoadingStatusMeta(status) {
  switch (status) {
    case LOADING_STATUS.READY_FOR_DISPATCH:
      return {
        label: "Ready for Dispatch",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dotClass: "bg-emerald-500",
      };
    case LOADING_STATUS.AWAITING_APPROVAL:
      return {
        label: "Awaiting Approval",
        badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
        dotClass: "bg-violet-500",
      };
    case LOADING_STATUS.DISPATCHED:
      return {
        label: "Dispatched",
        badgeClass: "border-slate-200 bg-slate-100 text-slate-600",
        dotClass: "bg-slate-400",
      };
    case LOADING_STATUS.IN_PROGRESS:
      return {
        label: "In Progress",
        badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
        dotClass: "bg-blue-500",
      };
    case LOADING_STATUS.PENDING:
    default:
      return {
        label: "Pending",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        dotClass: "bg-amber-500",
      };
  }
}

export function getApprovalStatusLabel(status) {
  switch (status) {
    case APPROVAL_STATUS.AWAITING_OPERATIONS:
      return "Awaiting Operations";
    case APPROVAL_STATUS.AWAITING_COMMERCIAL:
      return "Awaiting Commercial";
    case APPROVAL_STATUS.AWAITING_CW:
      return "Awaiting C&W";
    case APPROVAL_STATUS.AWAITING_COMMERCIAL_CW:
      return "Awaiting Commercial & C&W";
    case APPROVAL_STATUS.APPROVED:
      return "All Approved";
    case APPROVAL_STATUS.REJECTED:
      return "Rejected";
    default:
      return "Not Started";
  }
}

export function getPendingDepartmentsForApproval(approval) {
  if (!approval) return [];
  return getPendingDepartments(approval).filter(
    (department) => (approval[department]?.status || "pending") === "pending",
  );
}

export function canDepartmentAct(approval, department) {
  return getPendingDepartmentsForApproval(approval).includes(department);
}

/** The department to review as: `preferred` when it is pending, otherwise the first pending one. */
export function getPendingDepartmentForApproval(approval, preferred = null) {
  const pending = getPendingDepartmentsForApproval(approval);
  if (preferred && pending.includes(preferred)) return preferred;
  return pending[0] ?? null;
}

export function getOverallStatusMessage(approval) {
  if (!approval) return "Not Started";
  if (approval.status === APPROVAL_STATUS.APPROVED) return "OK";
  if (approval.status === APPROVAL_STATUS.REJECTED) return "Rejected";

  if (approval.operations?.status === "approved") {
    const required = requiredParallelReviewDepartments(approval);
    const approvedCount = countApprovedParallelReviews(approval);
    if (required.length > 0 && approvedCount > 0 && approvedCount < required.length) {
      return "Awaiting NMDC Check";
    }
  }

  switch (approval.status) {
    case APPROVAL_STATUS.AWAITING_OPERATIONS:
      return "Awaiting Railway Operations Check";
    case APPROVAL_STATUS.AWAITING_CW:
      return "Awaiting C&W Check";
    case APPROVAL_STATUS.AWAITING_COMMERCIAL:
      return "Awaiting Commercial Review";
    case APPROVAL_STATUS.AWAITING_COMMERCIAL_CW:
      return "Awaiting Commercial & C&W Review";
    default:
      return getApprovalStatusLabel(approval.status);
  }
}

function requiredParallelReviewDepartments(approval) {
  return REVIEW_DEPARTMENTS.filter((department) => approval[department]?.status !== STEP_NOT_REQUIRED);
}

function countApprovedParallelReviews(approval) {
  return requiredParallelReviewDepartments(approval).filter(
    (department) => approval[department]?.status === "approved",
  ).length;
}

export function getNmdcStepPresentation(approval, { memoSent = false } = {}) {
  if (!approval) return "pending";
  if (approval.status === APPROVAL_STATUS.REJECTED) return "rejected";
  if (approval.status === APPROVAL_STATUS.APPROVED) return "complete";

  if (approval.operations?.status !== "approved") return "pending";

  const required = requiredParallelReviewDepartments(approval);
  const approvedCount = countApprovedParallelReviews(approval);

  if (required.length === 0) return "pending";
  if (approvedCount === 0) return "pending";
  if (approvedCount < required.length) return "in_progress";

  if (memoSent) return "in_progress";
  return "in_progress";
}

export function canUserReviewDepartment(approval, department, { userDepartment, isAdminProxy }) {
  if (!canDepartmentAct(approval, department)) return false;
  if (isAdminProxy) return true;
  return userDepartment === department;
}

export function getDepartmentStepPresentation(approval, department) {
  const step = approval?.[department];
  if (step?.status === "approved") return "complete";
  if (step?.status === "rejected") return "rejected";
  if (step?.status === "not_required") return "not_required";
  if (canDepartmentAct(approval, department)) return "actionable";
  return "pending";
}

export function isApprovalAwaitingAction(approval) {
  return getPendingDepartmentsForApproval(approval).length > 0;
}

/** Other departments whose submitted data should be visible to the reviewer (Commercial and C&W can run in parallel). */
export function getPriorVisibleDepartments(reviewDepartment) {
  if (!APPROVAL_STEP_ORDER.includes(reviewDepartment)) return [];
  return APPROVAL_STEP_ORDER.filter((department) => department !== reviewDepartment);
}

export function isPriorStepSubmitted(step) {
  return step?.status === "approved" || step?.status === "rejected";
}

export { APPROVAL_STEP_LABELS, APPROVAL_STEP_ORDER, deriveLoadingStatus, getApprovalStepState };
