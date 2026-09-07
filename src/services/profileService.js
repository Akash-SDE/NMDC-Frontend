import { apiClient } from "../api/axiosClient";

/**
 * GET /user/v1/profile
 * Returns the authenticated user's full profile.
 */
export async function fetchProfile() {
  const { data } = await apiClient.get("/user/v1/profile");
  return data;
}
