import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCustomers } from "../../../services/customerService";
import { fetchDestinations } from "../../../services/destinationService";
import { fetchOreTypes } from "../../../services/oreTypeService";
import { createRake, listRakes, updateRake } from "../../../services/rakeManagementService";
import { fetchRoutes } from "../../../services/routeService";
import { fetchSidings } from "../../../services/sidingService";
import { fetchWagonTypes } from "../../../services/wagonTypeService";
import { listEDemands } from "../../../services/edemandService";
import { quickCreateMasterData } from "../utils/masterDataQuickCreate";
import { quickCreateFNote } from "../utils/fNoteQuickCreate";

const RAKE_STATUS_DRAFT = 5;
const RAKE_STATUS_CANCELLED = 50;

const emptyLookupOptions = {
  sidings: [],
  routes: [],
  oreTypes: [],
  customers: [],
  destinations: [],
  wagonTypes: [],
  fNotes: [],
};

function asResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function toLookupOptions(records, getLabel) {
  return records
    .filter((record) => record?.id != null)
    .map((record) => ({
      id: record.id,
      label: getLabel(record) || String(record.id),
    }));
}

function toRakeId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useOfferedRakes() {
  const [uiRows, setUiRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("sno");
  const [sortOrder, setSortOrder] = useState("asc");
  const [saving, setSaving] = useState(false);
  const [lookupOptions, setLookupOptions] = useState(emptyLookupOptions);

  const fetchRakes = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setStatus("loading");
        setError(null);
      }

      const response = await listRakes({ page_size: 1000 });
      const results = asResults(response);

      const normalizedRows = results.map((item, index) => ({
        sno: index + 1,
        rakeId: item.id,
        rakeNumber: item.rake_number,
        noOfWagons: item.wagoncount,
        wagonSupply: item.wagoncount,
        wagonType: item.wagontype_name,
        wagonTypeId: item.wagontype,
        siding: item.siding_name,
        sidingId: item.siding,
        route: item.route_name,
        routeId: item.route,
        oreType: item.oretype_name,
        oreTypeId: item.oretype,
        customer: item.customer_name,
        customerId: item.customer,
        destination: item.destination_name,
        destinationId: item.destination,
        status: item.status,
        statusDescription: item.status_description,
        fNote: item.fnote || "-",
        offeredFor: item.offeredfor,
        adjustOfferFor: item.offeredfor || "-",
        offerTime: item.offertime,
        overloadWagons: item.overloadwagons,
        weightRemoved: item.weightremoved,
        createdOn: item.created_on,
        modifiedOn: item.modified_on,
        isDisabled: Number(item.status) === RAKE_STATUS_CANCELLED,
      }));

      setUiRows(normalizedRows);
      setStatus("success");
    } catch (err) {
      console.error("Failed to fetch rake management data:", err);

      setError(err.message || "Failed to load rakes");

      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    fetchRakes();
  }, [fetchRakes]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookupOptions() {
      try {
        const [sidings, routes, oreTypes, customers, destinations, wagonTypes, demands] =
          await Promise.all([
            fetchSidings({ page_size: 1000 }),
            fetchRoutes({ page_size: 1000 }),
            fetchOreTypes({ page_size: 1000 }),
            fetchCustomers({ page_size: 1000 }),
            fetchDestinations({ page_size: 1000 }),
            fetchWagonTypes({ page_size: 1000 }),
            listEDemands().catch(() => []),
          ]);

        if (cancelled) return;

        setLookupOptions({
          sidings: toLookupOptions(
            asResults(sidings),
            (item) => item.siding_code || item.siding_description,
          ),
          routes: toLookupOptions(
            asResults(routes),
            (item) => item.route_code || (item.route_no != null ? String(item.route_no) : ""),
          ),
          oreTypes: toLookupOptions(asResults(oreTypes), (item) => item.ore_type),
          customers: toLookupOptions(asResults(customers), (item) => item.customer_name),
          destinations: toLookupOptions(
            asResults(destinations),
            (item) => item.destination_name,
          ),
          wagonTypes: toLookupOptions(asResults(wagonTypes), (item) => item.wagon_type),
          fNotes: [...new Set(demands.map((demand) => demand.fNote).filter(Boolean))].sort(),
        });
      } catch (err) {
        console.error("Failed to load rake form options:", err);
      }
    }

    loadLookupOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const addLookupOption = useCallback((lookupKey, option) => {
    setLookupOptions((prev) => {
      const exists = prev[lookupKey]?.some((item) => String(item.id) === String(option.id));
      if (exists) return prev;
      const next = [...(prev[lookupKey] ?? []), option].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
      return { ...prev, [lookupKey]: next };
    });
  }, []);

  const createFNoteOption = useCallback(
    async (label, formContext = {}) => {
      const trimmed = String(label ?? "").trim();
      if (!trimmed) {
        throw new Error("Enter an F-Note value before creating.");
      }

      const existing = lookupOptions.fNotes?.find(
        (note) => note.toLowerCase() === trimmed.toLowerCase(),
      );
      if (existing) {
        return { id: existing, label: existing };
      }

      const fNote = await quickCreateFNote(trimmed, {
        customer: formContext.customer,
        destination: formContext.destination,
        oreType: formContext.oreType,
      });

      setLookupOptions((prev) => ({
        ...prev,
        fNotes: [...new Set([...(prev.fNotes ?? []), fNote])].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" }),
        ),
      }));

      return { id: fNote, label: fNote };
    },
    [lookupOptions.fNotes],
  );

  const createLookupOption = useCallback(
    async (lookupKey, label) => {
      const trimmed = String(label ?? "").trim();
      if (!trimmed) {
        throw new Error("Enter a value before creating master data.");
      }

      const existing = lookupOptions[lookupKey]?.find(
        (item) => item.label.toLowerCase() === trimmed.toLowerCase(),
      );
      if (existing) return existing;

      const created = await quickCreateMasterData(lookupKey, trimmed);
      const option = { id: created.id, label: created.label };
      addLookupOption(lookupKey, option);
      return option;
    },
    [lookupOptions, addLookupOption],
  );

  const createOfferedRake = useCallback(
    async (form, { reload = true } = {}) => {
      const payload = {
        rake_number: String(form.rakeNumber || "").trim(),
        siding: toRakeId(form.siding),
        route: toRakeId(form.route),
        oretype: toRakeId(form.oreType),
        customer: toRakeId(form.customer),
        destination: toRakeId(form.destination),
        wagontype: toRakeId(form.wagonType),
        wagoncount: toRakeId(form.noOfWagons),
        fnote: String(form.fNote || "").trim() || null,
        offertime: form.offerTime ? new Date(form.offerTime).toISOString() : null,
        status: RAKE_STATUS_DRAFT,
      };

      const missingId = ["siding", "route", "oretype", "customer", "destination", "wagontype"].find(
        (field) => payload[field] == null,
      );
      if (missingId || payload.wagoncount == null || !payload.rake_number || !payload.offertime) {
        throw new Error("Complete the rake details before adding.");
      }

      if (reload) setSaving(true);
      try {
        await createRake(payload);
        if (reload) await fetchRakes({ silent: true });
      } finally {
        if (reload) setSaving(false);
      }
    },
    [fetchRakes],
  );

  const updateOfferedRake = useCallback(
    async (rakeId, payload) => {
      setSaving(true);
      try {
        await updateRake(rakeId, payload);
        await fetchRakes({ silent: true });
      } finally {
        setSaving(false);
      }
    },
    [fetchRakes],
  );

  const setRakeDisabled = useCallback(
    async (rakeId, disabled) => {
      await updateOfferedRake(rakeId, {
        status: disabled ? RAKE_STATUS_CANCELLED : RAKE_STATUS_DRAFT,
      });
    },
    [updateOfferedRake],
  );

  const sortedRows = useMemo(() => {
    let rows = [...uiRows];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      rows = rows.filter((row) =>
        [
          row.rakeId,
          row.rakeNumber,
          row.siding,
          row.route,
          row.oreType,
          row.customer,
          row.destination,
          row.wagonType,
          row.statusDescription,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(searchValue)
        )
      );
    }

    rows.sort((a, b) => {
      const firstNumber = Number(a[sortBy]);
      const secondNumber = Number(b[sortBy]);
      if (
        String(a[sortBy] ?? "").trim() !== "" &&
        Number.isFinite(firstNumber) &&
        Number.isFinite(secondNumber)
      ) {
        return sortOrder === "asc" ? firstNumber - secondNumber : secondNumber - firstNumber;
      }

      const first = String(a[sortBy] ?? "").toLowerCase();
      const second = String(b[sortBy] ?? "").toLowerCase();

      if (first < second) return sortOrder === "asc" ? -1 : 1;
      if (first > second) return sortOrder === "asc" ? 1 : -1;

      return 0;
    });

    return rows;
  }, [uiRows, search, sortBy, sortOrder]);

  const handleSort = useCallback((column) => {
    setSortBy((currentColumn) => {
      if (currentColumn === column) {
        setSortOrder((currentOrder) =>
          currentOrder === "asc" ? "desc" : "asc"
        );
        return currentColumn;
      }

      setSortOrder("asc");
      return column;
    });
  }, []);

  const upsertUiRow = useCallback(async (newRow) => {
    setUiRows((prev) => [...prev, newRow]);
  }, []);

  const updateUiRows = useCallback(async (updater) => {
    setUiRows((prev) => updater(prev));
  }, []);

  const getByRakeNumber = useCallback(
    (rakeNumber) =>
      uiRows.find((row) => row.rakeNumber === rakeNumber) || null,
    [uiRows]
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
    saving,
    lookupOptions,
    createLookupOption,
    createFNoteOption,
    reload: fetchRakes,
    createOfferedRake,
    updateOfferedRake,
    setRakeDisabled,

    upsertUiRow,
    updateUiRows,
    getByRakeNumber,
  };
}
