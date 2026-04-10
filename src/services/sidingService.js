import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/siding";

export const fetchSidings = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createSiding = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateSiding = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchSiding = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteSiding = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
