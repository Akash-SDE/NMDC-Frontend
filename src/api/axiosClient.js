import axios from "axios";
import { TOKEN_STORAGE_KEY } from "../constants/storageKeys";
import { isMockSession, isMockToken } from "../utils/mockSession";
import { parseApiError } from "./apiError";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://iron-ore-rdms.onrender.com/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || original._retry || error.response?.status !== 401) {
      return Promise.reject(parseApiError(error));
    }

    if (!readRefreshToken() || isMockSession()) {
      return Promise.reject(parseApiError(error));
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
