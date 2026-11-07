const STORAGE_KEY = "rdms_railway_nmdc_memo_sent";

export function readNmdcMemoSentFlags() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function markNmdcMemoSent(approvalId) {
  if (approvalId == null) return;
  const next = { ...readNmdcMemoSentFlags(), [String(approvalId)]: true };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures; in-memory state still updates for this session.
  }
  return next;
}
