import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/oretypes";

export const fetchOreTypes = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createOreType = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateOreType = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchOreType = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteOreType = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
