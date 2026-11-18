import { UniformSectionCard } from "../../../components/shared/UniformUi";
import { getNmdcApprovalOriginSummary } from "../../../utils/approvalUtils";
import { formatDateTimeForTable } from "../../../utils/dateUtils";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-3">
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>
      <div className="text-[13px] text-slate-800">{children}</div>
    </div>
  );
}

export default function NmdcApprovalOriginPanel({ approval }) {
  const summary = getNmdcApprovalOriginSummary(approval);
  if (!summary) return null;

  const { operationsApproved, routedToLabels, skippedLabels, completedReviews } = summary;

  return (
    <UniformSectionCard
      title="Where this approval comes from"
      subtitle="NMDC review is triggered after the required railway department checks below are complete."
    >
      <div className="space-y-3">
        <DetailRow label="Created from">
          <p>
            Loading Management completion — loading record{" "}
            <span className="font-semibold">{summary.loadingId || "—"}</span>
            {summary.rakeNumber ? ` · Rake ${summary.rakeNumber}` : null}
          </p>
          {summary.createdAt ? (
            <p className="mt-0.5 text-[12px] text-slate-500">
              Railway approval opened {formatDateTimeForTable(summary.createdAt)}
            </p>
          ) : null}
        </DetailRow>

        <DetailRow label="Operations step">
          {operationsApproved ? (
            <div>
              <p>
                Approved by{" "}
                <span className="font-semibold">{operationsApproved.approvedBy || "—"}</span>
                {operationsApproved.approvedAt
                  ? ` on ${formatDateTimeForTable(operationsApproved.approvedAt)}`
                  : null}
              </p>
              {operationsApproved.trackClearanceTime ? (
                <p className="mt-0.5 text-[12px] text-slate-600">
                  Track clearance: {formatDateTimeForTable(operationsApproved.trackClearanceTime)}
                </p>
              ) : null}
              {operationsApproved.remarks ? (
                <p className="mt-1 text-[12px] text-slate-600">Remarks: {operationsApproved.remarks}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-slate-500">Operations approval not recorded.</p>
          )}
        </DetailRow>

        <DetailRow label="Sent to (by Operations)">
          {routedToLabels.length > 0 ? (
            <p className="font-semibold">{routedToLabels.join(" & ")}</p>
          ) : (
            <p className="text-slate-500">No review routing recorded.</p>
          )}
          {skippedLabels.length > 0 ? (
            <p className="mt-1 text-[12px] text-slate-500">
              Not required: {skippedLabels.join(", ")}
            </p>
          ) : null}
        </DetailRow>

        <DetailRow label="Completed before NMDC">
          {completedReviews.length > 0 ? (
            <ul className="list-none space-y-1.5">
              {completedReviews.map((review) => (
                <li key={review.department}>
                  <span className="font-semibold">{review.label}</span>
                  {" — "}
                  {review.approvedBy || "—"}
                  {review.approvedAt ? ` (${formatDateTimeForTable(review.approvedAt)})` : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No completed railway checks yet.</p>
          )}
        </DetailRow>
      </div>
    </UniformSectionCard>
  );
}