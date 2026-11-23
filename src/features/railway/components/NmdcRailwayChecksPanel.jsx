import { UniformSectionCard } from "../../../components/shared/UniformUi";
import { APPROVAL_DEPARTMENTS, APPROVAL_STEP_LABELS, STEP_NOT_REQUIRED } from "../../../constants/approval";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { normalizeDepartmentInspection } from "../../../utils/wagonInspectionUtils";

function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        Approved
      </span>
    );
  }
  if (status === STEP_NOT_REQUIRED) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
        Not required
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
        Rejected
      </span>
    );
  }
  return (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
      Pending
    </span>
  );
}

function WagonListLine({ label, list }) {
  const numbers = list?.numbers?.length ? list.numbers.join(", ") : null;
  if (!numbers) return null;
  return (
    <p className="text-[12px] text-slate-700">
      <span className="font-semibold text-slate-800">{label}:</span> {numbers}
      {list.count != null ? ` (${list.count})` : ""}
    </p>
  );
}

function DepartmentCheckCard({ department, step }) {
  const label = APPROVAL_STEP_LABELS[department] || department;
  const status = step?.status || "pending";
  const inspection = normalizeDepartmentInspection(step?.inspection);

  const isCommercial = department === APPROVAL_DEPARTMENTS.COMMERCIAL;
  const isCw = department === APPROVAL_DEPARTMENTS.CW;

  return (
    <UniformSectionCard
      title={label}
      subtitle={
        isCommercial
          ? "Commercial verification outcome for this rake."
          : "Carriage & Wagon inspection outcome for this rake."
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {step?.approvedBy ? (
          <span className="text-[12px] text-slate-600">
            By <span className="font-semibold">{step.approvedBy}</span>
            {step.approvedAt ? ` · ${formatDateTimeForTable(step.approvedAt)}` : ""}
          </span>
        ) : null}
      </div>

      {status === STEP_NOT_REQUIRED ? (
        <p className="text-[12px] text-slate-500">Operations did not route this rake to {label}.</p>
      ) : status === "pending" ? (
        <p className="text-[12px] text-slate-500">Awaiting {label} approval.</p>
      ) : (
        <div className="space-y-3">
          {step?.remarks ? (
            <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Remarks</p>
              <p className="mt-1 text-[12px] text-slate-700">{step.remarks}</p>
            </div>
          ) : null}

          {isCommercial && inspection.topViewRemarks ? (
            <p className="text-[12px] text-slate-700">
              <span className="font-semibold">Top view remarks:</span> {inspection.topViewRemarks}
            </p>
          ) : null}

          <div className="space-y-1.5 rounded-md border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Recorded issues</p>
            {isCommercial ? (
              <>
                <WagonListLine label="Overloaded (top view)" list={inspection.overloaded} />
                <WagonListLine label="Uneven rake (top view)" list={inspection.unevenRake} />
              </>
            ) : null}
            {isCw ? (
              <>
                <WagonListLine label="Door / unlock" list={inspection.doorUnlock} />
                <WagonListLine label="Single bar" list={inspection.singleBar} />
                <WagonListLine label="Downside check" list={inspection.downsideCheck} />
              </>
            ) : null}
            <WagonListLine label="Uneven" list={inspection.uneven} />
            <WagonListLine label="Sick" list={inspection.sick} />
            <WagonListLine label="Repair" list={inspection.repair} />
            {!step?.wagonObservations &&
            !inspection.overloaded?.numbers?.length &&
            !inspection.uneven?.numbers?.length ? (
              <p className="text-[12px] text-slate-400">No wagon issues summarized on this step.</p>
            ) : null}
            {step?.wagonObservations ? (
              <p className="text-[12px] text-slate-600">
                <span className="font-semibold text-slate-700">Summary:</span> {step.wagonObservations}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </UniformSectionCard>
  );
}

export default function NmdcRailwayChecksPanel({ approval }) {
  if (!approval) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DepartmentCheckCard
        department={APPROVAL_DEPARTMENTS.COMMERCIAL}
        step={approval.commercial}
      />
      <DepartmentCheckCard department={APPROVAL_DEPARTMENTS.CW} step={approval.cw} />
    </div>
  );
}