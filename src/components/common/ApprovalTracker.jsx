import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  APPROVAL_STEP_LABELS,
  APPROVAL_STEP_ORDER,
  getApprovalStepState,
} from "../../constants/approval";
import {
  UniformSectionCard,
  uniformSecondaryButtonClass,
} from "../shared/UniformUi";
import { formatDateTimeForTable } from "../../utils/dateUtils";
import { summarizeInspection } from "../../utils/wagonInspectionUtils";

const stepStyles = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  active: "border-violet-200 bg-violet-50 text-violet-700",
  pending: "border-slate-200 bg-slate-50 text-slate-500",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const dotStyles = {
  approved: "bg-emerald-500",
  active: "bg-violet-500",
  pending: "bg-slate-300",
  rejected: "bg-rose-500",
};

const stepStateLabels = {
  approved: "Approved",
  active: "In Progress",
  pending: "Pending",
  rejected: "Rejected",
};

const DEPARTMENT_ACCENTS = {
  operations: "border-l-blue-500",
  commercial: "border-l-violet-500",
  cw: "border-l-emerald-500",
};

export function ApprovalStatusBadge({ approval, compact = false }) {
  if (!approval) {
    return (
      <span className="inline-flex max-w-full items-center justify-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold leading-tight text-slate-500">
        Not submitted
      </span>
    );
  }

  const label =
    approval.status === "APPROVED"
      ? "All Approved"
      : approval.status === "REJECTED"
        ? "Rejected"
        : approval.status.replace("AWAITING_", "Awaiting ");

  return (
    <span
      className={`inline-flex max-w-full items-center justify-start rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-tight ${
        approval.status === "APPROVED"
          ? stepStyles.approved
          : approval.status === "REJECTED"
            ? stepStyles.rejected
            : stepStyles.active
      } ${compact ? "whitespace-nowrap" : ""}`}
    >
      {label}
    </span>
  );
}

export function ViewTrackerButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-100 ${className}`}
    >
      View tracker
    </button>
  );
}

function ApprovalHistorySection({ history = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const recentHistory = [...history].reverse().slice(0, 8);

  if (recentHistory.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <span className="text-[12px] font-semibold text-slate-700">
          Approval History ({recentHistory.length})
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-2 border-t border-slate-100 px-3 py-3">
          {recentHistory.map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className="rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2 text-[12px] text-slate-700"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold capitalize text-slate-800">{entry.action}</span>
                <span className="text-slate-400">·</span>
                <span className="font-medium capitalize">{entry.step}</span>
                <span className="text-slate-400">·</span>
                <span>{entry.actor}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{formatDateTimeForTable(entry.timestamp)}</span>
              </div>
              {entry.remarks ? (
                <p className="mt-1 text-[11px] text-slate-500">{entry.remarks}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ApprovalTracker({
  approval,
  compact = false,
  showHistory = false,
}) {
  if (!approval) {
    return (
      <p className="text-[12px] text-slate-500">
        Railway approval will begin after loading is completed and submitted.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div
        className={`grid gap-2 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 md:grid-cols-3"}`}
      >
        {APPROVAL_STEP_ORDER.map((department) => {
          const state = getApprovalStepState(approval, department);
          const step = approval[department];
          const inspectionSummary = summarizeInspection(step?.inspection);

          return (
            <div
              key={department}
              className={`rounded-lg border border-l-4 px-3 py-2.5 ${stepStyles[state]} ${DEPARTMENT_ACCENTS[department]}`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotStyles[state]}`} />
                <p className="text-[11px] font-bold uppercase tracking-[0.05em]">
                  {APPROVAL_STEP_LABELS[department]}
                </p>
              </div>
              <p className="mt-1 text-[12px] font-semibold">{stepStateLabels[state]}</p>
              {step?.approvedBy ? (
                <p className="mt-0.5 text-[11px] opacity-80">By {step.approvedBy}</p>
              ) : null}
              {step?.approvedAt ? (
                <p className="mt-0.5 text-[11px] opacity-80">
                  At {formatDateTimeForTable(step.approvedAt)}
                </p>
              ) : null}
              {department === "operations" && step?.trackClearanceTime ? (
                <p className="mt-0.5 text-[11px] opacity-80">
                  Clearance: {formatDateTimeForTable(step.trackClearanceTime)}
                </p>
              ) : null}
              {step?.remarks ? (
                <p className="mt-1 line-clamp-2 text-[11px] opacity-80">{step.remarks}</p>
              ) : null}
              {inspectionSummary.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {inspectionSummary.map((line) => (
                    <span
                      key={line}
                      className="rounded-full border border-current/20 bg-white/50 px-2 py-0.5 text-[10px] font-semibold"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {showHistory ? <ApprovalHistorySection history={approval.history} /> : null}
    </div>
  );
}

export function ApprovalTrackerPanel({
  approval,
  showHistory = true,
  compact = false,
  title = "Railway Approval Tracker",
  subtitle = "Sequential approval progress across railway departments.",
}) {
  return (
    <UniformSectionCard title={title} subtitle={subtitle}>
      <ApprovalTracker approval={approval} showHistory={showHistory} compact={compact} />
    </UniformSectionCard>
  );
}

export function ApprovalTrackerModal({ approval, isOpen, onClose }) {
  if (!isOpen || !approval) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Railway Approval — {approval.rakeNumber}
            </h3>
            <p className="text-sm text-slate-500">
              {approval.customer} · {approval.siding}
            </p>
          </div>
          <button type="button" onClick={onClose} className={uniformSecondaryButtonClass}>
            Close
          </button>
        </div>

        <ApprovalTrackerPanel approval={approval} showHistory />
      </div>
    </div>
  );
}
