import { apiClient } from "../api/axiosClient";

const BASE = "/admin/v1/role";
const PRIV_BASE = "/admin/v1/privilege";

/**
 * POST /admin/v1/role/list
 */
export async function fetchRoles(params = {}) {
  const { data } = await apiClient.post(`${BASE}/list`, params);
  return data; // { count, results: [...] }
}

/**
 * POST /admin/v1/privilege/list
 * Returns { count, results: [{ module_id, privileges: [{ id, privilege_name, privilege_desc }] }] }
 */
export async function fetchPrivileges() {
  const { data } = await apiClient.post(`${PRIV_BASE}/list`);
  return data;
}

/**
 * POST /admin/v1/role
 */
export async function createRole(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data;
}

/**
 * PUT /admin/v1/role/{id}
 */
export async function updateRole(id, payload) {
  const { data } = await apiClient.put(`${BASE}/${id}`, payload);
  return data;
}
