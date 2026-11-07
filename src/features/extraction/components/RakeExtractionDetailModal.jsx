import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DOC_STATUS_BADGE, RAKE_STATUS_BADGE } from "../utils/rakeExtractionStatus";
import { buildDocumentSections, fmt, getFileName } from "../utils/extractionFormat";

const SLIDES = [
  { key: "rr", label: "RR", subtitle: "eT-RR / Railway Receipt", type: "RR" },
  { key: "rtp", label: "RTP", subtitle: "Ready to Proceed", type: "RTP" },
  { key: "invoice", label: "Invoice", subtitle: "Tax invoice", type: "INVOICE" },
];

function Badge({ map, status }) {
  const s = (status || "PENDING").toUpperCase();
  const meta = map[s] ?? map.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

function WagonTable({ wagons }) {
  if (!wagons?.length) {
    return <p className="text-[12px] text-slate-500">No wagon rows were extracted.</p>;
  }
  return (
    <div className="max-h-52 overflow-auto rounded-lg border border-slate-100">
      <table className="w-full text-[11px]">
        <thead className="sticky top-0 bg-slate-50">
          <tr className="text-left text-slate-500">
            <th className="px-2 py-1.5">Sr</th>
            <th className="px-2 py-1.5">Wagon No</th>
            <th className="px-2 py-1.5">Type</th>
            <th className="px-2 py-1.5">Gross (T)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {wagons.map((w) => (
            <tr key={w.id ?? w.serial_number}>
              <td className="px-2 py-1">{fmt(w.serial_number)}</td>
              <td className="px-2 py-1">{fmt(w.wagon_number)}</td>
              <td className="px-2 py-1">{fmt(w.wagon_type)}</td>
              <td className="px-2 py-1">{fmt(w.gross_weight)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentSlidePanel({ slide, record, onReprocess, reprocessingType }) {
  const label = `${slide.label} (${slide.subtitle})`;

  if (!record?.pdf_file && (record?.status || "PENDING").toUpperCase() === "PENDING") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
        <p className="text-[14px] font-semibold text-slate-600">{slide.label} not uploaded</p>
        <p className="mt-1 max-w-sm text-[12px] text-slate-500">
          Upload a PDF from the {slide.label} column on the extraction table to extract data here.
        </p>
        <Badge map={DOC_STATUS_BADGE} status="PENDING" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold text-slate-700">{getFileName(record?.pdf_file)}</p>
          <p className="text-[11px] text-slate-500">{slide.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge map={DOC_STATUS_BADGE} status={record?.status || "PENDING"} />
          {record?.pdf_file && onReprocess ? (
            <button
              type="button"
              data-write
              disabled={reprocessingType === slide.type}
              onClick={() => onReprocess(slide.type)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            >
              {reprocessingType === slide.type ? "Re-extracting…" : "Re-extract"}
            </button>
          ) : null}
        </div>
      </div>

      {slide.key === "rr" && record?.wagon_details?.length ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Wagon details ({record.wagon_details.length})
          </p>
          <WagonTable wagons={record.wagon_details} />
        </div>
      ) : null}

      {buildDocumentSections(record, label, { slot: slide.key }).map((sec) => (
        <div key={sec.title} className="overflow-hidden rounded-lg border border-slate-100">
          <p className="bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {sec.title}
          </p>
          <div className="divide-y divide-slate-100">
            {sec.rows.map(([rowLabel, value]) => (
              <div key={rowLabel} className="flex gap-3 px-4 py-2.5">
                <span className="w-36 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {rowLabel}
                </span>
                <span
                  className={`min-w-0 break-words text-[13px] font-medium text-slate-700 ${
                    rowLabel === "Extracted text" ? "whitespace-pre-wrap font-mono text-[11px]" : ""
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RakeExtractionDetailModal({
  detail,
  loading,
  onClose,
  onReprocess,
  reprocessingType,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [detail?.rake_id]);

  const goTo = useCallback((index) => {
    setActiveIndex(Math.max(0, Math.min(SLIDES.length - 1, index)));
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
      if (event.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goTo, onClose]);

  if (!detail && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-[#102a57]">Extracted data</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Rake {detail?.rake_number || "—"} · slide through RR, RTP, and Invoice
              </p>
            </div>
            <div className="flex items-center gap-2">
              {detail ? <Badge map={RAKE_STATUS_BADGE} status={detail.status} /> : null}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {SLIDES.map((slide, index) => {
              const record = detail?.[slide.key];
              const active = index === activeIndex;
              return (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`flex flex-1 flex-col items-center rounded-md px-2 py-2 text-center transition-colors ${
                    active ? "bg-white text-[#2563eb] shadow-sm" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <span className="text-[12px] font-bold">{slide.label}</span>
                  <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                    {record?.status ? (DOC_STATUS_BADGE[record.status.toUpperCase()]?.label ?? record.status) : "Pending"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-[11px] font-medium text-slate-500">
              {activeIndex + 1} / {SLIDES.length} · {SLIDES[activeIndex].label}
            </span>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === SLIDES.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500">Loading…</p>
          ) : (
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {SLIDES.map((slide) => (
                <div
                  key={slide.key}
                  className="h-full w-full shrink-0 overflow-y-auto px-5 py-4"
                  aria-hidden={SLIDES[activeIndex].key !== slide.key}
                >
                  <DocumentSlidePanel
                    slide={slide}
                    record={detail?.[slide.key]}
                    onReprocess={onReprocess}
                    reprocessingType={reprocessingType}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-center gap-2 border-t border-slate-100 py-3">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to ${slide.label}`}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-[#2563eb]" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
