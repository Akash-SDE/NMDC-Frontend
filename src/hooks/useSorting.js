import { useCallback, useMemo, useState } from "react";

export function compareValues(a, b, order = "asc") {
  const left = typeof a === "string" ? a.toLowerCase() : a;
  const right = typeof b === "string" ? b.toLowerCase() : b;
  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

export function useSorting(initialField = null, initialOrder = "asc") {
  const [sortBy, setSortBy] = useState(initialField);
  const [sortOrder, setSortOrder] = useState(initialOrder);

  const handleSort = useCallback((field) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return prevField;
      }
      setSortOrder("asc");
      return field;
    });
  }, []);

  const sortItems = useCallback(
    (items, getComparableValue) => {
      if (!sortBy) return items;
      return [...items].sort((a, b) => {
        const aVal = getComparableValue(a, sortBy);
        const bVal = getComparableValue(b, sortBy);
        return compareValues(aVal, bVal, sortOrder);
      });
    },
    [sortBy, sortOrder],
  );

  return useMemo(
    () => ({ sortBy, sortOrder, handleSort, sortItems, setSortBy, setSortOrder }),
    [sortBy, sortOrder, handleSort, sortItems],
  );
}
