import { apiClient } from "../api/axiosClient";

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
 * Upload a single PDF. Backend queues extraction and returns a receipt
 * in PENDING or PROCESSING status. Poll until COMPLETED or FAILED.
 * @param {File} file
 * @param {AbortSignal} [signal]
 */
export async function uploadRailwayReceiptPdf(file, signal) {
  const form = new FormData();
  form.append("pdf", file);
  const { data } = await apiClient.post("/extraction/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,          // no timeout — upload + queue can take time
    signal,
  });
  return data; // RailwayReceipt (status may be PENDING/PROCESSING)
}

/**
 * POST /extraction/v1/railway_receipt/list  with id filter
 * Used for polling a single record's status.
 * @param {number} id
 */
export async function fetchRailwayReceiptById(id) {
  const { data } = await apiClient.post(`${BASE}/list`, { id });
  // API returns { count, results: [...] } — grab first match
  const results = data.results ?? [];
  return results.find((r) => r.id === id) ?? null;
}
