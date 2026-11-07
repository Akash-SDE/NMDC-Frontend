import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { APPROVAL_STEP_LABELS } from "../../../constants/approval";
import { canUserReviewDepartment } from "../../../utils/approvalUtils";

function PendingIndicator() {
  return (
    <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400 ring-2 ring-amber-100" aria-hidden />
  );
}

function CompleteIndicator() {
  return (
    <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" strokeWidth={2.2} aria-hidden />
  );
}

function RejectedIndicator() {
  return (
    <XCircle className="h-[18px] w-[18px] shrink-0 text-rose-500" strokeWidth={2.2} aria-hidden />
  );
}

function NotRequiredIndicator() {
  return (
    <MinusCircle className="h-[18px] w-[18px] shrink-0 text-slate-300" strokeWidth={2.2} aria-hidden />
  );
}

const LABEL_BY_PRESENTATION = {
  complete: "Complete",
  pending: "Pending",
  in_progress: "In Progress",
  rejected: "Rejected",
  not_required: "Not Required",
};

export default function RailwayApprovalStageCell({
  approval,
  department = null,
  presentation,
  onReview,
  userDepartment,
  isAdminProxy,
}) {
  const showReview =
    department &&
    presentation === "actionable" &&
    canUserReviewDepartment(approval, department, { userDepartment, isAdminProxy });

  let indicator = <PendingIndicator />;
  let label = LABEL_BY_PRESENTATION[presentation] ?? "Pending";
  let labelClass = "text-slate-600";

  if (presentation === "complete") {
    indicator = <CompleteIndicator />;
    labelClass = "font-medium text-slate-700";
  } else if (presentation === "rejected") {
    indicator = <RejectedIndicator />;
    labelClass = "font-semibold text-rose-700";
  } else if (presentation === "not_required") {
    indicator = <NotRequiredIndicator />;
    labelClass = "text-slate-400";
  } else if (presentation === "in_progress") {
    indicator = (
      <span
        className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500 ring-2 ring-blue-100"
        aria-hidden
      />
    );
    labelClass = "font-medium text-blue-700";
  } else if (presentation === "actionable" && !showReview) {
    indicator = <PendingIndicator />;
    labelClass = "font-medium text-slate-600";
  }

  return (
    <div className="flex min-w-[120px] flex-wrap items-center gap-2">
      {showReview ? (
        <>
          <button
            type="button"
            onClick={() => onReview(approval, department)}
            className="inline-flex h-8 shrink-0 items-center rounded-md bg-[#2563eb] px-4 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Review
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
            <PendingIndicator />
            Pending
          </span>
        </>
      ) : (
        <span className="inline-flex items-center gap-2">
          {indicator}
          <span className={`text-[13px] ${labelClass}`}>{label}</span>
        </span>
      )}
      {showReview && isAdminProxy ? (
        <span className="sr-only">
          Review as {APPROVAL_STEP_LABELS[department]}
        </span>
      ) : null}
    </div>
  );
}

export function RailwayNmdcStageCell({ presentation }) {
  let indicator = <PendingIndicator />;
  let label = "Pending";
  let labelClass = "text-slate-600";

  if (presentation === "complete") {
    indicator = <CompleteIndicator />;
    label = "Complete";
    labelClass = "font-medium text-slate-700";
  } else if (presentation === "in_progress") {
    indicator = (
      <span
        className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500 ring-2 ring-blue-100"
        aria-hidden
      />
    );
    label = "In Progress";
    labelClass = "font-medium text-blue-700";
  } else if (presentation === "rejected") {
    indicator = <RejectedIndicator />;
    label = "Rejected";
    labelClass = "font-semibold text-rose-700";
  }

  return (
    <span className="inline-flex items-center gap-2">
      {indicator}
      <span className={`text-[13px] ${labelClass}`}>{label}</span>
    </span>
  );
}
