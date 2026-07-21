import {
  APPROVAL_STATUS,
  APPROVAL_STATUS_TO_DEPARTMENT,
  APPROVAL_STEP_LABELS,
  APPROVAL_STEP_ORDER,
  LOADING_STATUS,
  deriveLoadingStatus,
  getApprovalStepState,
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
    case APPROVAL_STATUS.APPROVED:
      return "All Approved";
    case APPROVAL_STATUS.REJECTED:
      return "Rejected";
    default:
      return "Not Started";
  }
}

export function canDepartmentAct(approval, department) {
  if (!approval) return false;
  if (approval.status === APPROVAL_STATUS.REJECTED) return false;
  if (approval.status === APPROVAL_STATUS.APPROVED) return false;
  return APPROVAL_STATUS_TO_DEPARTMENT[approval.status] === department;
}

export function getPendingDepartmentForApproval(approval) {
  if (!approval) return null;
  return APPROVAL_STATUS_TO_DEPARTMENT[approval.status] ?? null;
}

export function isApprovalAwaitingAction(approval) {
  return Boolean(getPendingDepartmentForApproval(approval));
}

/** Departments whose submitted data should be visible when reviewing a later step. */
export function getPriorVisibleDepartments(reviewDepartment) {
  const stepIndex = APPROVAL_STEP_ORDER.indexOf(reviewDepartment);
  if (stepIndex <= 0) return [];
  return APPROVAL_STEP_ORDER.slice(0, stepIndex);
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
