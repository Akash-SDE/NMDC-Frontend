import { useState } from "react";

/**
 * Persisted show/hide state for table columns.
 * `columns` must be in header order ({ key, label, type }); "none" columns and `pinned` keys can't be hidden.
 * `css` hides hidden columns by position for tables rendered with data-colset={storageKey}, so
 * tables with hand-written cells (inline form rows, filter rows) don't need per-cell conditions.
 */
export function useColumnVisibility(storageKey, columns, { pinned = [], onHide } = {}) {
  const [hidden, setHiddenState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) ?? [];
    } catch {
      return [];
    }
  });

  function setHidden(next) {
    const added = next.filter((key) => !hidden.includes(key));
    if (added.length) onHide?.(added);
    setHiddenState(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  const hideable = columns.filter((c) => c.type !== "none" && !pinned.includes(c.key));
  const css = columns
    .map((c, i) =>
      hidden.includes(c.key) && hideable.includes(c)
        ? `[data-colset="${storageKey}"] tr > :nth-child(${i + 1}){display:none}`
        : "",
    )
    .join("");

  return {
    hidden,
    setHidden,
    isVisible: (key) => !hidden.includes(key),
    css,
    menuProps: { columns: hideable, hidden, onChange: setHidden },
  };
}
