import {
  APPROVAL_STATUS,
  APPROVAL_STEP_LABELS,
  APPROVAL_STEP_ORDER,
  LOADING_STATUS,
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

export {
  APPROVAL_STEP_LABELS,
  APPROVAL_STEP_ORDER,
  deriveLoadingStatus,
  getApprovalStepState,
};
