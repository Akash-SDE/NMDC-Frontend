import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

/**
 * @typedef {Object} RowAction
 * @property {string} id
 * @property {string} label
 * @property {() => void} onClick
 * @property {boolean} [disabled]
 * @property {boolean} [hidden]
 * @property {"default"|"danger"|"success"} [tone]
 * @property {React.ReactNode} [icon]
 */

/**
 * Compact row actions: optional primary control + overflow menu for the rest.
 * Menu renders in a portal so it is not clipped by sticky table cells / row stacking.
 */
export default function RowActionsMenu({
  primary = null,
  items = [],
  menuLabel = "More actions",
  align = "left",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const listId = useId();
  const menuItems = items.filter((item) => item && !item.hidden);

  function updateMenuPosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const minWidth = 176;
    const gutter = 4;
    let left = align === "right" ? rect.right - minWidth : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - minWidth - 8));
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + gutter,
      left,
      minWidth,
      zIndex: 10000,
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
  }, [open, align]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      const target = event.target;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    function onReposition() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, align]);

  useEffect(() => {
    const cell = rootRef.current?.closest("td");
    if (!cell) return undefined;
    if (open) {
      cell.classList.add("row-actions-menu-open");
      return () => cell.classList.remove("row-actions-menu-open");
    }
    cell.classList.remove("row-actions-menu-open");
    return undefined;
  }, [open]);

  function toneClass(tone) {
    if (tone === "danger") return "text-rose-700 hover:bg-rose-50";
    if (tone === "success") return "text-emerald-700 hover:bg-emerald-50";
    return "text-slate-700 hover:bg-slate-50";
  }

  const menuPanel =
    open && menuStyle ? (
      <div
        ref={menuRef}
        id={listId}
        role="menu"
        style={menuStyle}
        className="rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-300/40"
      >
        {menuItems.map((item) => (
          <button
            data-write={item.dataWrite !== false ? true : undefined}
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              setOpen(false);
              item.onClick();
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-40 ${toneClass(item.tone)}`}
          >
            {item.icon ? (
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-slate-500">
                {item.icon}
              </span>
            ) : null}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={`relative inline-flex items-center gap-0.5 ${className}`}>
      {primary && !primary.hidden ? (
        <button
          data-write={primary.dataWrite !== false ? true : undefined}
          type="button"
          onClick={primary.onClick}
          disabled={primary.disabled}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            primary.disabled
              ? "cursor-not-allowed text-slate-300"
              : primary.active
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
          }`}
          title={primary.label}
          aria-label={primary.label}
        >
          {primary.icon ?? (
            <span className="text-[10px] font-bold uppercase">{primary.label.slice(0, 1)}</span>
          )}
        </button>
      ) : null}

      {menuItems.length > 0 ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 ${
            open ? "border-slate-300 bg-slate-50" : ""
          }`}
          aria-label={menuLabel}
          aria-expanded={open}
          aria-controls={listId}
          title={menuLabel}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </button>
      ) : null}

      {menuPanel ? createPortal(menuPanel, document.body) : null}
    </div>
  );
}