import { apiRequest } from "./apiClient";

const BASE = "/rake-management/v1/delay_management";

export function listDelayRecords(filters = {}) {
  return apiRequest(`${BASE}/list`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

export function createDelayRecord(data) {
  return apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDelayRecord(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
