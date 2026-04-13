const BASE_URL = "https://iron-ore-rdms.onrender.com/api";

/**
 * Login with email + password. Returns { access, refresh }
 */
export async function loginWithCredentials(email, password) {
  const res = await fetch(`${BASE_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      "Invalid credentials. Please try again.";
    throw new Error(message);
  }

  return res.json();
}

/**
 * Refresh the access token using a stored refresh token.
 */
export async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) throw new Error("Session expired. Please log in again.");

  return res.json();
}
