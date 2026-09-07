import { apiClient } from "../api/axiosClient";

const BASE = "/user/v1";

/**
 * POST /user/v1/list
 * Supports pagination and filtering.
 * @param {object} params  e.g. { page, page_size, search, status }
 */
export async function fetchUsers(params = {}) {
  const { data } = await apiClient.post(`${BASE}/list`, params);
  return data; // { count, total_is_active, total_inactive, results: [...] }
}

/**
 * POST /user/v1
 * Create a new user.
 */
export async function createUser(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data;
}

/**
 * PUT /user/v1/modify/{id}
 * Update an existing user.
 */
export async function updateUser(id, payload) {
  const { data } = await apiClient.put(`${BASE}/modify/${id}`, payload);
  return data;
}
