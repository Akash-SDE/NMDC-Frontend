import { apiRequest } from "./apiClient";
import { mapEDemand, mapEPermit } from "../features/edemand/utils/edemandMappers";

const DEMAND_BASE = "/rake-management/v1/edemand";
const PERMIT_BASE = "/rake-management/v1/epermit";

export async function listEDemands(filters = {}) {
  const data = await apiRequest(`${DEMAND_BASE}/list`, {
    method: "POST",
    body: JSON.stringify({ page_size: 1000, ...filters }),
  });
  return (data?.results || []).map(mapEDemand);
}

export async function createEDemand(payload) {
  const data = await apiRequest(DEMAND_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapEDemand(data);
}

export async function updateEDemand(id, payload) {
  const data = await apiRequest(`${DEMAND_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapEDemand(data);
}

export function cancelEDemand(id) {
  return apiRequest(`${DEMAND_BASE}/${id}`, { method: "DELETE" });
}

export async function listEPermits(filters = {}) {
  const data = await apiRequest(`${PERMIT_BASE}/list`, {
    method: "POST",
    body: JSON.stringify({ page_size: 1000, ...filters }),
  });
  return (data?.results || []).map(mapEPermit);
}

export async function updateEPermitNumber(id, ePermitNumber) {
  const data = await apiRequest(`${PERMIT_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ epermit_number: ePermitNumber }),
  });
  return mapEPermit(data);
}
