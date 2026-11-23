import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatTableDateOnly,
  joinDatetimeLocalValue,
  splitDatetimeLocalValue,
  todayIsoDateLocal,
} from "../../utils/dateUtils";

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const selectClass =
  "w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

/**
 * Calendar + explicit 24-hour time (00–23) — avoids OS 12-hour datetime-local pickers.
 */
export default function DateTimePickerBridge({ value = "", onChange, title = "Choose date and time (24-hour)" }) {
  const rootRef = useRef(null);
  const datePickerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const { date, hours, minutes } = useMemo(() => splitDatetimeLocalValue(value), [value]);
  const displayDate = date ? formatTableDateOnly(date) : "—";

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function publish(nextDate, nextHours, nextMinutes) {
    const isoDate = nextDate || date || todayIsoDateLocal();
    const merged = joinDatetimeLocalValue(isoDate, nextHours, nextMinutes);
    if (merged) onChange?.(merged);
  }

  function openNativeDatePicker() {
    const node = datePickerRef.current;
    if (!node) return;
    if (typeof node.showPicker === "function") {
      try {
        node.showPicker();
        return;
      } catch {
        // fall through
      }
    }
    node.focus();
  }

  return (
    <div ref={rootRef} className="absolute right-1.5 top-1/2 z-[2] -translate-y-1/2">
      <input
        ref={datePickerRef}
        type="date"
        value={date || ""}
        onChange={(event) => publish(event.target.value, hours, minutes)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        title={title}
        aria-label={title}
        aria-expanded={open}
        className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
      >
        <CalendarIcon />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(16rem,calc(100vw-1rem))] rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
          role="dialog"
          aria-label="Date and time picker"
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">24-hour time</p>

          <button
            type="button"
            onClick={openNativeDatePicker}
            className="mb-3 flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-[12px] font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
          >
            <span>Date</span>
            <span className="tabular-nums text-slate-800">{displayDate}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-slate-500">Hour (00–23)</span>
              <select
                value={hours}
                onChange={(event) => publish(date, event.target.value, minutes)}
                className={selectClass}
                aria-label="Hour 24-hour"
              >
                {HOUR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-slate-500">Minute</span>
              <select
                value={minutes}
                onChange={(event) => publish(date, hours, event.target.value)}
                className={selectClass}
                aria-label="Minute"
              >
                {MINUTE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}