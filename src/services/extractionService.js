import { apiClient } from "../api/axiosClient";

const RECEIPT_BASE = "/extraction/v1/railway_receipt";
const RAKE_BASE = "/extraction/v1/rake_extraction";

/** @deprecated Legacy receipt list — kept for backward compatibility */
export async function fetchRailwayReceipts(params = {}) {
  const { data } = await apiClient.post(`${RECEIPT_BASE}/list`, params);
  return data;
}

/** @deprecated Legacy bulk upload */
export async function uploadRailwayReceiptPdf(file) {
  const form = new FormData();
  form.append("pdf", file);
  const { data } = await apiClient.post("/extraction/upload/", form, {
    timeout: 0,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function reprocessRailwayReceipt(id) {
  const { data } = await apiClient.post(`${RECEIPT_BASE}/${id}/reprocess`);
  return data;
}

export async function fetchRailwayReceiptById(id) {
  const { data } = await apiClient.post(`${RECEIPT_BASE}/list`, { id });
  const results = data.results ?? [];
  return results.find((r) => r.id === id) ?? null;
}

export async function fetchRakeExtractions(params = {}) {
  const { data } = await apiClient.post(`${RAKE_BASE}/list`, params);
  return data;
}

export async function uploadRakeDocument(rakeId, documentType, file) {
  const form = new FormData();
  form.append("rake_id", String(rakeId));
  form.append("document_type", documentType);
  form.append("pdf", file);
  const { data } = await apiClient.post(`${RAKE_BASE}/upload`, form, {
    timeout: 0,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchRakeExtractionDetail(rakeId) {
  const { data } = await apiClient.get(`${RAKE_BASE}/${rakeId}`);
  return data;
}

export async function reprocessRakeDocument(rakeId, documentType) {
  const { data } = await apiClient.post(`${RAKE_BASE}/reprocess`, {
    rake_id: rakeId,
    document_type: documentType,
  });
  return data;
}
