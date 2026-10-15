import { apiRequest } from "./apiClient";

const BASE = "/rake-management/v1/reports";

export function fetchReport(reportId, filters = {}) {
  return apiRequest(`${BASE}/${reportId}`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
}
