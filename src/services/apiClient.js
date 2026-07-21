import { apiClient } from "../api/axiosClient";
import { isMockSession } from "../utils/mockSession";
import { handleDevMasterDataRequest } from "./masterData/devMasterDataMock";

/** Backward-compatible fetch-style API wrapper for master-data services. */
export async function apiRequest(path, options = {}) {
  if (isMockSession() && path.startsWith("/master-data/")) {
    return handleDevMasterDataRequest(path, options);
  }

  const method = options.method || "GET";
  const response = await apiClient({
    url: path,
    method,
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: options.headers,
  });

  if (response.status === 204) return null;
  return response.data;
}

export default apiRequest;
