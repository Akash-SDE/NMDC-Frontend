import { Loader2, Upload } from "lucide-react";
import {
  canUploadSlot,
  DOC_STATUS_BADGE,
  isSlotProcessing,
  normalizeDocStatus,
} from "../utils/rakeExtractionStatus";

function DocBadge({ status }) {
  const s = normalizeDocStatus(status);
  const meta = DOC_STATUS_BADGE[s] ?? DOC_STATUS_BADGE.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}
    >
      {s === "PROCESSING" ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      )}
      {meta.label}
    </span>
  );
}

export default function DocumentSlotCell({ slot, uploading, onUpload }) {
  const status = normalizeDocStatus(slot?.status);
  const showUpload = canUploadSlot(status) && !uploading && !isSlotProcessing(status);

  return (
    <div className="flex items-center gap-2">
      <DocBadge status={uploading ? "PROCESSING" : status} />
      {showUpload ? (
        <button
          type="button"
          data-write
          onClick={onUpload}
          title="Upload PDF"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
        >
          <Upload size={16} />
        </button>
      ) : null}
    </div>
  );
}
