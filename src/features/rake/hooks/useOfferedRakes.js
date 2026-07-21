import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parseDateTimeToTimestamp } from "../../../utils/dateUtils";
import { useSearch } from "../../../hooks/useFilters";
import { useSorting } from "../../../hooks/useSorting";
import { fetchRakes, saveRake } from "../../../store/slices/rakeSlice";
import { uiRowsFromCanonicalList, uiToCanonicalRake } from "../utils/rakeMappers";

export function useOfferedRakes() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.rakes);
  const { search, setSearch, filterBySearch } = useSearch();
  const { sortBy, sortOrder, handleSort, sortItems } = useSorting("sno");

  useEffect(() => {
    dispatch(fetchRakes());
  }, [dispatch]);

  const uiRows = useMemo(() => uiRowsFromCanonicalList(items), [items]);

  const filteredRows = useMemo(
    () =>
      filterBySearch(uiRows, (row) =>
        Object.values(row).map((value) => String(value ?? "")),
      ),
    [uiRows, filterBySearch],
  );

  const sortedRows = useMemo(() => {
    return sortItems(filteredRows, (row, field) => {
      if (field === "status") return row.isDisabled ? "disabled" : "enabled";
      if (field === "offerTime") return parseDateTimeToTimestamp(row.offerTime);
      if (field === "wagonSupply" || field === "sno") {
        const parsed = Number(row[field]);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return String(row[field] ?? "").toLowerCase();
    });
  }, [filteredRows, sortItems]);

  const persistRows = useCallback(
    async (nextUiRows) => {
      const canonicalRows = nextUiRows.map(uiToCanonicalRake);
      await Promise.all(canonicalRows.map((row) => dispatch(saveRake(row)).unwrap()));
    },
    [dispatch],
  );

  const upsertUiRow = useCallback(
    async (uiRow) => {
      await dispatch(saveRake(uiToCanonicalRake(uiRow))).unwrap();
    },
    [dispatch],
  );

  const updateUiRows = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(uiRows) : updater;
      return persistRows(next);
    },
    [persistRows, uiRows],
  );

  const getByRakeId = useCallback(
    (rakeId) => uiRows.find((row) => row.rakeId === rakeId) ?? null,
    [uiRows],
  );

  const getByRakeNumber = useCallback(
    (rakeNumber) => uiRows.find((row) => row.rakeNumber === rakeNumber) ?? null,
    [uiRows],
  );

  return {
    uiRows,
    sortedRows,
    search,
    setSearch,
    sortBy,
    sortOrder,
    handleSort,
    status,
    error,
    reload: () => dispatch(fetchRakes()),
    upsertUiRow,
    updateUiRows,
    getByRakeId,
    getByRakeNumber,
  };
}
