import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/delayreasons";

export const fetchDelayReasons = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createDelayReason = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateDelayReason = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchDelayReason = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteDelayReason = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
