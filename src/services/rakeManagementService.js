import { apiRequest } from "./apiClient";

const BASE = "/rake-management/v1/rake_management";

export function listRakes(filters = {}) {
  return apiRequest(`${BASE}/list`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

export function createRake(data) {
  return apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRake(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
