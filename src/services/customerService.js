import { apiRequest } from "./apiClient";

const BASE = "/master-data/v1/customer";

/** Fetch paginated/filtered list */
export function fetchCustomers(filters = {}) {
  return apiRequest(`${BASE}/list`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

/** Create a new customer */
export function createCustomer(data) {
  return apiRequest(`${BASE}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Get single customer by id */
export function getCustomer(id) {
  return apiRequest(`${BASE}/${id}`);
}

/** Full update */
export function updateCustomer(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Partial update (toggle status) */
export function patchCustomer(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** Delete customer */
export function deleteCustomer(id) {
  return apiRequest(`${BASE}/${id}`, { method: "DELETE" });
}
