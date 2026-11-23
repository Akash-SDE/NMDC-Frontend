import { useRef } from "react";

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

/**
 * Hidden native date/datetime-local input + icon to open the browser calendar picker.
 * Keeps stored values as YYYY-MM-DD or YYYY-MM-DDTHH:mm.
 */
export default function NativeDatePickerBridge({
  pickerType = "date",
  value = "",
  onChange,
  disabled = false,
  readOnly = false,
  title = "Open calendar",
}) {
  const pickerRef = useRef(null);

  if (disabled || readOnly) {
    return null;
  }

  function openPicker() {
    const node = pickerRef.current;
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
    <>
      <input
        ref={pickerRef}
        type={pickerType}
        value={value || ""}
        onChange={(event) => onChange?.(event.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
      <button
        type="button"
        onClick={openPicker}
        title={title}
        aria-label={title}
        className="absolute right-1.5 top-1/2 z-[1] -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
      >
        <CalendarIcon />
      </button>
    </>
  );
}