import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { upcomingService } from "../../../services/operational";
import {
  countReadyUpcomingRows,
  createInitialUpcomingRows,
  createUpcomingRow,
  isUpcomingRowReady,
} from "../constants/rakeConstants";

function takeNextRakeNumber(used) {
  const year = new Date().getFullYear();
  const prefix = `R-${year}-`;
  let maxSeq = 0;

  for (const number of used) {
    const value = String(number || "");
    if (!value.startsWith(prefix)) continue;
    const seq = Number(value.slice(prefix.length));
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }

  let sequence = maxSeq + 1;
  let rakeNumber = `${prefix}${String(sequence).padStart(3, "0")}`;
  while (used.has(rakeNumber)) {
    sequence += 1;
    rakeNumber = `${prefix}${String(sequence).padStart(3, "0")}`;
  }
  used.add(rakeNumber);
  return rakeNumber;
}

function hasMasterDataId(value) {
  return String(value ?? "").trim() !== "" && Number.isFinite(Number(value));
}

function normalizeDraftRow(row, index = 0) {
  return {
    ...createUpcomingRow(index),
    ...row,
    id: row?.id || `upcoming-${Date.now()}-${index}`,
    oreType: row?.oreType ?? "",
    siding: row?.siding ?? "",
    destination: row?.destination ?? "",
    placementTime: row?.placementTime ?? "",
    wagonType: row?.wagonType ?? "",
    route: row?.route ?? "",
    customer: row?.customer ?? "",
    wagonCount: row?.wagonCount ?? "",
  };
}

export function useUpcomingRakes({ uiRows, createOfferedRake, reloadOfferedRakes }) {
  const [upcomingRows, setUpcomingRows] = useState(createInitialUpcomingRows);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [moving, setMoving] = useState(false);
  const persistDraftsRef = useRef(false);

  useEffect(() => {
    upcomingService.list().then((drafts) => {
      if (drafts?.length) {
        setUpcomingRows(drafts.map((row, index) => normalizeDraftRow(row, index)));
      }
      persistDraftsRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!persistDraftsRef.current) return;

    const timeoutId = window.setTimeout(() => {
      upcomingService.save(
        upcomingRows.map(({ id, oreType, siding, destination, placementTime, wagonType, route, customer, wagonCount }) => ({
          id,
          oreType,
          siding,
          destination,
          placementTime,
          wagonType,
          route,
          customer,
          wagonCount,
        })),
      );
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
    setUpcomingRows((prev) => prev.filter((row) => row.id !== rowId));
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

    const invalidRow = readyRows.find(
      (row) =>
        !hasMasterDataId(row.siding) ||
        !hasMasterDataId(row.route) ||
        !hasMasterDataId(row.oreType) ||
        !hasMasterDataId(row.customer) ||
        !hasMasterDataId(row.destination) ||
        !hasMasterDataId(row.wagonType) ||
        !hasMasterDataId(row.wagonCount),
    );
    if (invalidRow) {
      setMessage("Choose each value from the lists before moving a row to offered rakes.");
      setMessageTone("error");
      return;
    }

    const movedIds = [];
    const usedRakeNumbers = new Set(uiRows.map((row) => String(row.rakeNumber || "")));
    setMoving(true);
    setMessage("");

    try {
      for (const row of readyRows) {
        await createOfferedRake(
          {
            rakeNumber: takeNextRakeNumber(usedRakeNumbers),
            siding: row.siding,
            route: row.route,
            oreType: row.oreType,
            customer: row.customer,
            destination: row.destination,
            wagonType: row.wagonType,
            noOfWagons: row.wagonCount,
            fNote: "",
            offerTime: row.placementTime,
          },
          { reload: false },
        );
        movedIds.push(row.id);
      }

      setUpcomingRows((prev) => prev.filter((row) => !movedIds.includes(row.id)));
      if (typeof reloadOfferedRakes === "function") {
        await reloadOfferedRakes({ silent: true });
      }
      setMessage(`${movedIds.length} upcoming rake(s) moved to the offered list.`);
      setMessageTone("success");
    } catch (error) {
      if (movedIds.length > 0) {
        setUpcomingRows((prev) => prev.filter((row) => !movedIds.includes(row.id)));
        if (typeof reloadOfferedRakes === "function") {
          await reloadOfferedRakes({ silent: true });
        }
      }
      setMessage(
        movedIds.length > 0
          ? `${movedIds.length} rake(s) moved, then an error stopped the rest: ${error?.message || "request failed"}`
          : error?.message || "Unable to move the upcoming rake to the offered list.",
      );
      setMessageTone("error");
    } finally {
      setMoving(false);
    }
  }, [upcomingRows, uiRows, createOfferedRake, reloadOfferedRakes]);

  return {
    upcomingRows,
    message,
    messageTone,
    moving,
    stats,
    updateUpcomingRow,
    addUpcomingRow,
    removeUpcomingRow,
    clearUpcomingRows,
    saveUpcomingToOffered,
  };
}
