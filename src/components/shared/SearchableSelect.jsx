import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export default function SearchableSelect({
  value = "",
  onChange,
  options = [],
  placeholder = "Select",
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelStyle, setPanelStyle] = useState(null);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? options.filter((option) => option.toLowerCase().includes(term)) : options;
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (![wrapperRef, panelRef].some((ref) => ref.current?.contains(event.target))) setIsOpen(false);
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
    if (disabled || isOpen) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPanelStyle({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 200) });
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function select(nextValue) {
    onChange?.(nextValue);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => Math.min(Math.max(index + step, 0), filtered.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) select(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={open}
        className={`${className} flex w-full items-center justify-between gap-1 text-left ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${value ? "" : "text-slate-400"}`}>{value || placeholder}</span>
        <span className="flex shrink-0 items-center gap-0.5 text-slate-400">
          {value && !disabled ? (
            <X
              size={13}
              className="hover:text-rose-500"
              onClick={(event) => {
                event.stopPropagation();
                select("");
              }}
            />
          ) : null}
          <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {isOpen && panelStyle ? (
        <div
          ref={panelRef}
          style={panelStyle}
          className="fixed z-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
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
              placeholder="Search..."
              className="w-full bg-transparent text-[12px] text-slate-700 outline-none"
            />
          </div>
          <div role="listbox" className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-[12px] text-slate-400">No matches</p>
            ) : (
              filtered.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(option)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] ${
                    index === activeIndex ? "bg-slate-100" : ""
                  } ${option === value ? "font-semibold text-slate-800" : "text-slate-700"}`}
                >
                  <span className="truncate">{option}</span>
                  {option === value ? <Check size={14} className="text-blue-600" /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
