export const RAKE_STATUS_CANCELLED = 50;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function asResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function toTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getDayWindow(dateValue) {
  const [year, month, day] = String(dateValue || "").split("-").map(Number);
  const start = year && month && day ? new Date(year, month - 1, day) : new Date();
  start.setHours(0, 0, 0, 0);
  return { start: start.getTime(), end: start.getTime() + DAY_MS };
}

function isWithinDay(timestamp, window) {
  return timestamp != null && timestamp >= window.start && timestamp < window.end;
}

function formatHours(hours) {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatQuantity(value) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function formatClockTime(value) {
  const timestamp = toTimestamp(value);
  if (timestamp == null) return "-";
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}

function activeRakes(rakes) {
  return rakes.filter((rake) => Number(rake.status) !== RAKE_STATUS_CANCELLED);
}

function activeLoadings(loadings) {
  return loadings.filter((loading) => !loading.is_disabled);
}

export function buildMetricValues({ rakes = [], loadings = [], delays = [] }, window) {
  const liveLoadings = activeLoadings(loadings);

  const received = activeRakes(rakes).filter((rake) =>
    isWithinDay(toTimestamp(rake.offertime), window),
  ).length;

  const completedToday = liveLoadings.filter((loading) =>
    isWithinDay(toTimestamp(loading.completion_time), window),
  );

  const underLoading = liveLoadings.filter((loading) => {
    const placedAt = toTimestamp(loading.placement_time);
    const completedAt = toTimestamp(loading.completion_time);
    if (placedAt == null || placedAt >= window.end) return false;
    return completedAt == null || completedAt >= window.end;
  }).length;

  const loadAdjustments = completedToday.filter(
    (loading) => toNumber(loading.overloaded_wagons) > 0 || toNumber(loading.weight_removed) > 0,
  ).length;

  const demurrageMinutes = delays
    .filter((delay) => isWithinDay(toTimestamp(delay.delay_start_time), window))
    .reduce((sum, delay) => {
      if (delay.duration != null) return sum + toNumber(delay.duration);
      const start = toTimestamp(delay.delay_start_time);
      const end = toTimestamp(delay.delay_end_time);
      return start != null && end != null && end > start ? sum + (end - start) / 60000 : sum;
    }, 0);

  const grossLoadingHours = completedToday.reduce((sum, loading) => {
    const placedAt = toTimestamp(loading.placement_time);
    const completedAt = toTimestamp(loading.completion_time);
    return placedAt != null && completedAt > placedAt
      ? sum + (completedAt - placedAt) / HOUR_MS
      : sum;
  }, 0);

  const dispatchQty = liveLoadings
    .filter((loading) => isWithinDay(toTimestamp(loading.clearance_time), window))
    .reduce((sum, loading) => sum + toNumber(loading.tonnage), 0);

  return {
    Received: String(received),
    Loaded: String(completedToday.length),
    "Under Loading": String(underLoading),
    "Load adjustment": String(loadAdjustments),
    "Demurraged Hours": formatHours(demurrageMinutes / 60),
    "Gross Loading Hours": formatHours(grossLoadingHours),
    "Dispatch Qty": formatQuantity(dispatchQty),
  };
}

function toGridHour(timestamp, window) {
  return Math.min(Math.max((timestamp - window.start) / HOUR_MS, 0), 24);
}

function slugify(value) {
  return String(value || "unassigned")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function isActiveSiding(siding) {
  return siding.status !== false && siding.status !== 0;
}

export function buildDispatchGrid(
  { rakes = [], loadings = [], delays = [], sidings: masterSidings = [] },
  window,
  now = Date.now(),
) {
  const openEnd = Math.min(now, window.end);
  const rakeByNumber = new Map(
    rakes.filter((rake) => rake.rake_number).map((rake) => [String(rake.rake_number), rake]),
  );
  const rakeById = new Map(rakes.map((rake) => [rake.id, rake]));
  const masterSidingById = new Map(masterSidings.map((siding) => [siding.id, siding]));
  const sidingNames = new Map();
  const routeMap = new Map();

  function sidingKeyFor(sidingId, sidingName) {
    return sidingId != null && sidingId !== ""
      ? `siding-${sidingId}`
      : `siding-${slugify(sidingName || "Unassigned")}`;
  }

  function registerSiding(sidingId, sidingName) {
    const key = sidingKeyFor(sidingId, sidingName);
    if (!sidingNames.has(key)) {
      const master = masterSidingById.get(sidingId);
      sidingNames.set(key, master?.siding_code || sidingName || "Unassigned");
    }
    return key;
  }

  function ensureRoute(sidingId, sidingName, routeName, wagonType) {
    const sidingKey = registerSiding(sidingId, sidingName);
    const routeLabel = routeName || "Unassigned";
    const routeId = `route-${sidingKey}-${slugify(routeLabel)}`;
    if (!routeMap.has(routeId)) {
      routeMap.set(routeId, {
        sidingId: sidingKey,
        routeId,
        routeName: routeLabel,
        wagonTypes: new Set(),
        rakes: new Set(),
      });
    }
    const entry = routeMap.get(routeId);
    if (wagonType) entry.wagonTypes.add(wagonType);
    return entry;
  }

  masterSidings
    .filter(isActiveSiding)
    .forEach((siding) => registerSiding(siding.id, siding.siding_code || siding.siding_description));

  const events = [];

  function pushEvent(routeArgs, id, startTs, endTs, status, label) {
    if (startTs == null || endTs == null || endTs <= window.start || startTs >= window.end) return;
    const start = toGridHour(startTs, window);
    const end = toGridHour(endTs, window);
    if (end <= start) return;
    const entry = ensureRoute(...routeArgs);
    entry.rakes.add(label);
    events.push({ id, siding: entry.sidingId, route: entry.routeId, start, end, status, label });
  }

  activeRakes(rakes)
    .filter((rake) => isWithinDay(toTimestamp(rake.offertime), window))
    .forEach((rake) => {
      const entry = ensureRoute(rake.siding, rake.siding_name, rake.route_name, rake.wagontype_name);
      if (rake.rake_number) entry.rakes.add(rake.rake_number);
    });

  activeLoadings(loadings).forEach((loading) => {
    const placedAt = toTimestamp(loading.placement_time);
    if (placedAt == null || placedAt >= window.end) return;
    const completedAt = toTimestamp(loading.completion_time);
    const rake = rakeById.get(loading.rake);
    pushEvent(
      [
        rake?.siding,
        loading.siding_name || rake?.siding_name,
        loading.route_name || rake?.route_name,
        loading.wagontype_name || rake?.wagontype_name,
      ],
      `loading-${loading.id}`,
      placedAt,
      completedAt ?? openEnd,
      completedAt != null && completedAt <= openEnd ? "completed" : "loading",
      loading.rake_number || rake?.rake_number || `LD-${loading.id}`,
    );
  });

  delays.forEach((delay) => {
    const startedAt = toTimestamp(delay.delay_start_time);
    if (startedAt == null || startedAt >= window.end) return;
    const rake = rakeByNumber.get(String(delay.rake || ""));
    if (!rake) return;
    pushEvent(
      [rake.siding, rake.siding_name, rake.route_name, rake.wagontype_name],
      `delay-${delay.id}`,
      startedAt,
      toTimestamp(delay.delay_end_time) ?? openEnd,
      "demurrage",
      delay.rake || delay.log_id || `DL-${delay.id}`,
    );
  });

  const sidings = new Map(
    [...sidingNames].map(([key, name]) => [
      key,
      { id: key, name: String(name).toUpperCase(), type: "siding", count: 0, routes: [] },
    ]),
  );
  routeMap.forEach((entry) => {
    const siding = sidings.get(entry.sidingId);
    const wagonTypes = [...entry.wagonTypes];
    siding.count += entry.rakes.size;
    siding.routes.push({
      id: entry.routeId,
      name: entry.routeName,
      type: "route",
      code: wagonTypes.length === 1 ? wagonTypes[0] : wagonTypes.length > 1 ? "MIXED" : "-",
      count: entry.rakes.size,
    });
    if (events.some((event) => event.route === entry.routeId && event.status === "demurrage")) {
      siding.alert = "HIGH ALERT";
    }
  });

  const hierarchy = [...sidings.values()]
    .map((siding) => ({
      ...siding,
      routes: siding.routes.length
        ? siding.routes.sort((a, b) => a.name.localeCompare(b.name))
        : [{ id: `route-${siding.id}-none`, name: "No rake activity", type: "route", code: "-", count: 0 }],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { hierarchy, events };
}

export function buildUpcomingRakeRows({ rakes = [], loadings = [] }) {
  const placedRakeIds = new Set(
    activeLoadings(loadings)
      .filter((loading) => loading.placement_time)
      .map((loading) => loading.rake),
  );

  return activeRakes(rakes)
    .filter((rake) => !placedRakeIds.has(rake.id))
    .sort((a, b) => (toTimestamp(a.offertime) ?? 0) - (toTimestamp(b.offertime) ?? 0))
    .map((rake, index) => ({
      sno: index + 1,
      rakeId: rake.id,
      rakeNumber: rake.rake_number || "-",
      oreType: rake.oretype_name || "-",
      siding: rake.siding_name || "-",
      destination: rake.destination_name || "-",
      placementTime: formatClockTime(rake.offertime),
    }));
}
