import { apiClient } from "../api/axiosClient";
import axios from "axios";

const BASE = "/extraction/v1/railway_receipt";

/**
 * POST /extraction/v1/railway_receipt/list
 * @param {object} params  e.g. { page, page_size, search }
 */
export async function fetchRailwayReceipts(params = {}) {
  const { data } = await apiClient.post(`${BASE}/list`, params);
  return data; // { count, page, page_size, results: [...] }
}

/**
 * POST /extraction/upload/
 * Upload a single PDF. Extraction is a long-running process — uses a
 * dedicated axios instance with NO timeout so it waits as long as needed.
 * @param {File} file
 */
export async function uploadRailwayReceiptPdf(file) {
  // Build a one-off client with no timeout and the same base URL + auth token
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Read token from localStorage the same way axiosClient does
  let token = null;
  try {
    const raw = localStorage.getItem("nmdc_auth_tokens");
    token = raw ? JSON.parse(raw)?.access : null;
  } catch {
    // ignore
  }

  const form = new FormData();
  form.append("pdf", file);

  const { data } = await axios.post(`${baseURL}/extraction/upload/`, form, {
    timeout: 0,  // 0 = no timeout — wait as long as the server needs
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return data; // RailwayReceipt (status may be PENDING/PROCESSING/COMPLETED)
}

/**
 * POST /extraction/v1/railway_receipt/list  with id filter
 * Used for polling a single record's status.
 * @param {number} id
 */
export async function fetchRailwayReceiptById(id) {
  const { data } = await apiClient.post(`${BASE}/list`, { id });
  const results = data.results ?? [];
  return results.find((r) => r.id === id) ?? null;
}
