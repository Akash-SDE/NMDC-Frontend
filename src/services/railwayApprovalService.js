import { apiRequest } from "./apiClient";
import { APPROVAL_DEPARTMENTS, APPROVAL_STATUS } from "../constants/approval";
import { applyApprovalDecision } from "../types/approvalTransforms";
import {
  ACTION_CODE,
  DEPARTMENT_CODE,
  RAILWAY_STATUS_CODE,
  manifestToApiWagons,
  mapRailwayApproval,
  stepToApi,
} from "../features/railway/utils/railwayApprovalMappers";

const BASE = "/rake-management/v1/railway_approval";
const LOADING_READY_FOR_DISPATCH = 20;

export async function listRailwayApprovals(filters = {}) {
  const data = await apiRequest(`${BASE}/list`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
  return (data?.results || []).map(mapRailwayApproval);
}

export async function getRailwayApproval(id) {
  const data = await apiRequest(`${BASE}/${id}`);
  return mapRailwayApproval(data);
}

export function createRailwayApproval(data) {
  return apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function saveRailwayApproval(id, payload) {
  await apiRequest(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return getRailwayApproval(id);
}

export function updateRailwayWagonManifest(approvalId, manifest) {
  return saveRailwayApproval(approvalId, {
    wagons: manifestToApiWagons(manifest),
  });
}

export async function submitRailwayDecision(approval, department, decision) {
  const next = applyApprovalDecision(approval, department, decision);
  const historyEntry = next.history[next.history.length - 1];
  const payload = {
    status: RAILWAY_STATUS_CODE[next.status],
    steps: [stepToApi(next[department], department)],
    history_entry: {
      department: DEPARTMENT_CODE[department] ?? null,
      action: ACTION_CODE[historyEntry?.action] || ACTION_CODE.approved,
      actor_name: historyEntry?.actor || decision.actor || "",
      acted_on: historyEntry?.timestamp || new Date().toISOString(),
      remarks: historyEntry?.remarks || "",
    },
  };

  const clearanceTime =
    department === APPROVAL_DEPARTMENTS.OPERATIONS && decision.action === "approve"
      ? next.operations.trackClearanceTime || next.operations.inspection?.trackClearanceTime
      : null;

  if (clearanceTime) {
    payload.clearance_time = clearanceTime;
  }
  if (next.status === APPROVAL_STATUS.APPROVED) {
    payload.loading_status = LOADING_READY_FOR_DISPATCH;
  }

  return saveRailwayApproval(approval.id, payload);
}
