import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/routes";

export const fetchRoutes = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createRoute = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateRoute = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchRoute = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteRoute = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
