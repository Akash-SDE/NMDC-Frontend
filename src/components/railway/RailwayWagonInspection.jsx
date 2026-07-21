import {
  UniformFormField,
  uniformInputClass,
  uniformPrimaryButtonClass,
} from "../shared/UniformUi";
import { APPROVAL_STEP_LABELS } from "../../constants/approval";
import { RAILWAY_FLAG_LABELS, RAILWAY_WAGON_FLAGS } from "../../constants/railwayInspection";
import { getPriorVisibleDepartments, isPriorStepSubmitted } from "../../utils/approvalUtils";
import { formatDateTimeForTable } from "../../utils/dateUtils";
import {
  formatWagonNumbersInput,
  normalizeDepartmentInspection,
  summarizeInspection,
} from "../../utils/wagonInspectionUtils";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

function WagonListField({ label, hint, value, onChange, placeholder }) {
  const numbers = value?.numbers ?? [];
  return (
    <UniformFormField label={label} hint={hint}>
      <textarea
        className={`${uniformInputClass} min-h-16 font-mono text-[12px]`}
        value={formatWagonNumbersInput(numbers)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "WGN-001, WGN-002, WGN-003"}
      />
      <p className="mt-1 text-[11px] font-semibold text-slate-500">
        Count: {value?.count ?? numbers.length ?? 0} · comma or line separated
      </p>
    </UniformFormField>
  );
}

