import {
  COCKPIT_DAILY_RAKE_TARGET,
  COCKPIT_MONTHLY_RAKE_TARGET,
  COCKPIT_PERMIT_HOURS,
} from "../constants/cockpitTargets";
import {
  buildDispatchGrid,
  buildMetricValues,
  getDayWindow,
  RAKE_STATUS_CANCELLED,
} from "./dashboardMappers";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const BAR_COLORS = ["#16a34a", "#f59e0b", "#e11d48", "#0b91cf", "#6366f1"];

function toTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function activeLoadings(loadings) {
  return loadings.filter((loading) => !loading.is_disabled);
}

function activeRakes(rakes) {
  return rakes.filter((rake) => Number(rake.status) !== RAKE_STATUS_CANCELLED);
}

function isWithinDay(timestamp, window) {
  return timestamp != null && timestamp >= window.start && timestamp < window.end;
}

function isWithinRange(timestamp, start, end) {
  return timestamp != null && timestamp >= start && timestamp < end;
}

export function getMonthWindow(dateValue) {
  const [year, month, day] = String(dateValue || "").split("-").map(Number);
  const anchor = year && month && day ? new Date(year, month - 1, day) : new Date();
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  end.setHours(0, 0, 0, 0);
  return { start: start.getTime(), end: end.getTime() };
}

function formatTimeLabel(iso, { todaySuffix = true } = {}) {
  const ts = toTimestamp(iso);
  if (ts == null) return "—";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const base = `${hh}:${mm}`;
  if (!todaySuffix) return base;
  return `${base} (Today)`;
}

function formatPlacementCell(iso) {
  const ts = toTimestamp(iso);
  if (ts == null) return { date: "—", time: "—" };
  const d = new Date(ts);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return {
    date: `${d.getDate()} ${months[d.getMonth()]}`,
    time: formatTimeLabel(iso, { todaySuffix: false }),
  };
}

