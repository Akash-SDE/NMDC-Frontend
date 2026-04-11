import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/destination";

export const fetchDestinations = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createDestination = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateDestination = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchDestination = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteDestination = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
