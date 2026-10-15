import axios from "axios";
import { TOKEN_STORAGE_KEY } from "../constants/storageKeys";
import { isMockSession, isMockToken } from "../utils/mockSession";
import { parseApiError } from "./apiError";
import { notifySessionExpired } from "./session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "[axiosClient] VITE_API_BASE_URL is not set.\n" +
    "  • Local dev: set it in .env\n" +
    "  • Production: set it in .env.production or as an env var on Render"
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // default for all requests; overridden per-request where needed
});

function readAccessToken() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw)?.access : null;
  } catch {
    return null;
  }
}

function readRefreshToken() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw)?.refresh : null;
  } catch {
    return null;
  }
}

function writeTokens(tokens) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // ignore storage failures
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = readRefreshToken();
  if (!refresh) throw new Error("Session expired. Please log in again.");

  const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, {
    refresh,
  });

  const updated = { refresh, access: data.access };
  writeTokens(updated);
  return data.access;
}

apiClient.interceptors.request.use((config) => {
  const token = readAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Logs the user out instead of surfacing "token expired" errors. The returned
 * promise never settles so callers don't flash error toasts while the app
 * redirects to the login page.
 */
function expireSession() {
  notifySessionExpired();
  return new Promise(() => {});
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || error.response?.status !== 401) {
      return Promise.reject(parseApiError(error));
    }

    // Unauthenticated calls (login, OTP) report their own 401s.
    if (!original.headers?.Authorization || isMockSession()) {
      return Promise.reject(parseApiError(error));
    }

    if (original._retry || !readRefreshToken()) {
      return expireSession();
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const access = await refreshPromise;
      original._retry = true;
      original.headers.Authorization = `Bearer ${access}`;
      return apiClient(original);
    } catch (refreshError) {
      const status = refreshError?.response?.status;
      if (status === 400 || status === 401 || !readRefreshToken()) {
        return expireSession();
      }
      return Promise.reject(parseApiError(refreshError));
    }
  },
);

export async function apiRequest(config) {
  const response = await apiClient(config);
  if (response.status === 204) return null;
  return response.data;
}

export { readAccessToken, readRefreshToken, writeTokens, refreshAccessToken };
