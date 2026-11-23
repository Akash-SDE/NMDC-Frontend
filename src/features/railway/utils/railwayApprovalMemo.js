import { APPROVAL_STEP_LABELS } from "../../../constants/approval";
import { RAILWAY_FLAG_LABELS } from "../../../constants/railwayInspection";
import { getOverallStatusMessage } from "../../../utils/approvalUtils";
import { formatDateTimeForTable } from "../../../utils/dateUtils";

export function resolveWagonManifestForMemo(wagonManifest, approval) {
  const fromModal = wagonManifest?.wagons?.length ? wagonManifest : null;
  const fromApproval = approval?.wagonManifest?.wagons?.length ? approval.wagonManifest : null;
  if (fromModal && fromApproval) {
    return (fromModal.wagons?.length ?? 0) >= (fromApproval.wagons?.length ?? 0)
      ? fromModal
      : fromApproval;
  }
  return fromModal ?? fromApproval ?? wagonManifest ?? approval?.wagonManifest ?? null;
}

function formatWagonRegisterSection(manifest) {
  if (!manifest?.wagons?.length) {
    return ["  (No wagons recorded in the railway wagon register.)"];
  }

  const lines = [
    `  Rake ${manifest.rakeNumber || "—"} · ${manifest.totalWagons ?? manifest.wagons.length} wagon(s)`,
    "",
  ];

  manifest.wagons.forEach((wagon) => {
    const flags = (wagon.flags || [])
      .map((flag) => RAILWAY_FLAG_LABELS[flag] || flag)
      .join(", ");
    lines.push(
      `  #${wagon.position ?? "—"}  ${wagon.wagonNumber || "—"}${flags ? `  [${flags}]` : ""}`,
    );
  });

  return lines;
}

const NMDC_RECIPIENT_LABEL = "NMDC Administration / Dispatch Control";

export function formatRailwayApprovalMemo({
  approval,
  department,
  actor,
  remarks = "",
  loading = null,
  wagonManifest = null,
}) {
  const registerManifest = resolveWagonManifestForMemo(wagonManifest, approval);
  const departmentLabel = APPROVAL_STEP_LABELS[department] || department;
  const completionTime = formatDateTimeForTable(
    loading?.completionTime || approval?.completionTime,
  );

  return [
    "NMDC BIOM BACHELI COMPLEX",
    "Rake Dispatch Management System — Railway Approval Memo",
    "─".repeat(56),
    "",
    `Date/Time   : ${formatDateTimeForTable(new Date().toISOString())}`,
    `To          : ${NMDC_RECIPIENT_LABEL}`,
    `From        : ${departmentLabel}`,
    `Prepared by : ${actor || "System User"}`,
    "",
    `Subject     : Railway approval update — Rake ${approval?.rakeNumber || "—"}`,
    "",
    "Rake details",
    `  • Rake number     : ${approval?.rakeNumber || "—"}`,
    `  • Customer        : ${approval?.customer || "—"}`,
    `  • Siding          : ${approval?.siding || "—"}`,
    `  • Loading record  : ${approval?.loadingId || "—"}`,
    `  • Tonnage         : ${loading?.tonnage ?? approval?.tonnage ?? "—"}`,
    `  • Completion time : ${completionTime || "—"}`,
    "",
    "Railway wagon register",
    ...formatWagonRegisterSection(registerManifest),
    "",
    "Workflow",
    `  • Triggering step : ${departmentLabel}`,
    `  • Current status  : ${getOverallStatusMessage(approval)}`,
    "",
    "Remarks",
    remarks?.trim() ? `  ${remarks.trim()}` : "  (No additional remarks.)",
    "",
    "Action requested",
    "  Please review the consolidated railway approval queue and complete the NMDC",
    "  clearance when all railway department checks are satisfied.",
    "",
    "─".repeat(56),
    "This is a system-generated memo from RDMS Railway Approvals.",
  ].join("\n");
}

export function buildRailwayMemoApiPayload({ approval, department, actor, remarks, memoText }) {
  return {
    rake_number: approval?.rakeNumber,
    loading_id: approval?.loadingId,
    approval_id: approval?.id,
    department,
    actor_name: actor,
    remarks: remarks?.trim() || "",
    memo_text: memoText,
    recipient_role: "admin",
  };
}
