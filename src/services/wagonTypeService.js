import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/wagontype";

export const fetchWagonTypes = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createWagonType = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateWagonType = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchWagonType = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteWagonType = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
