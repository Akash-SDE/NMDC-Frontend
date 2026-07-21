import { useCallback, useMemo, useState } from "react";

export function useFilters(initialFilters = {}) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const updateDraft = useCallback((key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...draftFilters });
  }, [draftFilters]);

  const clearFilters = useCallback(() => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const filterItems = useCallback(
    (items, predicate) => {
      if (!predicate) return items;
      return items.filter((item) => predicate(item, appliedFilters));
    },
    [appliedFilters],
  );

  return useMemo(
    () => ({
      draftFilters,
      appliedFilters,
      updateDraft,
      applyFilters,
      clearFilters,
      setDraftFilters,
      filterItems,
    }),
    [
      draftFilters,
      appliedFilters,
      updateDraft,
      applyFilters,
      clearFilters,
      filterItems,
    ],
  );
}

export function useSearch(initial = "") {
  const [search, setSearch] = useState(initial);

  const filterBySearch = useCallback(
    (items, fields) => {
      if (!search.trim()) return items;
      const q = search.toLowerCase();
      return items.filter((item) =>
        fields(item).join(" ").toLowerCase().includes(q),
      );
    },
    [search],
  );

  return { search, setSearch, filterBySearch };
}
