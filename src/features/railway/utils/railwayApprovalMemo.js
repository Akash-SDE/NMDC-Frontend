import { APPROVAL_STEP_LABELS } from "../../../constants/approval";
import { getOverallStatusMessage } from "../../../utils/approvalUtils";
import { formatDateTimeForTable } from "../../../utils/dateUtils";

const NMDC_RECIPIENT_LABEL = "NMDC Administration / Dispatch Control";

export function formatRailwayApprovalMemo({
  approval,
  department,
  actor,
  remarks = "",
  loading = null,
}) {
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
