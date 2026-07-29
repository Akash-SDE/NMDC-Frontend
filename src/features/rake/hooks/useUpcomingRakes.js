import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { upcomingService } from "../../../services/operational";
import {
  countReadyUpcomingRows,
  createInitialUpcomingRows,
  createUpcomingRow,
  isUpcomingRowReady,
} from "../constants/rakeConstants";
import { canonicalToUiRow, uiToCanonicalRake } from "../utils/rakeMappers";

export function useUpcomingRakes({ uiRows, upsertUiRow }) {
  const [upcomingRows, setUpcomingRows] = useState(createInitialUpcomingRows);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const persistDraftsRef = useRef(false);

  useEffect(() => {
    upcomingService.list().then((drafts) => {
      if (drafts?.length) setUpcomingRows(drafts);
      persistDraftsRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!persistDraftsRef.current) return;

    const timeoutId = window.setTimeout(() => {
      upcomingService.save(upcomingRows);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [upcomingRows]);

  const stats = useMemo(() => {
    const readyCount = countReadyUpcomingRows(upcomingRows);
    return {
      total: upcomingRows.length,
      readyCount,
      incompleteCount: upcomingRows.length - readyCount,
    };
  }, [upcomingRows]);

  const updateUpcomingRow = useCallback((rowId, field, value) => {
    setUpcomingRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
    setMessage("");
  }, []);

  const addUpcomingRow = useCallback(() => {
    setUpcomingRows((prev) => [...prev, createUpcomingRow(prev.length)]);
    setMessage("");
  }, []);

  const removeUpcomingRow = useCallback((rowId) => {
    setUpcomingRows((prev) => {
      const next = prev.filter((row) => row.id !== rowId);
      return next.length > 0 ? next : [createUpcomingRow(0)];
    });
    setMessage("");
  }, []);

  const clearUpcomingRows = useCallback(() => {
    const cleared = createInitialUpcomingRows();
    setUpcomingRows(cleared);
    setMessage("Draft rows cleared.");
    setMessageTone("info");
    upcomingService.save(cleared);
  }, []);

  const saveUpcomingToOffered = useCallback(async () => {
    const readyRows = upcomingRows.filter(isUpcomingRowReady);

    if (readyRows.length === 0) {
      setMessage(
        "Complete ore type, siding, destination, placement time, wagon type, route, customer, and wagon count for at least one row.",
      );
      setMessageTone("error");
      return;
    }

    const nextSno =
      uiRows.length > 0
        ? Math.max(...uiRows.map((row) => Number(row.sno) || 0)) + 1
        : 1;
    const maxRakeIdNumber = uiRows.reduce((max, row) => {
      const matchedDigits = String(row.rakeId || "").match(/(\d+)$/);
      const parsed = matchedDigits ? Number(matchedDigits[1]) : 0;
      return Math.max(max, Number.isNaN(parsed) ? 0 : parsed);
    }, 0);
    const year = new Date().getFullYear();

    for (let index = 0; index < readyRows.length; index += 1) {
      const row = readyRows[index];
      const sequence = nextSno + index;
      const rakeIdNumber = maxRakeIdNumber + index + 1;
      const offeredTime = formatDateTimeForTable(row.placementTime);
      const wagonCount = Number(row.wagonCount) || 58;

      const canonical = uiToCanonicalRake({
        sno: sequence,
        rakeId: `RK-${String(rakeIdNumber).padStart(4, "0")}`,
        rakeNumber: `R-${year}-${String(sequence).padStart(3, "0")}`,
        wagonSupply: wagonCount,
        wagonType: row.wagonType,
        siding: row.siding,
        route: row.route,
        oreType: row.oreType,
        customer: row.customer,
        destination: row.destination,
        fNote: "-",
        placementTime: offeredTime,
        offerTime: offeredTime,
        adjustOfferFor: "-",
        adjustedOfferTime: "-",
        isDisabled: false,
      });
      await upsertUiRow(canonicalToUiRow(canonical));
    }

    const cleared = createInitialUpcomingRows();
    setUpcomingRows(cleared);
    await upcomingService.save(cleared);
    setMessage(`${readyRows.length} upcoming rake(s) moved to the offered list.`);
    setMessageTone("success");
  }, [upcomingRows, uiRows, upsertUiRow]);

  return {
    upcomingRows,
    message,
    messageTone,
    stats,
    updateUpcomingRow,
    addUpcomingRow,
    removeUpcomingRow,
    clearUpcomingRows,
    saveUpcomingToOffered,
  };
}
