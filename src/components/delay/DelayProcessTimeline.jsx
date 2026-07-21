import { formatDateTimeForTable } from "../../utils/dateUtils";
import { DELAY_SOURCE } from "../../utils/delayProcessTimeline";
import ApprovalTracker from "../common/ApprovalTracker";

const sourceStyles = {
  [DELAY_SOURCE.MANUAL]: "border-amber-200 bg-amber-50 text-amber-800",
  [DELAY_SOURCE.SYSTEM]: "border-slate-200 bg-slate-50 text-slate-700",
  [DELAY_SOURCE.APPROVAL]: "border-violet-200 bg-violet-50 text-violet-800",
};

const sourceLabels = {
  [DELAY_SOURCE.MANUAL]: "Manual log",
  [DELAY_SOURCE.SYSTEM]: "System detected",
  [DELAY_SOURCE.APPROVAL]: "Railway approval",
};

export default function DelayProcessTimeline({
  milestones = [],
  delays = [],
  summary,
  approval,
  compact = false,
}) {
  if (!milestones.length && !delays.length) {
    return (
      <p className="text-[13px] text-slate-500">
        No process milestones or delays are available for this rake yet.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {summary ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Current stage
            </p>
            <p className="mt-1 text-[13px] font-bold text-slate-800">{summary.currentStage}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total delay time
            </p>
            <p className="mt-1 text-[13px] font-bold text-blue-700">{summary.totalDelayLabel}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Delay events
            </p>
            <p className="mt-1 text-[13px] font-bold text-slate-800">
              {summary.totalEvents}{" "}
              <span className="text-[11px] font-medium text-slate-500">
                ({summary.manualCount} manual · {summary.approvalCount} railway)
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Critical (&gt;= 2h)
            </p>
            <p className="mt-1 text-[13px] font-bold text-rose-700">{summary.criticalCount}</p>
          </div>
        </div>
      ) : null}

      {milestones.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            End-to-end milestones
          </p>
          <div className="relative space-y-0">
            {milestones.map((milestone, index) => (
              <div key={milestone.key} className="relative flex gap-3 pb-4 last:pb-0">
                {index < milestones.length - 1 ? (
                  <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
                ) : null}
                <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-blue-500 shadow-sm ring-2 ring-blue-100" />
                <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-slate-800">{milestone.label}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {milestone.stage}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {formatDateTimeForTable(milestone.at)}
                  </p>
                  {milestone.meta ? (
                    <p className="mt-1 text-[11px] text-slate-500">{milestone.meta}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {delays.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Delay events across the journey
          </p>
          <div className="space-y-2">
            {delays.map((delay) => (
              <div
                key={delay.id}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sourceStyles[delay.source] ?? sourceStyles[DELAY_SOURCE.SYSTEM]}`}
                  >
                    {sourceLabels[delay.source] ?? "Delay"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {delay.processStage}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {delay.category}
                  </span>
                  {delay.durationLabel && delay.durationLabel !== "Note" ? (
                    <span className="text-[11px] font-bold text-blue-700">{delay.durationLabel}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] font-medium text-slate-800">{delay.reason}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span>{formatDateTimeForTable(delay.startTime)}</span>
                  {delay.endTime && delay.endTime !== delay.startTime ? (
                    <>
                      <span>→</span>
                      <span>{formatDateTimeForTable(delay.endTime)}</span>
                    </>
                  ) : null}
                  <span>·</span>
                  <span>{delay.reportedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {approval ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Railway approval status
          </p>
          <ApprovalTracker approval={approval} compact showHistory />
        </div>
      ) : null}
    </div>
  );
}
