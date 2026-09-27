import { apiRequest } from "./apiClient";

const BASE = "/rake-management/v1/loading_management";

export function listLoadingRecords(filters = {}) {
  return apiRequest(`${BASE}/list`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

export function createLoadingRecord(data) {
  return apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLoadingRecord(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
