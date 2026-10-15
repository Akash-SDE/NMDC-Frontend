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
 * Upload a single PDF. Extraction is a long-running process — the request
 * has NO timeout so it waits as long as needed.
 * @param {File} file
 */
export async function uploadRailwayReceiptPdf(file) {
  const form = new FormData();
  form.append("pdf", file);

  const { data } = await apiClient.post("/extraction/upload/", form, {
    timeout: 0,  // 0 = no timeout — wait as long as the server needs
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // RailwayReceipt (status may be PENDING/PROCESSING/COMPLETED)
}

/**
 * POST /extraction/v1/railway_receipt/:id/reprocess
 * Re-runs extraction for an uploaded PDF; returns the record with status PROCESSING.
 * @param {number} id
 */
export async function reprocessRailwayReceipt(id) {
  const { data } = await apiClient.post(`${BASE}/${id}/reprocess`);
  return data;
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
