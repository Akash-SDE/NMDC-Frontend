import { useEffect, useRef, useState } from "react";
import { Columns3 } from "lucide-react";

export const ICON_BUTTON_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600";

export default function ColumnSettingsMenu({ columns, hidden, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const hiddenCount = columns.filter((c) => hidden.includes(c.key)).length;
  const visibleCount = columns.length - hiddenCount;
  const allVisible = hiddenCount === 0;

  function toggle(key) {
    onChange(hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={ICON_BUTTON_CLASS}
        title={`Column settings (${visibleCount}/${columns.length})`}
      >
        <Columns3 size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl ring-1 ring-blue-500/10 animate-slideDown">
          <div className="flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-[14px] font-bold">
              <Columns3 size={16} /> Column Settings
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              {visibleCount}/{columns.length}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 border-b border-slate-100 bg-blue-50/60 px-4 py-2.5 text-[13px] font-semibold text-blue-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-600"
              checked={allVisible}
              ref={(el) => {
                if (el) el.indeterminate = !allVisible && visibleCount > 0;
              }}
              onChange={() =>
                onChange(allVisible ? [...new Set([...hidden, ...columns.map((c) => c.key)])] : hidden.filter((k) => !columns.some((c) => c.key === k)))
              }
            />
            Select all
          </label>
          <div className="max-h-72 overflow-y-auto p-2">
            {columns.map((col) => {
              const checked = !hidden.includes(col.key);
              return (
                <label
                  key={col.key}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors hover:bg-blue-50 ${checked ? "font-medium text-slate-800" : "text-slate-400"}`}
                >
                  <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={checked} onChange={() => toggle(col.key)} />
                  {col.label ?? col.key}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