function InspectionSubsection({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function ChecklistBadge({ label, passed }) {
  const status =
    passed === true ? "Pass" : passed === false ? "Issues" : "—";
  const className =
    passed === true
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : passed === false
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-slate-200 bg-white text-slate-400";

  return (
    <div className={`rounded-lg border px-2.5 py-2 text-center ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 text-[12px] font-semibold">{status}</p>
    </div>
  );
}

function CompactWagonGroup({ label, list }) {
  const numbers = list?.numbers ?? [];
  if (numbers.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label} ({numbers.length})
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {numbers.map((number) => (
          <span
            key={number}
            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700"
          >
            {number}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildSubmissionPreview(department, step, inspection) {
  const parts = summarizeInspection(inspection);
  const trackClearanceTime = step?.trackClearanceTime || inspection.trackClearanceTime;

  if (department === "operations" && trackClearanceTime) {
    parts.unshift(`Clearance ${formatDateTimeForTable(trackClearanceTime)}`);
  }
  if (department === "commercial" && inspection.topViewRemarks) {
    const snippet = inspection.topViewRemarks.slice(0, 60);
    parts.unshift(snippet.length < inspection.topViewRemarks.length ? `${snippet}…` : snippet);
  }
  if (step?.approvedBy) {
    parts.push(`By ${step.approvedBy}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "Approved — tap to view details";
}

const DEPARTMENT_ACCENTS = {
  operations: "border-l-blue-500",
  commercial: "border-l-violet-500",
  cw: "border-l-emerald-500",
};

function CollapsibleSubmittedSection({ department, step, isOpen, onToggle }) {
  const inspection = normalizeDepartmentInspection(step?.inspection);
  const preview = buildSubmissionPreview(department, step, inspection);
  const trackClearanceTime = step?.trackClearanceTime || inspection.trackClearanceTime;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-200 border-l-4 bg-white shadow-sm ${DEPARTMENT_ACCENTS[department] || "border-l-slate-300"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/80"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-bold text-slate-800">
              {APPROVAL_STEP_LABELS[department]} — Submitted Data
            </p>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Approved
            </span>
          </div>
          {!isOpen ? (
            <p className="mt-1 line-clamp-2 text-[12px] text-slate-500">{preview}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">Read-only record from the prior approval step</p>
          )}
        </div>
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
            {step?.approvedBy ? (
              <span>
                <span className="font-semibold text-slate-700">By:</span> {step.approvedBy}
              </span>
            ) : null}
            {step?.approvedAt ? (
              <span>
                <span className="font-semibold text-slate-700">At:</span>{" "}
                {formatDateTimeForTable(step.approvedAt)}
              </span>
            ) : null}
          </div>

          {step?.remarks ? (
            <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Remarks</p>
              <p className="mt-1 text-[12px] text-slate-700">{step.remarks}</p>
            </div>
          ) : null}

          {department === "operations" && trackClearanceTime ? (
            <div className="rounded-md border border-blue-100 bg-blue-50/50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                Track Clearance
              </p>
              <p className="mt-1 text-[12px] font-semibold text-blue-900">
                {formatDateTimeForTable(trackClearanceTime)}
              </p>
            </div>
          ) : null}

          {department === "commercial" && inspection.topViewRemarks ? (
            <div className="rounded-md border border-violet-100 bg-violet-50/40 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700">
                Top View Remarks
              </p>
              <p className="mt-1 text-[12px] text-slate-700">{inspection.topViewRemarks}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            <ChecklistBadge label="Door" passed={inspection.doorUnlockPassed} />
            <ChecklistBadge label="Single Bar" passed={inspection.singleBarPassed} />
            <ChecklistBadge label="Downside" passed={inspection.downsideCheckPassed} />
          </div>

          <div className="space-y-3 rounded-md border border-slate-100 bg-slate-50/50 p-3">
            {department === "commercial" ? (
              <>
                <CompactWagonGroup label="Overloaded (Top View)" list={inspection.overloaded} />
                <CompactWagonGroup label="Uneven Rake (Top View)" list={inspection.unevenRake} />
              </>
            ) : null}
            {department === "cw" ? (
              <>
                <CompactWagonGroup label="Door / Unlock Issues" list={inspection.doorUnlock} />
                <CompactWagonGroup label="Single Bar Issues" list={inspection.singleBar} />
                <CompactWagonGroup label="Downside Issues" list={inspection.downsideCheck} />
              </>
            ) : null}
            <CompactWagonGroup label="Uneven Wagons" list={inspection.uneven} />
            <CompactWagonGroup label="Sick Wagons" list={inspection.sick} />
            <CompactWagonGroup label="Repair Wagons" list={inspection.repair} />
            {!inspection.overloaded?.count &&
            !inspection.unevenRake?.count &&
            !inspection.uneven?.count &&
            !inspection.sick?.count &&
            !inspection.repair?.count &&
            !inspection.doorUnlock?.count &&
            !inspection.singleBar?.count &&
            !inspection.downsideCheck?.count ? (
              <p className="text-[12px] text-slate-400">No wagon issues recorded.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChecklistField({ label, passed, onChange }) {
  return (
    <UniformFormField label={label}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold ${
            passed === true
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold ${
            passed === false
              ? "border-rose-300 bg-rose-50 text-rose-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Issues Found
        </button>
      </div>
    </UniformFormField>
  );
}

export default function RailwayWagonManifestPanel({
  manifest,
  loading,
  editable = false,
  onAddWagon,
  onRemoveWagon,
  saving = false,
}) {
  const [newWagonNumber, setNewWagonNumber] = useState("");
  const [selectedFlags, setSelectedFlags] = useState([]);

  if (!manifest) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
        Railway wagon manifest not available for this rake yet.
      </div>
    );
  }

  const displayWagons = editable
    ? manifest.wagons
    : manifest.wagons.filter((wagon) => wagon.flags?.length > 0).length > 0
      ? manifest.wagons.filter((wagon) => wagon.flags?.length > 0)
      : manifest.wagons.slice(0, 12);

  function toggleFlag(flagId) {
    setSelectedFlags((prev) =>
      prev.includes(flagId) ? prev.filter((item) => item !== flagId) : [...prev, flagId],
    );
  }

  function handleAddWagon() {
    if (!newWagonNumber.trim() || !onAddWagon) return;
    onAddWagon(newWagonNumber.trim(), selectedFlags);
    setNewWagonNumber("");
    setSelectedFlags([]);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
            Railway Wagon Register
          </p>
          <p className="mt-1 text-[13px] font-semibold text-slate-800">
            Rake {manifest.rakeNumber} · {manifest.totalWagons} wagon(s) recorded
          </p>
          {loading?.wagonSupply ? (
            <p className="text-[12px] text-slate-500">Supply: {loading.wagonSupply}</p>
          ) : null}
        </div>
        <p className="text-[11px] text-slate-400">{manifest.source}</p>
      </div>

      {editable ? (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
          <p className="mb-3 text-[12px] font-semibold text-blue-900">
            Add wagon number and railway flags
          </p>
          <UniformFormField label="Wagon Number">
            <input
              type="text"
              className={`${uniformInputClass} font-mono text-[12px]`}
              value={newWagonNumber}
              onChange={(event) => setNewWagonNumber(event.target.value)}
              placeholder="e.g. W-8812-043"
            />
          </UniformFormField>

          <div className="mt-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-600">
              Railway Flags
            </p>
            <div className="flex flex-wrap gap-2">
              {RAILWAY_WAGON_FLAGS.map((flag) => (
                <button
                  key={flag.id}
                  type="button"
                  onClick={() => toggleFlag(flag.id)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                    selectedFlags.includes(flag.id)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {flag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddWagon}
              disabled={!newWagonNumber.trim() || saving}
              className={uniformPrimaryButtonClass}
            >
              {saving ? "Saving..." : "Add Wagon"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="max-h-48 overflow-y-auto rounded border border-slate-200 bg-white">
        <table className="w-full text-left text-[12px]">
          <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-[0.05em] text-slate-500">
            <tr>
              <th className="px-3 py-2">Pos</th>
              <th className="px-3 py-2">Wagon Number</th>
              <th className="px-3 py-2">Railway Flags</th>
              {editable ? <th className="px-3 py-2 text-right">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {displayWagons.length === 0 ? (
              <tr>
                <td colSpan={editable ? 4 : 3} className="px-3 py-6 text-center text-slate-400">
                  {editable
                    ? "No wagons added yet. Use the form above to add wagon numbers and flags."
                    : "No flagged wagons to display."}
                </td>
              </tr>
            ) : (
              displayWagons.map((wagon) => (
                <tr key={wagon.wagonNumber} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-slate-500">{wagon.position}</td>
                  <td className="px-3 py-1.5 font-mono font-semibold text-slate-700">
                    {wagon.wagonNumber}
                  </td>
                  <td className="px-3 py-1.5 text-slate-600">
                    {wagon.flags?.length
                      ? wagon.flags.map((flag) => RAILWAY_FLAG_LABELS[flag] || flag).join(", ")
                      : "—"}
                  </td>
                  {editable ? (
                    <td className="px-3 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveWagon?.(wagon.wagonNumber)}
                        disabled={saving}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editable ? (
        <p className="mt-2 text-[11px] text-slate-500">
          Railway team can add wagon numbers and flags here. When the Railway API is connected, API
          data will load automatically and manual entries will be merged.
        </p>
      ) : null}
    </div>
  );
}

export function PriorDepartmentInspections({ approval, reviewDepartment }) {
  const priorDepartments = getPriorVisibleDepartments(reviewDepartment);
  const visibleSteps = useMemo(
    () =>
      priorDepartments
        .map((department) => ({ department, step: approval?.[department] }))
        .filter(({ step }) => isPriorStepSubmitted(step)),
    [approval, priorDepartments],
  );

  const [openSections, setOpenSections] = useState({});

  if (visibleSteps.length === 0) return null;

  const allOpen = visibleSteps.every(({ department }) => openSections[department]);
  const anyOpen = visibleSteps.some(({ department }) => openSections[department]);

  function toggleSection(department) {
    setOpenSections((prev) => ({ ...prev, [department]: !prev[department] }));
  }

  function setAllSections(open) {
    setOpenSections(Object.fromEntries(visibleSteps.map(({ department }) => [department, open])));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-800">Previous railway submissions</p>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Collapsed by default — expand only what you need to review.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAllSections(true)}
            disabled={allOpen}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setAllSections(false)}
            disabled={!anyOpen}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            Collapse all
          </button>
        </div>
      </div>

      {visibleSteps.map(({ department, step }) => (
        <CollapsibleSubmittedSection
          key={department}
          department={department}
          step={step}
          isOpen={Boolean(openSections[department])}
          onToggle={() => toggleSection(department)}
        />
      ))}
    </div>
  );
}

export function DepartmentInspectionFields({
  department,
  form,
  onChange,
  trackClearanceTime,
  onTrackClearanceTimeChange,
}) {
  const updateList = (field, text) => {
    onChange(field, text);
  };

  if (department === "operations") {
    return (
      <div className="space-y-4">
        <InspectionSubsection title="Track Clearance">
          <UniformFormField label="Track Clearance Time">
            <input
              type="datetime-local"
              className={uniformInputClass}
              value={trackClearanceTime || ""}
              onChange={(event) => onTrackClearanceTimeChange(event.target.value)}
            />
          </UniformFormField>
          <p className="mt-2 text-[12px] text-slate-600">
            Station Master grants track clearance before commercial verification.
          </p>
        </InspectionSubsection>

        <InspectionSubsection title="Safety Checklists">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ChecklistField
              label="Door / Unlock Check"
              passed={form.doorUnlockPassed}
              onChange={(value) => onChange("doorUnlockPassed", value)}
            />
            <ChecklistField
              label="Single Bar Check"
              passed={form.singleBarPassed}
              onChange={(value) => onChange("singleBarPassed", value)}
            />
            <ChecklistField
              label="Downside Check"
              passed={form.downsideCheckPassed}
              onChange={(value) => onChange("downsideCheckPassed", value)}
            />
          </div>
        </InspectionSubsection>

        <InspectionSubsection title="Wagon Issues">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <WagonListField
              label="Uneven Wagon Numbers"
              value={form.uneven}
              onChange={(text) => updateList("uneven", text)}
            />
            <WagonListField
              label="Sick Wagon Numbers"
              value={form.sick}
              onChange={(text) => updateList("sick", text)}
            />
            <WagonListField
              label="Repair Wagon Numbers"
              value={form.repair}
              onChange={(text) => updateList("repair", text)}
            />
          </div>
        </InspectionSubsection>
      </div>
    );
  }

  if (department === "commercial") {
    return (
      <div className="space-y-4">
        <InspectionSubsection title="Top View Inspection">
          <UniformFormField label="Top View Inspection Remarks">
            <textarea
              className={`${uniformInputClass} min-h-16`}
              value={form.topViewRemarks || ""}
              onChange={(event) => onChange("topViewRemarks", event.target.value)}
              placeholder="Top view observations — loading profile, uneven rake formation..."
            />
          </UniformFormField>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WagonListField
              label="Overloaded Wagon Numbers (Top View)"
              hint="Wagons exceeding load limits from top inspection"
              value={form.overloaded}
              onChange={(text) => updateList("overloaded", text)}
            />
            <WagonListField
              label="Uneven Rake Wagon Numbers (Top View)"
              hint="Wagons contributing to uneven rake profile"
              value={form.unevenRake}
              onChange={(text) => updateList("unevenRake", text)}
            />
          </div>
        </InspectionSubsection>

        <InspectionSubsection title="Safety Checklists">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ChecklistField
              label="Door / Unlock Check"
              passed={form.doorUnlockPassed}
              onChange={(value) => onChange("doorUnlockPassed", value)}
            />
            <ChecklistField
              label="Single Bar Check"
              passed={form.singleBarPassed}
              onChange={(value) => onChange("singleBarPassed", value)}
            />
            <ChecklistField
              label="Downside Check"
              passed={form.downsideCheckPassed}
              onChange={(value) => onChange("downsideCheckPassed", value)}
            />
          </div>
        </InspectionSubsection>

        <InspectionSubsection title="Wagon Issues">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <WagonListField
              label="Uneven Wagon Numbers"
              value={form.uneven}
              onChange={(text) => updateList("uneven", text)}
            />
            <WagonListField
              label="Sick Wagon Numbers"
              value={form.sick}
              onChange={(text) => updateList("sick", text)}
            />
            <WagonListField
              label="Repair Wagon Numbers"
              value={form.repair}
              onChange={(text) => updateList("repair", text)}
            />
          </div>
        </InspectionSubsection>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InspectionSubsection title="Safety Checklists">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ChecklistField
            label="Door / Unlock Check"
            passed={form.doorUnlockPassed}
            onChange={(value) => onChange("doorUnlockPassed", value)}
          />
          <ChecklistField
            label="Single Bar Check"
            passed={form.singleBarPassed}
            onChange={(value) => onChange("singleBarPassed", value)}
          />
          <ChecklistField
            label="Downside Check"
            passed={form.downsideCheckPassed}
            onChange={(value) => onChange("downsideCheckPassed", value)}
          />
        </div>
      </InspectionSubsection>

      <InspectionSubsection title="Checklist Issue Wagons">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <WagonListField
            label="Door / Unlock Issue Wagon Numbers"
            value={form.doorUnlock}
            onChange={(text) => updateList("doorUnlock", text)}
          />
          <WagonListField
            label="Single Bar Issue Wagon Numbers"
            value={form.singleBar}
            onChange={(text) => updateList("singleBar", text)}
          />
          <WagonListField
            label="Downside Check Issue Wagon Numbers"
            value={form.downsideCheck}
            onChange={(text) => updateList("downsideCheck", text)}
          />
        </div>
      </InspectionSubsection>

      <InspectionSubsection title="Wagon Issues">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <WagonListField
            label="Uneven Wagon Numbers"
            value={form.uneven}
            onChange={(text) => updateList("uneven", text)}
          />
          <WagonListField
            label="Sick Wagon Numbers"
            value={form.sick}
            onChange={(text) => updateList("sick", text)}
          />
          <WagonListField
            label="Repair Wagon Numbers"
            value={form.repair}
            onChange={(text) => updateList("repair", text)}
          />
        </div>
      </InspectionSubsection>
    </div>
  );
}
