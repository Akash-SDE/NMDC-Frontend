export const DOC_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

export const RAKE_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
};

export const DOCUMENT_TYPES = {
  RR: "RR",
  RTP: "RTP",
  INVOICE: "INVOICE",
};

export const DOC_STATUS_BADGE = {
  PENDING: { label: "Pending", cls: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  PROCESSING: { label: "Processing", cls: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { label: "Completed", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", cls: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
};

export const RAKE_STATUS_BADGE = {
  PENDING: { label: "Pending", cls: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress", cls: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  COMPLETED: { label: "Completed", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

export function normalizeDocStatus(status) {
  return (status || DOC_STATUS.PENDING).toUpperCase();
}

export function canUploadSlot(status) {
  const s = normalizeDocStatus(status);
  return s === DOC_STATUS.PENDING || s === DOC_STATUS.FAILED;
}

export function isSlotProcessing(status) {
  return normalizeDocStatus(status) === DOC_STATUS.PROCESSING;
}
