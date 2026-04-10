import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/stockpile";

export const fetchStockpiles = (filters = {}) =>
  apiRequest(`${BASE}/list`, { method: "POST", body: JSON.stringify(filters) });

export const createStockpile = (data) =>
  apiRequest(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateStockpile = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const patchStockpile = (id, data) =>
  apiRequest(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteStockpile = (id) =>
  apiRequest(`${BASE}/${id}`, { method: "DELETE" });
