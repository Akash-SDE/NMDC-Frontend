import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Search } from "lucide-react";

/**
 * Searchable select for master-data lookups ({ id, label }).
 * Users can pick existing rows or create a new master-data entry from typed text.
 */
export default function CreatableLookupSelect({
  value = "",
  onChange,
  options = [],
  placeholder = "Select or type…",
  className = "",
  disabled = false,
  onCreateOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelStyle, setPanelStyle] = useState(null);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.id) === String(value)),
    [options, value],
  );

  const displayValue = selectedOption?.label ?? "";

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = term
      ? options.filter((option) => option.label.toLowerCase().includes(term))
      : options;
    return list;
  }, [options, query]);

  const trimmedQuery = query.trim();
  const exactMatch = useMemo(() => {
    if (!trimmedQuery) return null;
    return options.find((option) => option.label.toLowerCase() === trimmedQuery.toLowerCase()) ?? null;
  }, [options, trimmedQuery]);

  const showCreate = Boolean(
    onCreateOption && trimmedQuery && !exactMatch,
  );

  const listCount = filtered.length + (showCreate ? 1 : 0);

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (![wrapperRef, panelRef].some((ref) => ref.current?.contains(event.target))) {
        setIsOpen(false);
      }
    };
    const closeOnScroll = (event) => {
      if (!panelRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [isOpen]);

  function open() {
    if (disabled || creating || isOpen) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPanelStyle({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 220) });
    setQuery(selectedOption?.label ?? "");
    setActiveIndex(0);
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function selectId(nextId) {
    onChange?.(nextId === "" || nextId == null ? "" : String(nextId));
    setIsOpen(false);
    setQuery("");
  }

  async function handleCreate() {
    if (!onCreateOption || !trimmedQuery || creating) return;
    setCreating(true);
    try {
      const created = await onCreateOption(trimmedQuery);
      if (created?.id != null) {
        selectId(created.id);
      }
    } catch (err) {
      console.error("Master data quick create failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Could not create master data.";
      window.alert(message);
    } finally {
      setCreating(false);
    }
  }

  function resolveActiveAction() {
    if (showCreate && activeIndex === 0) return "create";
    const optionIndex = showCreate ? activeIndex - 1 : activeIndex;
    return filtered[optionIndex] ?? null;
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => Math.min(Math.max(index + step, 0), Math.max(listCount - 1, 0)));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const action = resolveActiveAction();
      if (action === "create") {
        handleCreate();
        return;
      }
      if (action?.id != null) {
        selectId(action.id);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative min-w-[8rem]">
      <button
        type="button"
        disabled={disabled || creating}
        onClick={open}
        className={`${className} flex w-full items-center justify-between gap-1 text-left ${
          disabled || creating ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${displayValue ? "" : "text-slate-400"}`}>
          {creating ? "Creating…" : displayValue || placeholder}
        </span>
        <span className="flex shrink-0 items-center text-slate-400">
          {creating ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />}
        </span>
      </button>

      {isOpen && panelStyle ? (
        <div
          ref={panelRef}
          style={panelStyle}
          className="fixed z-[200] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search or type new…"
              className="w-full bg-transparent text-[12px] text-slate-700 outline-none"
            />
          </div>
          <div role="listbox" className="max-h-56 overflow-y-auto">
            {showCreate ? (
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(0)}
                onClick={handleCreate}
                disabled={creating}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-emerald-700 ${
                  activeIndex === 0 ? "bg-emerald-50" : "hover:bg-slate-50"
                }`}
              >
                <Plus size={14} />
                Add &quot;{trimmedQuery}&quot;
              </button>
            ) : null}
            {filtered.length === 0 && !showCreate ? (
              <p className="px-3 py-2.5 text-[12px] text-slate-400">No matches</p>
            ) : (
              filtered.map((option, index) => {
                const rowIndex = showCreate ? index + 1 : index;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={String(option.id) === String(value)}
                    onMouseEnter={() => setActiveIndex(rowIndex)}
                    onClick={() => selectId(option.id)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] ${
                      rowIndex === activeIndex ? "bg-slate-100" : ""
                    } ${String(option.id) === String(value) ? "font-semibold text-slate-800" : "text-slate-700"}`}
                  >
                    <span className="truncate">{option.label}</span>
                    {String(option.id) === String(value) ? <Check size={14} className="text-blue-600" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