function formatClockNow(now = Date.now()) {
  const d = new Date(now);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatDateLabel(now = Date.now()) {
  return new Date(now).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function gridHour(now, window) {
  return Math.min(Math.max((now - window.start) / HOUR_MS, 0), 24);
}

function estimateLoadedPct(loading, now) {
  if (toTimestamp(loading.completion_time)) return 100;
  const placed = toTimestamp(loading.placement_time);
  if (placed == null) return 0;
  const ratio = (now - placed) / (COCKPIT_PERMIT_HOURS * HOUR_MS);
  return Math.min(99, Math.max(5, Math.round(ratio * 100)));
}

function delayMinutesForRake(rakeNumber, delays, window) {
  const key = String(rakeNumber || "").trim().toLowerCase();
  if (!key) return 0;
  return delays
    .filter((delay) => String(delay.rake || "").trim().toLowerCase() === key)
    .filter((delay) => isWithinDay(toTimestamp(delay.delay_start_time), window))
    .reduce((sum, delay) => {
      if (delay.duration != null) return sum + toNumber(delay.duration);
      const start = toTimestamp(delay.delay_start_time);
      const end = toTimestamp(delay.delay_end_time);
      return start != null && end != null && end > start ? sum + (end - start) / 60000 : sum;
    }, 0);
}

function releaseStatus(loading) {
  if (toTimestamp(loading.clearance_time)) return "Released";
  if (toTimestamp(loading.completion_time)) return "Awaiting Release";
  return "Pending";
}

function remarkTone(delayMin, complete) {
  if (delayMin >= 45) return "danger";
  if (delayMin > 0) return "warn";
  return "ok";
}

function buildRemarks(loading, delayMin) {
  if (toTimestamp(loading.completion_time)) {
    return delayMin > 0
      ? `Loading completed\n• Delay ${Math.round(delayMin)} min`
      : "Loading completed\n• Normal";
  }
  if (delayMin > 0) return `Loading delayed •\n${delayMin} min logged`;
  return "Loading in progress\n• Normal";
}

function mapGridStatus(eventStatus, hasDelay) {
  if (eventStatus === "demurrage") return "demurrage";
  if (eventStatus === "completed") return "completed";
  if (hasDelay) return "delayed";
  if (eventStatus === "loading") return "loaded";
  return "idle";
}

export function buildCockpitMeta(records, dayWindow, now = Date.now()) {
  const metrics = buildMetricValues(records, dayWindow);
  const loadedToday = toNumber(metrics.Loaded);
  const ratio = COCKPIT_DAILY_RAKE_TARGET
    ? Math.round((loadedToday / COCKPIT_DAILY_RAKE_TARGET) * 1000) / 10
    : 0;

  return {
    dateLabel: formatDateLabel(now),
    time: formatClockNow(now),
    filterDate: new Date(now).toLocaleDateString("en-GB"),
    nowHour: gridHour(now, dayWindow),
    targetRatio: `${ratio}% Achieved Today`,
    user: { initials: "—", role: "Operations", unit: "Live dashboard" },
    notifications: 0,
  };
}

export function buildCockpitKpis(records, dayWindow, _monthWindow, _now = Date.now()) {
  const loadings = activeLoadings(records.loadings || []);
  const metrics = buildMetricValues(records, dayWindow);

  const loadedToday = loadings.filter((l) => isWithinDay(toTimestamp(l.completion_time), dayWindow)).length;
  const underLoading = toNumber(metrics["Under Loading"]);

  const delayedCount = loadings.filter((l) => {
    if (!isWithinDay(toTimestamp(l.placement_time), dayWindow)) return false;
    if (toTimestamp(l.completion_time)) return false;
    return delayMinutesForRake(l.rake_number, records.delays || [], dayWindow) > 0;
  }).length;

  const demurrageHours = metrics["Demurraged Hours"] ?? "0";
  const grossLoadingHours = metrics["Gross Loading Hours"] ?? "0";

  const todayProgress = COCKPIT_DAILY_RAKE_TARGET
    ? Math.round((loadedToday / COCKPIT_DAILY_RAKE_TARGET) * 100)
    : 0;

  return [
    {
      title: "Rakes Loaded (Today)",
      value: String(loadedToday),
      sub: `Target : ${COCKPIT_DAILY_RAKE_TARGET}`,
      subTone: "blue",
      progress: todayProgress,
      tone: "blue",
      icon: "loaded",
      border: "#2563eb",
      ring: "#10b981",
    },
    {
      title: "Rakes in Loading",
      value: String(underLoading),
      sub: delayedCount ? `${delayedCount} Delayed` : "On schedule",
      subTone: delayedCount ? "danger" : "muted",
      tone: "green",
      icon: "loading",
      border: "#16a34a",
    },
    {
      title: "Demurrage Hours",
      value: String(demurrageHours),
      sub: "Logged delay time today",
      subTone: toNumber(demurrageHours) > 0 ? "danger" : "muted",
      tone: toNumber(demurrageHours) > 0 ? "red" : "green",
      shape: "circle",
      icon: "delay",
      border: "#dc2626",
    },
    {
      title: "Gross Loading Hours",
      value: String(grossLoadingHours),
      sub: `SLA: ${COCKPIT_PERMIT_HOURS}.0 hrs`,
      subTone: "amber",
      tone: "amber",
      icon: "hours",
      border: "#d97706",
    },
  ];
}

export function buildCockpitFooterMetrics(records, dayWindow) {
  const loadings = activeLoadings(records.loadings || []);
  const adjustments = loadings.filter(
    (l) =>
      isWithinDay(toTimestamp(l.completion_time), dayWindow) &&
      (toNumber(l.overloaded_wagons) > 0 || toNumber(l.weight_removed) > 0),
  );

  const releaseQueue = loadings.filter(
    (l) => toTimestamp(l.completion_time) && !toTimestamp(l.clearance_time),
  ).length;

  return [
    {
      label: "Load Adjustment:",
      value: `${adjustments.length} rake${adjustments.length === 1 ? "" : "s"}`,
      detail: adjustments.length ? "Fine/Slimes trim" : "None today",
      tone: adjustments.length ? "orange" : "blue",
    },
    {
      label: "Railway Release Queue:",
      value: `${releaseQueue} rake${releaseQueue === 1 ? "" : "s"}`,
      detail: releaseQueue ? "Awaiting clearance" : "Clear",
      tone: "indigo",
    },
  ];
}

function buildSidingRakeSlide(loading, records, dayWindow, now) {
  const delayMin = Math.round(delayMinutesForRake(loading.rake_number, records.delays || [], dayWindow));
  const progress = estimateLoadedPct(loading, now);
  const complete = toTimestamp(loading.completion_time);
  const state = complete ? "COMPLETED" : delayMin > 0 ? "DELAYED" : "LOADING";
  const badgeTone = complete ? "green" : delayMin > 0 ? (delayMin >= 45 ? "red" : "amber") : "blue";
  const estEnd = complete
    ? formatTimeLabel(loading.completion_time)
    : formatTimeLabel(toTimestamp(loading.placement_time) + COCKPIT_PERMIT_HOURS * HOUR_MS);

  return {
    code: loading.wagontype_name || "—",
    progress,
    rakeNo: loading.rake_number || "—",
    customer: loading.customer_name || "—",
    start: formatTimeLabel(loading.placement_time),
    completeLabel: complete ? "Completion:" : "Est. Compl:",
    estComplete: estEnd,
    delayRowLabel: complete ? "Post-loading:" : "Delay:",
    delayLabel: complete
      ? releaseStatus(loading) === "Awaiting Release"
        ? "Awaiting Release"
        : "Released"
      : delayMin > 0
        ? `+${delayMin} min`
        : "0 min (On-Time)",
    delayTone: complete
      ? releaseStatus(loading) === "Awaiting Release"
        ? "danger"
        : "ok"
      : delayMin > 0
        ? "amber"
        : "ok",
    state,
    badgeTone,
  };
}

function isCockpitLoadingVisible(loading, dayWindow) {
  const placed = toTimestamp(loading.placement_time);
  const completed = toTimestamp(loading.completion_time);
  if (completed == null) return true;
  return (
    isWithinDay(placed, dayWindow) ||
    isWithinDay(completed, dayWindow) ||
    (placed != null && placed < dayWindow.end && completed >= dayWindow.start)
  );
}

export function buildCockpitSidings(records, dayWindow, now = Date.now()) {
  const loadings = activeLoadings(records.loadings || [])
    .filter((l) => isCockpitLoadingVisible(l, dayWindow))
    .sort((a, b) => (toTimestamp(a.placement_time) ?? 0) - (toTimestamp(b.placement_time) ?? 0));

  const bySiding = new Map();
  loadings.forEach((loading) => {
    const siding = loading.siding_name || "Unassigned";
    if (!bySiding.has(siding)) bySiding.set(siding, []);
    bySiding.get(siding).push(loading);
  });

  return [...bySiding.entries()].slice(0, 5).map(([name, sidingLoadings], index) => {
    const rakes = sidingLoadings.map((loading) => buildSidingRakeSlide(loading, records, dayWindow, now));
    const primary = rakes[0];
    const barColor = BAR_COLORS[index % BAR_COLORS.length];
    const headerState = rakes.some((r) => r.state === "DELAYED")
      ? "DELAYED"
      : rakes.every((r) => r.state === "COMPLETED")
        ? "COMPLETED"
        : "LOADING";
    const headerBadge =
      headerState === "COMPLETED" ? "green" : headerState === "DELAYED" ? "amber" : "blue";

    return {
      id: index + 1,
      name: name.toUpperCase(),
      barColor,
      rakeCount: rakes.length,
      state: headerState,
      badgeTone: headerBadge,
      code: primary?.code || "—",
      progress: primary?.progress ?? 0,
      rakes,
    };
  });
}

export function buildCockpitDispatchRows(records, dayWindow, now = Date.now()) {
  const grid = buildDispatchGrid(records, dayWindow, now);
  const sidingLabels = new Map();
  grid.hierarchy.forEach((s) => {
    sidingLabels.set(s.id, s.name);
  });

  const eventsBySiding = new Map();
  grid.events.forEach((event) => {
    if (!eventsBySiding.has(event.siding)) eventsBySiding.set(event.siding, []);
    eventsBySiding.get(event.siding).push(event);
  });

  const rows = [];
  let idx = 0;
  eventsBySiding.forEach((events, sidingKey) => {
    idx += 1;
    const sidingName = sidingLabels.get(sidingKey) || sidingKey;
    const primary = events[0];
    const rakeLabel = primary?.label || "Rake";
    rows.push({
      siding: sidingName,
      subtitle: `${idx}. ${rakeLabel}`,
      bars: events.map((event) => {
        const delayMin = delayMinutesForRake(event.label, records.delays || [], dayWindow);
        return {
          start: event.start,
          end: event.end,
          status: mapGridStatus(event.status, delayMin > 0),
          label: event.label,
          tag: event.status === "completed" ? "Done" : undefined,
        };
      }),
      notes: [],
    });
  });

  return rows;
}

export function buildLiveRakeRegister(records, dayWindow, now = Date.now()) {
  const loadings = activeLoadings(records.loadings || [])
    .filter((l) => isCockpitLoadingVisible(l, dayWindow))
    .sort((a, b) => (toTimestamp(a.placement_time) ?? 0) - (toTimestamp(b.placement_time) ?? 0));

  return loadings.map((loading, index) => {
    const placement = formatPlacementCell(loading.placement_time);
    const delayMin = Math.round(delayMinutesForRake(loading.rake_number, records.delays || [], dayWindow));
    const placed = toTimestamp(loading.placement_time);
    const completed = toTimestamp(loading.completion_time);
    const actualH =
      placed != null ? Math.round(((completed ?? now) - placed) / HOUR_MS * 10) / 10 : "—";

    return {
      sno: index + 1,
      rakeNo: loading.rake_number || "—",
      siding: loading.siding_name || "—",
      customer: loading.customer_name || "—",
      product: loading.stockpile_name || loading.route_name || "—",
      placementDate: placement.date,
      placement: placement.time,
      start: formatTimeLabel(loading.placement_time, { todaySuffix: false }),
      complete: completed ? formatTimeLabel(loading.completion_time, { todaySuffix: false }) : "—",
      loadedPct: estimateLoadedPct(loading, now),
      permitH: COCKPIT_PERMIT_HOURS,
      actualH,
      delayMin,
      release: releaseStatus(loading),
      dept: loading.clearance_time
        ? formatTimeLabel(loading.clearance_time, { todaySuffix: false })
        : "—",
      remarks: buildRemarks(loading, delayMin),
      remarkTone: remarkTone(delayMin, Boolean(completed)),
    };
  });
}

export function buildMonthlyTrend(records) {
  const loadings = activeLoadings(records.loadings || []);
  const monthCounts = new Map();
  const now = new Date();
  for (let i = 7; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-IN", { month: "short" });
    monthCounts.set(key, { month: key, rakes: 0, target: Math.round(COCKPIT_MONTHLY_RAKE_TARGET / 4) });
  }

  loadings.forEach((loading) => {
    const ts = toTimestamp(loading.completion_time);
    if (ts == null) return;
    const key = new Date(ts).toLocaleString("en-IN", { month: "short" });
    if (monthCounts.has(key)) {
      monthCounts.get(key).rakes += 1;
    }
  });

  return [...monthCounts.values()];
}

export function buildProductDispatch(records, monthWindow) {
  const colors = ["#1d8fe0", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const loadings = activeLoadings(records.loadings || []).filter((l) =>
    isWithinRange(toTimestamp(l.completion_time), monthWindow.start, monthWindow.end),
  );
  const totals = new Map();
  let sumMt = 0;
  loadings.forEach((l) => {
    const label = l.route_name || l.stockpile_name || "Other";
    const t = toNumber(l.tonnage) / 1000;
    sumMt += t;
    totals.set(label, (totals.get(label) || 0) + t);
  });
  if (sumMt <= 0) return { slices: [], totalMt: 0 };

  const slices = [...totals.entries()].map(([label, mt], i) => ({
    label,
    pct: Math.round((mt / sumMt) * 100),
    mt: `${mt.toFixed(2)} MT`,
    color: colors[i % colors.length],
  }));
  return { slices, totalMt: sumMt };
}

export function buildSidingLoadingChart(records, monthWindow) {
  const loadings = activeLoadings(records.loadings || []).filter((l) =>
    isWithinRange(toTimestamp(l.completion_time), monthWindow.start, monthWindow.end),
  );
  const bySiding = new Map();
  loadings.forEach((l) => {
    const siding = l.siding_name || "Other";
    const bucket = bySiding.get(siding) || { siding, rakes: 0, tonnage: 0 };
    bucket.rakes += 1;
    bucket.tonnage += toNumber(l.tonnage) / 1000;
    bySiding.set(siding, bucket);
  });
  return [...bySiding.values()].sort((a, b) => a.siding.localeCompare(b.siding));
}

export function buildCockpitBundle(records, dateValue, now = Date.now()) {
  const safe = records ?? { rakes: [], loadings: [], delays: [], sidings: [] };
  const dayWindow = getDayWindow(dateValue);
  const monthWindow = getMonthWindow(dateValue);
  const register = buildLiveRakeRegister(safe, dayWindow, now);
  const product = buildProductDispatch(safe, monthWindow);

  return {
    meta: buildCockpitMeta(safe, dayWindow, now),
    kpis: buildCockpitKpis(safe, dayWindow, monthWindow, now),
    footerMetrics: buildCockpitFooterMetrics(safe, dayWindow),
    sidings: buildCockpitSidings(safe, dayWindow, now),
    dispatchGridRows: buildCockpitDispatchRows(safe, dayWindow, now),
    liveRakeRegister: register,
    registerTotalTracked: Math.max(register.length, activeRakes(safe.rakes || []).length),
    monthlyTrend: buildMonthlyTrend(safe),
    productDispatch: product.slices,
    productDispatchTotalMt: product.totalMt,
    sidingLoading: buildSidingLoadingChart(safe, monthWindow),
    isEmpty:
      register.length === 0
      && buildCockpitSidings(safe, dayWindow, now).length === 0
      && activeLoadings(safe.loadings || []).length === 0,
    isDemo: false,
  };
}
