const API_BASE = "https://iron-ore-rdms.onrender.com";
const TOKEN_KEY = "nmdc_auth_tokens";

function getAccessToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw)?.access : null;
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      err?.detail ||
      err?.non_field_errors?.[0] ||
      Object.values(err)?.[0]?.[0] ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}
