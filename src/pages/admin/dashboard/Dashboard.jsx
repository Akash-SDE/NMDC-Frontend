import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Gauge,
  Package,
  Scale,
  Timer,
  Truck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import { countPendingApprovals } from "../../../constants/approval";
import { fetchApprovalRequests } from "../../../store/slices/approvalSlice";

const METRIC_TONE_STYLES = {
  navy: {
    border: "border-l-[#102a57]",
    iconBg: "bg-blue-50",
    iconText: "text-blue-700",
    valueText: "text-[#102a57]",
  },
  green: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-700",
    valueText: "text-emerald-700",
  },
  sky: {
    border: "border-l-blue-500",
    iconBg: "bg-sky-50",
    iconText: "text-sky-700",
    valueText: "text-sky-700",
  },
  rose: {
    border: "border-l-rose-500",
    iconBg: "bg-rose-50",
    iconText: "text-rose-700",
    valueText: "text-rose-700",
  },
  amber: {
    border: "border-l-amber-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-700",
    valueText: "text-amber-700",
  },
  slate: {
    border: "border-l-slate-400",
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
    valueText: "text-slate-700",
  },
  indigo: {
    border: "border-l-indigo-600",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-700",
    valueText: "text-indigo-700",
  },
};

const METRIC_ICONS = {
  received: Package,
  loaded: CheckCircle2,
  loading: Truck,
  adjustment: Gauge,
  demurrage: Clock,
  hours: Timer,
  pending: ClipboardList,
  dispatch: Scale,
};

const baseMetricCards = [
  {
    title: "Received",
    value: "12",
    tone: "navy",
    icon: "received",
  },
  {
    title: "Loaded",
    value: "8",
    tone: "green",
    icon: "loaded",
  },
  {
    title: "Under Loading",
    value: "4",
    tone: "sky",
    icon: "loading",
  },
  {
    title: "Load adjustment",
    value: "2",
    tone: "rose",
    icon: "adjustment",
  },
  {
    title: "Demurraged Hours",
    value: "11",
    tone: "rose",
    icon: "demurrage",
  },
  {
    title: "Gross Loading Hours",
    value: "5.5",
    tone: "amber",
    icon: "hours",
  },
  {
    title: "Pending Indents",
    value: "33",
    tone: "slate",
    icon: "pending",
  },
  {
    title: "Dispatch Qty",
    value: "32,845",
    tone: "indigo",
    icon: "dispatch",
  },
];

const baseHourlySeries = [
  { hour: "08:00", lump: 55, fines: 42, pellet: 28, rom: 22 },
  { hour: "09:00", lump: 62, fines: 49, pellet: 31, rom: 24 },
  { hour: "10:00", lump: 68, fines: 47, pellet: 34, rom: 26 },
  { hour: "11:00", lump: 71, fines: 56, pellet: 37, rom: 29 },
  { hour: "12:00", lump: 74, fines: 60, pellet: 39, rom: 30 },
  { hour: "13:00", lump: 70, fines: 57, pellet: 36, rom: 28 },
  { hour: "14:00", lump: 66, fines: 58, pellet: 35, rom: 27 },
  { hour: "15:00", lump: 63, fines: 52, pellet: 33, rom: 25 },
  { hour: "16:00", lump: 61, fines: 46, pellet: 31, rom: 24 },
  { hour: "17:00", lump: 56, fines: 43, pellet: 29, rom: 22 },
  { hour: "18:00", lump: 49, fines: 39, pellet: 26, rom: 20 },
];

const baseHourlySeriesMeta = [
  { key: "lump", label: "LUMP WAGONS", color: "bg-[#0f2f67]" },
  { key: "fines", label: "FINES WAGONS", color: "bg-[#1d6fb8]" },
  { key: "pellet", label: "PELLET WAGONS", color: "bg-[#166534]" },
  { key: "rom", label: "ROM WAGONS", color: "bg-[#d97706]" },
];

const dispatchGridHours = Array.from({ length: 24 }, (_, index) => index);

const dispatchStatusMeta = {
  neutral: {
    label: "Vacant",
    summaryLabel: "",
    cellClass: "bg-slate-50/90 ring-1 ring-inset ring-slate-100",
    dotClass: "bg-slate-300",
    textClass: "text-slate-400",
  },
  idle: {
    label: "Siding Idle",
    summaryLabel: "Idle",
    cellClass: "bg-slate-200/80 ring-1 ring-inset ring-slate-300/60",
    dotClass: "bg-slate-500",
    textClass: "text-slate-700",
  },
  shutdown: {
    label: "Under Shutdown",
    summaryLabel: "Shutdown",
    cellClass: "bg-sky-100/90 ring-1 ring-inset ring-sky-200",
    dotClass: "bg-sky-500",
    textClass: "text-sky-800",
  },
  loading: {
    label: "Under Loading",
    summaryLabel: "loading",
    cellClass: "bg-amber-100/90 ring-1 ring-inset ring-amber-200",
    dotClass: "bg-amber-500",
    textClass: "text-amber-900",
  },
  completed: {
    label: "Completed",
    summaryLabel: "Completed",
    cellClass: "bg-emerald-100/90 ring-1 ring-inset ring-emerald-200",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-800",
  },
  demurrage: {
    label: "Demurraged Rake",
    summaryLabel: "Demurrage",
    cellClass: "bg-rose-100/90 ring-1 ring-inset ring-rose-200",
    dotClass: "bg-rose-500",
    textClass: "text-rose-800",
  },
};

const dispatchLegendOrder = ["idle", "shutdown", "loading", "completed", "demurrage"];
const dispatchSummaryOrder = ["loading", "idle", "shutdown", "demurrage"];
const dispatchStatusPriority = {
  idle: 0,
  shutdown: 1,
  completed: 2,
  loading: 3,
  demurrage: 4,
};

function resolveDispatchVisualStatus(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (!normalizedStatus) {
    return null;
  }

  if (normalizedStatus === "idle" || normalizedStatus === "siding idle") {
    return "idle";
  }

  if (["completed", "loaded", "complete", "done"].includes(normalizedStatus)) {
    return "completed";
  }

  if (["loading", "under loading", "in progress"].includes(normalizedStatus)) {
    return "loading";
  }

  if (["delayed", "demurrage", "demurraged", "under demurrage"].includes(normalizedStatus)) {
    return "demurrage";
  }

  return "shutdown";
}

function resolveDispatchHourStatus(routeEvents, hour) {
  const matchingEvents = routeEvents.filter((event) => event.start < hour + 1 && event.end > hour);

  if (matchingEvents.length === 0) {
    return null;
  }

  return matchingEvents.reduce((bestStatus, event) => {
    const currentStatus = resolveDispatchVisualStatus(event.status);
    if (!currentStatus) {
      return bestStatus;
    }

    if (!bestStatus) {
      return currentStatus;
    }

    return dispatchStatusPriority[currentStatus] > dispatchStatusPriority[bestStatus]
      ? currentStatus
      : bestStatus;
  }, null);
}

function resolveDispatchHourDetail(routeEvents, hour) {
  const matchingEvents = routeEvents.filter((event) => event.start < hour + 1 && event.end > hour);
  if (matchingEvents.length === 0) return null;

  return matchingEvents.reduce((best, current) => {
    const bestStatus = resolveDispatchVisualStatus(best.status);
    const currentStatus = resolveDispatchVisualStatus(current.status);
    if (!bestStatus) return current;
    if (!currentStatus) return best;
    return dispatchStatusPriority[currentStatus] > dispatchStatusPriority[bestStatus] ? current : best;
  }, matchingEvents[0]);
}

function buildDispatchRowSummary(routeEvents) {
  return dispatchGridHours.reduce(
    (summary, hour) => {
      const status = resolveDispatchHourStatus(routeEvents, hour);

      if (!status) {
        return summary;
      }

      if (status === "idle") {
        summary.idle += 1;
      } else if (status === "shutdown") {
        summary.shutdown += 1;
      } else if (status === "demurrage") {
        summary.demurrage += 1;
      } else {
        summary.loading += 1;
      }

      return summary;
    },
    { loading: 0, idle: 0, shutdown: 0, demurrage: 0 },
  );
}

const dispatchGridHierarchy = [
  {
    id: "siding-1a",
    name: "SIDING 1A",
    type: "siding",
    count: 3,
    routes: [
      {
        id: "route-1a-1",
        name: "Route 1",
        type: "route",
        code: "BOXN",
        count: 2,
      },
      {
        id: "route-1a-2",
        name: "Route 2",
        type: "route",
        code: "BOBRN",
        count: 1,
      },
    ],
  },
  {
    id: "siding-2c",
    name: "SIDING 2C",
    type: "siding",
    count: 1,
    routes: [
      {
        id: "route-2c-1",
        name: "Route 1",
        type: "route",
        code: "BOXNHL",
        count: 1,
      },
    ],
  },
  {
    id: "siding-north-junc",
    name: "NORTH JCT",
    type: "siding",
    count: 1,
    alert: "HIGH ALERT",
    routes: [
      {
        id: "route-nj-1",
        name: "Route 1",
        type: "route",
        code: "BOST",
        count: 1,
      },
    ],
  },
  {
    id: "siding-4b",
    name: "SIDING 4B",
    type: "siding",
    count: 2,
    routes: [
      {
        id: "route-4b-1",
        name: "Route 1",
        type: "route",
        code: "MIXED",
        count: 2,
      },
    ],
  },
];

const dispatchGridEvents = [
  { id: "dispatch-1", siding: "siding-1a", route: "route-1a-1", start: 0.0, end: 4.0, status: "completed", label: "RK-7729" },
  { id: "dispatch-1a-idle", siding: "siding-1a", route: "route-1a-1", start: 4.0, end: 6.0, status: "Siding Idle", label: "IDLE-1" },
  { id: "dispatch-2", siding: "siding-1a", route: "route-1a-1", start: 13.0, end: 17.0, status: "offered", label: "RK-7729-A" },
  { id: "dispatch-3", siding: "siding-1a", route: "route-1a-2", start: 4.0, end: 8.0, status: "unloading", label: "RK-8812" },
  { id: "dispatch-3a-empty", siding: "siding-1a", route: "route-1a-2", start: 8.0, end: 10.0, label: "UNSTATUS-1" },
  { id: "dispatch-4", siding: "siding-2c", route: "route-2c-1", start: 6.0, end: 10.0, status: "offered", label: "RK-9003" },
  { id: "dispatch-4a-idle", siding: "siding-2c", route: "route-2c-1", start: 10.0, end: 12.0, status: "Siding Idle", label: "IDLE-2" },
  { id: "dispatch-5", siding: "siding-2c", route: "route-2c-1", start: 17.0, end: 21.0, status: "offered", label: "RK-4420" },
  { id: "dispatch-6", siding: "siding-north-junc", route: "route-nj-1", start: 9.0, end: 14.0, status: "delayed", label: "RK-6541" },
  { id: "dispatch-6a-empty", siding: "siding-north-junc", route: "route-nj-1", start: 14.0, end: 16.0, label: "UNSTATUS-2" },
  { id: "dispatch-7", siding: "siding-4b", route: "route-4b-1", start: 2.0, end: 5.0, status: "delayed", label: "RK-7655" },
  { id: "dispatch-7a-idle", siding: "siding-4b", route: "route-4b-1", start: 5.0, end: 7.0, status: "Siding Idle", label: "IDLE-3" },
  { id: "dispatch-8", siding: "siding-4b", route: "route-4b-1", start: 8.0, end: 12.0, status: "completed", label: "RK-2205" },
];



const activeRakeRows = [
  {
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    fNote: "FN-23011",
    oreType: "LUMPS-62",
    siding: "SIDING-A",
    route: "R14",
    wagons: "58",
    tonnage: "3,450T",
    sidingRoute: "SIDING-A / R14",
    wagonCount: "58 / 3,450T",
    customer: "METALS-CO",
    destination: "PORT-A",
    offerDate: "19/03/2026",
    offerTime: "10:15",
    completionDate: "19/03/2026",
    completionTime: "14:32",
    feedRate: "850 T/H",
    updatedAt: "14:32:05",
    status: "IN PROGRESS",
    lag: "4m 12s",
  },
  {
    rakeId: "RK-8812",
    rakeNumber: "R-2026-002",
    fNote: "FN-23022",
    oreType: "FINES-58",
    siding: "SIDING-C",
    route: "R09",
    wagons: "45",
    tonnage: "2,880T",
    sidingRoute: "SIDING-C / R09",
    wagonCount: "45 / 2,880T",
    customer: "GLOBAL-ORE",
    destination: "STOCKPILE-2",
    offerDate: "19/03/2026",
    offerTime: "11:00",
    completionDate: "19/03/2026",
    completionTime: "14:15",
    feedRate: "720 T/H",
    updatedAt: "14:15:33",
    status: "READY",
    lag: "0m 45s",
  },
  {
    rakeId: "RK-7655",
    rakeNumber: "R-2026-003",
    fNote: "FN-23033",
    oreType: "LUMPS-65",
    siding: "SIDING-B",
    route: "R22",
    wagons: "52",
    tonnage: "3,100T",
    sidingRoute: "SIDING-B / R22",
    wagonCount: "52 / 3,100T",
    customer: "STEEL-IND",
    destination: "EAST-JUNCT",
    offerDate: "19/03/2026",
    offerTime: "09:45",
    completionDate: "19/03/2026",
    completionTime: "14:02",
    feedRate: "680 T/H",
    updatedAt: "14:02:10",
    status: "DELAYED",
    lag: "22m 18s",
  },
  {
    rakeId: "RK-9003",
    rakeNumber: "R-2026-004",
    fNote: "FN-23044",
    oreType: "PELLET-67",
    siding: "SIDING-D",
    route: "R05",
    wagons: "59",
    tonnage: "3,520T",
    sidingRoute: "SIDING-D / R05",
    wagonCount: "59 / 3,520T",
    customer: "IRON-CORE",
    destination: "FURNACE-4",
    offerDate: "19/03/2026",
    offerTime: "12:20",
    completionDate: "19/03/2026",
    completionTime: "13:55",
    feedRate: "910 T/H",
    updatedAt: "13:55:45",
    status: "READY",
    lag: "1m 15s",
  },
  {
    rakeId: "RK-6541",
    rakeNumber: "R-2026-005",
    fNote: "FN-23055",
    oreType: "FINES-54",
    siding: "SIDING-A",
    route: "R18",
    wagons: "50",
    tonnage: "3,200T",
    sidingRoute: "SIDING-A / R18",
    wagonCount: "50 / 3,200T",
    customer: "METALS-CO",
    destination: "PORT-B",
    offerDate: "19/03/2026",
    offerTime: "08:30",
    completionDate: "19/03/2026",
    completionTime: "12:45",
    feedRate: "760 T/H",
    updatedAt: "12:45:22",
    status: "IN PROGRESS",
    lag: "3m 30s",
  },
  {
    rakeId: "RK-4420",
    rakeNumber: "R-2026-006",
    fNote: "FN-23066",
    oreType: "LUMPS-60",
    siding: "SIDING-E",
    route: "R11",
    wagons: "61",
    tonnage: "3,680T",
    sidingRoute: "SIDING-E / R11",
    wagonCount: "61 / 3,680T",
    customer: "GLOBAL-ORE",
    destination: "WEST-YARD",
    offerDate: "19/03/2026",
    offerTime: "07:10",
    completionDate: "19/03/2026",
    completionTime: "11:30",
    feedRate: "830 T/H",
    updatedAt: "11:30:18",
    status: "READY",
    lag: "0m 52s",
  },
  {
    rakeId: "RK-3318",
    rakeNumber: "R-2026-007",
    fNote: "FN-23077",
    oreType: "FINES-49",
    siding: "SIDING-B",
    route: "R03",
    wagons: "44",
    tonnage: "2,750T",
    sidingRoute: "SIDING-B / R03",
    wagonCount: "44 / 2,750T",
    customer: "COAST-ALLOY",
    destination: "STOCKPILE-5",
    offerDate: "19/03/2026",
    offerTime: "13:05",
    completionDate: "19/03/2026",
    completionTime: "14:40",
    feedRate: "640 T/H",
    updatedAt: "14:40:10",
    status: "IN PROGRESS",
    lag: "5m 20s",
  },
  {
    rakeId: "RK-2205",
    rakeNumber: "R-2026-008",
    fNote: "FN-23088",
    oreType: "LUMPS-68",
    siding: "SIDING-F",
    route: "R27",
    wagons: "63",
    tonnage: "3,780T",
    sidingRoute: "SIDING-F / R27",
    wagonCount: "63 / 3,780T",
    customer: "STEEL-IND",
    destination: "NORTH-HUB",
    offerDate: "19/03/2026",
    offerTime: "06:25",
    completionDate: "19/03/2026",
    completionTime: "10:20",
    feedRate: "940 T/H",
    updatedAt: "10:20:55",
    status: "READY",
    lag: "0m 35s",
  },
];

const adjustmentRakeRows = [
  {
    sno: 1,
    oreType: "LUMPS-62",
    siding: "SIDING-A",
    destination: "PORT-A",
    placementTime: "10:15",
  },
  {
    sno: 2,
    oreType: "FINES-58",
    siding: "SIDING-C",
    destination: "STOCKPILE-2",
    placementTime: "11:00",
  }
];

function getStatusClasses(status) {
  if (status === "READY") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "IN PROGRESS") {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-rose-100 text-rose-700";
}

function getLagClasses(lag) {
  if (lag.startsWith("0m") || lag.startsWith("1m")) {
    return "text-emerald-700";
  }
  if (lag.startsWith("2m") || lag.startsWith("3m") || lag.startsWith("4m") || lag.startsWith("5m")) {
    return "text-slate-700";
  }
  return "text-rose-700";
}

function formatDispatchHour(hour) {
  return String(hour).padStart(2, "0") + "h";
}

function formatDispatchHourRange(hour) {
  const nextHour = (hour + 1) % 24;
  return `${formatDispatchHour(hour)} – ${formatDispatchHour(nextHour)}`;
}

function buildDispatchHoverPayload(row, hour, eventDetail, status, meta) {
  return {
    siding: row.siding.name,
    route: row.route.name,
    routeCode: row.route.code,
    time: formatDispatchHour(hour),
    timeRange: formatDispatchHourRange(hour),
    statusLabel: status ? meta.label : "Vacant",
    rake: eventDetail?.label ?? null,
    dotClass: meta.dotClass,
    chipClass: status
      ? meta.cellClass.replace("ring-1 ring-inset", "")
      : "bg-slate-100 text-slate-600",
  };
}

const DISPATCH_GRID_COLUMNS = "minmax(148px, 1.1fr) repeat(24, minmax(0, 1fr))";

function DispatchGridTooltip({ tooltip }) {
  if (!tooltip || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[300] w-56 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl"
      style={{ top: tooltip.top, left: tooltip.left }}
      role="tooltip"
    >
      <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cell details</p>
      <p className="mt-1 text-[13px] font-bold text-slate-900">{tooltip.siding}</p>
      <p className="text-[12px] text-slate-600">
        {tooltip.route} <span className="text-slate-400">({tooltip.routeCode})</span>
      </p>
      <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Hour</span>
          <span className="font-mono font-semibold text-slate-800">{tooltip.timeRange}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Status</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tooltip.chipClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tooltip.dotClass}`} />
            {tooltip.statusLabel}
          </span>
        </div>
        {tooltip.rake ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Rake</span>
            <span className="font-semibold text-blue-700">{tooltip.rake}</span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function formatDispatchTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDashboardDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}



function LiveWagonCountCard({ rows, seriesMeta }) {
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);

  const resolveSeriesStroke = (colorClass) => {
    const matchedHex = /bg-\[(#[0-9a-fA-F]{3,8})\]/.exec(colorClass || "");
    return matchedHex?.[1] || "#1565c0";
  };

  const fullDayRows = useMemo(() => {
    const rowByHour = rows.reduce((accumulator, row) => {
      const hourKey = row.hour.slice(0, 2);
      accumulator[hourKey] = row;
      return accumulator;
    }, {});

    return dispatchGridHours.map((hour) => {
      const hourKey = String(hour).padStart(2, "0");
      const hourLabel = `${hourKey}:00`;
      const existingRow = rowByHour[hourKey];

      if (existingRow) {
        return {
          ...existingRow,
          hour: hourLabel,
        };
      }

      return {
        hour: hourLabel,
        segments: seriesMeta.map((series) => ({
          key: series.key,
          value: 0,
        })),
      };
    });
  }, [rows, seriesMeta]);

  const lineChartData = useMemo(() => {
    const rowsAscending = [...fullDayRows].sort((a, b) => a.hour.localeCompare(b.hour));
    const chartWidth = 980;
    const chartHeight = 300;
    const left = 34;
    const right = 20;
    const top = 20;
    const bottom = 42;
    const innerWidth = chartWidth - left - right;
    const innerHeight = chartHeight - top - bottom;
    const stepX = rowsAscending.length > 1 ? innerWidth / (rowsAscending.length - 1) : innerWidth;

    const minValue = 10;
    const maxValue = 100;

    const lines = seriesMeta.map((series) => {
      const points = rowsAscending.map((row, index) => {
        const value = row.segments.find((segment) => segment.key === series.key)?.value ?? 0;
        const clampedValue = Math.min(Math.max(value, minValue), maxValue);
        const normalized = (clampedValue - minValue) / (maxValue - minValue);
        const x = left + stepX * index;
        const y = top + (1 - normalized) * innerHeight;
        return { x, y, value, hour: row.hour };
      });

      const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

      return {
        ...series,
        stroke: resolveSeriesStroke(series.color),
        points,
        path,
      };
    });

    const guides = Array.from({ length: 10 }, (_, index) => {
      const value = (index + 1) * 10;
      const normalized = (value - minValue) / (maxValue - minValue);
      return {
        value,
        y: top + (1 - normalized) * innerHeight,
      };
    });

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentHourIndex = rowsAscending.findIndex(r => r.hour.startsWith(String(currentHour).padStart(2, "0")));
    
    let currentTimeX = left;
    if (currentHourIndex !== -1) {
      currentTimeX = left + (currentHourIndex * stepX) + (currentMinutes / 60) * stepX;
    }

    return {
      chartWidth,
      chartHeight,
      left,
      right,
      top,
      bottom,
      rowsAscending,
      lines,
      guides,
      stepX,
      currentTimeX
    };
  }, [fullDayRows, seriesMeta]);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Hourly Wagon Count</h3>
            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Real-time Loading Snapshot</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {seriesMeta.map((series) => (
              <span key={`trend-legend-${series.key}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full shadow-xs" style={{ backgroundColor: resolveSeriesStroke(series.color) }} />
                {series.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-4 min-h-8">
          {hoveredTrendPoint ? (
            <div className="inline-flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1.5 transition-all">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hoveredTrendPoint.color }} />
              <p className="text-[12px] font-bold text-slate-900">
                {hoveredTrendPoint.label} • {hoveredTrendPoint.hour} • <span className="text-blue-600 font-black">{hoveredTrendPoint.value} Wagons</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Interactive Trend Analysis • Hover for details</p>
            </div>
          )}
        </div>

        <div className="mt-2 overflow-x-auto">
          <svg viewBox={`0 0 ${lineChartData.chartWidth} ${lineChartData.chartHeight}`} className="h-72 w-full min-w-240">
            {/* Current Time Bold Line */}
            <line
              x1={lineChartData.currentTimeX}
              y1={lineChartData.top}
              x2={lineChartData.currentTimeX}
              y2={lineChartData.chartHeight - lineChartData.bottom}
              stroke="#1565c0"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-sm"
            />
            {lineChartData.guides.map((guide) => (
              <g key={`guide-${guide.value}-${guide.y}`}>
                <line
                  x1={lineChartData.left}
                  y1={guide.y}
                  x2={lineChartData.chartWidth - lineChartData.right}
                  y2={guide.y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text x={lineChartData.left - 8} y={guide.y + 4} textAnchor="end" fontSize="10" fill="#64748b" fontWeight="700">
                  {guide.value}
                </text>
              </g>
            ))}

            {lineChartData.lines.map((series) => (
              <g key={`${series.key}-line`}>
                <path d={series.path} fill="none" stroke={series.stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {series.points.map((point) => (
                  <circle
                    key={`${series.key}-${point.hour}`}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={series.stroke}
                    tabIndex={0}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredTrendPoint({
                        label: series.label,
                        hour: point.hour,
                        value: point.value,
                        color: series.stroke,
                      })
                    }
                    onMouseLeave={() => setHoveredTrendPoint(null)}
                    onFocus={() =>
                      setHoveredTrendPoint({
                        label: series.label,
                        hour: point.hour,
                        value: point.value,
                        color: series.stroke,
                      })
                    }
                    onBlur={() => setHoveredTrendPoint(null)}
                  >
                    <title>{`${series.label} ${point.hour}: ${point.value}`}</title>
                  </circle>
                ))}
              </g>
            ))}

            {lineChartData.rowsAscending.map((row, index) => {
              const x = lineChartData.left + lineChartData.stepX * index;
              return (
                <text key={`x-label-${row.hour}`} x={x} y={lineChartData.chartHeight - 10} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="700">
                  {row.hour}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

    </article>
  );
}

const MetricCard = memo(function MetricCard({ card }) {
  const tone = METRIC_TONE_STYLES[card.tone] || METRIC_TONE_STYLES.slate;
  const Icon = METRIC_ICONS[card.icon] || Package;

  return (
    <article
      className={`group flex items-center justify-between rounded-xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md ${tone.border}`}
    >
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
          {card.title}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <p className={`text-2xl font-bold tracking-tight ${tone.valueText}`}>{card.value}</p>
          {card.unit ? (
            <span className="text-[12px] font-semibold text-slate-400">{card.unit}</span>
          ) : null}
        </div>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.iconBg} transition-transform duration-200 group-hover:scale-105`}
      >
        <Icon size={20} className={tone.iconText} strokeWidth={2} />
      </div>
    </article>
  );
});

const DispatchTimelineCard = memo(function DispatchTimelineCard({ sheetRows }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    const syncCurrentTime = () => {
      setCurrentTime(new Date());
    };

    syncCurrentTime();
    const intervalId = setInterval(syncCurrentTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeLabel = formatDispatchTime(currentTime);

  const gridStats = useMemo(() => {
    return sheetRows.reduce(
      (acc, row) => {
        acc.routes += 1;
        acc.loading += row.summary.loading;
        acc.demurrage += row.summary.demurrage;
        acc.completed += row.hourStatuses.filter((s) => s === "completed").length;
        return acc;
      },
      { routes: 0, loading: 0, demurrage: 0, completed: 0 },
    );
  }, [sheetRows]);

  const minuteOffsetPercent = (currentMinute / 60) * 100;

  function handleCellHover(event, payload) {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredCell({
      ...payload,
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-blue-50/40 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {gridStats.routes} routes tracked
              </span>
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Real-Time Dispatch Grid
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              24-hour siding & route allocation timeline
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Current time
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-slate-900">
                {currentTimeLabel}
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/70">Loading</p>
                <p className="text-lg font-bold text-amber-800">{gridStats.loading}h</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70">Done</p>
                <p className="text-lg font-bold text-emerald-800">{gridStats.completed}h</p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700/70">Delay</p>
                <p className="text-lg font-bold text-rose-800">{gridStats.demurrage}h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Status
          </span>
          {dispatchLegendOrder.map((statusKey) => {
            const meta = dispatchStatusMeta[statusKey];
            return (
              <span
                key={statusKey}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-xs"
              >
                <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                {meta.label}
              </span>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/40 p-2">
          <div
            className="grid w-full min-w-[640px] gap-1"
            style={{ gridTemplateColumns: DISPATCH_GRID_COLUMNS }}
          >
            <div className="sticky left-0 z-30 flex min-h-9 items-center rounded-lg bg-white px-3 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/80">
              Siding / Route
            </div>

            {dispatchGridHours.map((hour) => {
              const isCurrentHour = hour === currentHour;
              return (
                <div
                  key={`head-${hour}`}
                  className={`relative flex min-h-9 min-w-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums ${
                    isCurrentHour
                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                      : "bg-white text-slate-500 ring-1 ring-slate-200/60"
                  }`}
                >
                  {formatDispatchHour(hour)}
                  {isCurrentHour ? (
                    <span
                      className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.55)]"
                      style={{ left: `${minuteOffsetPercent}%` }}
                    />
                  ) : null}
                </div>
              );
            })}

            {sheetRows.flatMap((row) => {
              const labelCell = (
                <div
                  key={`label-${row.route.id}`}
                  className="sticky left-0 z-20 flex min-h-9 min-w-0 items-center rounded-lg bg-white px-3 shadow-sm ring-1 ring-slate-200/80"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-slate-800">
                        {row.siding.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{row.route.name}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                      {row.route.code}
                    </span>
                    {row.siding.alert ? (
                      <span className="shrink-0 rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 ring-1 ring-rose-100">
                        !
                      </span>
                    ) : null}
                  </div>
                </div>
              );

              const hourCells = dispatchGridHours.map((hour) => {
                const eventDetail = resolveDispatchHourDetail(row.routeEvents, hour);
                const status = eventDetail ? resolveDispatchVisualStatus(eventDetail.status) : null;
                const meta = dispatchStatusMeta[status] || dispatchStatusMeta.neutral;
                const isCurrentHour = hour === currentHour;
                const rakeLabel = eventDetail?.label
                  ? String(eventDetail.label).replace(/^RK-/i, "")
                  : "";
                const hoverPayload = buildDispatchHoverPayload(
                  row,
                  hour,
                  eventDetail,
                  status,
                  meta,
                );

                return (
                  <button
                    key={`${row.route.id}-${hour}`}
                    type="button"
                    className={`relative flex min-h-9 min-w-0 w-full items-center justify-center rounded-md transition-colors duration-150 ${meta.cellClass} ${meta.textClass} ${
                      isCurrentHour ? "ring-2 ring-blue-400/40" : ""
                    } hover:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                    onMouseEnter={(event) => handleCellHover(event, hoverPayload)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onFocus={(event) => handleCellHover(event, hoverPayload)}
                    onBlur={() => setHoveredCell(null)}
                    aria-label={`${row.siding.name} ${row.route.name} ${formatDispatchHour(hour)} ${status ? meta.label : "Vacant"}`}
                  >
                    {rakeLabel ? (
                      <span className="truncate px-0.5 text-[8px] font-bold leading-none opacity-80">
                        {rakeLabel}
                      </span>
                    ) : null}
                    {isCurrentHour ? (
                      <span
                        className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 rounded-full bg-blue-500/80"
                        style={{ left: `${minuteOffsetPercent}%` }}
                      />
                    ) : null}
                  </button>
                );
              });

              return [labelCell, ...hourCells];
            })}
          </div>
        </div>

        <DispatchGridTooltip tooltip={hoveredCell} />
      </div>
    </article>
  );
});

const DispatchSummaryCard = memo(function DispatchSummaryCard({ sheetRows }) {
  const totals = useMemo(() => {
    return sheetRows.reduce((acc, row) => {
      acc.loading += row.summary.loading;
      acc.idle += row.summary.idle;
      acc.shutdown += row.summary.shutdown;
      acc.demurrage += row.summary.demurrage;
      return acc;
    }, { loading: 0, idle: 0, shutdown: 0, demurrage: 0 });
  }, [sheetRows]);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Operational Summary</h3>
        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Route-wise Breakdown of status hours</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="sticky left-0 z-10 border-r border-b border-slate-200/70 bg-slate-50/50 px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                Siding / Route
              </th>
              {dispatchSummaryOrder.map((statusKey) => (
                <th key={statusKey} className="border-b border-slate-200/70 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${dispatchStatusMeta[statusKey].dotClass}`} />
                    {dispatchStatusMeta[statusKey].summaryLabel}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheetRows.map((row, rowIndex) => (
              <tr key={row.route.id} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"}>
                <td className="sticky left-0 z-10 border-r border-b border-slate-200/70 bg-inherit px-3 py-2 w-px whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <p className="min-w-[140px] text-[11px] font-bold text-[#0f2f67] uppercase">
                      {row.siding.name} / {row.route.name}
                    </p>
                    <div className="flex items-center">
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-black text-slate-700 border border-slate-200">
                        {row.route.code}
                      </span>
                    </div>
                  </div>
                </td>
                {dispatchSummaryOrder.map((statusKey) => (
                  <td key={statusKey} className="border-b border-slate-200/70 px-3 py-2 text-center">
                    <span className="text-[12px] font-black text-slate-900">
                      {String(row.summary[statusKey]).padStart(2, "0")}
                    </span>
                    <span className="ml-1 text-[9px] font-bold text-slate-400 uppercase">h</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td className="sticky left-0 z-10 border-r bg-slate-900 px-3 py-3 text-[11px] font-black uppercase tracking-widest">
                System Totals
              </td>
              {dispatchSummaryOrder.map((statusKey) => (
                <th key={statusKey} className="px-3 py-3 text-center">
                  <span className="text-[14px] font-black text-white">
                    {String(totals[statusKey]).padStart(2, "0")}
                  </span>
                  <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">h</span>
                </th>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </article>
  );
});

export default function Dashboard() {
  const dispatch = useDispatch();
  const approvalItems = useSelector((state) => state.approvals.items);
  const [sortBy, setSortBy] = useState("rakeId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [tablePage, setTablePage] = useState(1);
  const [dashboardDate, setDashboardDate] = useState(() => formatDashboardDate(new Date()));
  const [activeHourlySeries, setActiveHourlySeries] = useState(
    baseHourlySeriesMeta.reduce((acc, series) => {
      acc[series.key] = true;
      return acc;
    }, {})
  );

  useEffect(() => {
    dispatch(fetchApprovalRequests());
  }, [dispatch]);

  const hourlySeries = baseHourlySeries;
  const hourlySeriesMeta = baseHourlySeriesMeta;

  const pendingApprovalCount = useMemo(
    () => countPendingApprovals(approvalItems),
    [approvalItems],
  );

  const metricCards = useMemo(
    () =>
      baseMetricCards.map((card) =>
        card.title === "Pending Indents"
          ? { ...card, title: "Awaiting Railway Approval", value: String(pendingApprovalCount) }
          : card,
      ),
    [pendingApprovalCount],
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setTablePage(1);
  };

  const pageSize = 6;
  const sortedRows = useMemo(() => {
    return [...activeRakeRows].sort((a, b) => {
      const aValue = String(a[sortBy] ?? "").toLowerCase();
      const bValue = String(b[sortBy] ?? "").toLowerCase();
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const pagedRows = useMemo(() => {
    const start = (tablePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [tablePage, sortedRows]);

  const hourlyChartData = useMemo(() => {
    const activeMeta = hourlySeriesMeta.filter((series) => activeHourlySeries[series.key]);
    const peakValue = Math.max(
      ...hourlySeries.map((item) => {
        return Math.max(...activeMeta.map((series) => item[series.key]));
      }),
      1,
    );

    const bars = hourlySeries.map((item) => {
      const segments = activeMeta.map((series) => {
        const value = item[series.key];
        const height = Math.max((value / peakValue) * 128, 10);
        return {
          ...series,
          value,
          height,
        };
      });

      return {
        hour: item.hour,
        segments,
      };
    });

    const totals = hourlySeriesMeta.reduce((accumulator, series) => {
      accumulator[series.key] = activeHourlySeries[series.key]
        ? hourlySeries.reduce((sum, item) => sum + item[series.key], 0)
        : 0;
      return accumulator;
    }, {});

    return {
      bars,
      totals,
    };
  }, [activeHourlySeries, hourlySeries, hourlySeriesMeta]);

  const eventsByRouteId = useMemo(() => {
    return dispatchGridEvents.reduce((accumulator, event) => {
      const routeKey = event.route || event.siding;
      if (!accumulator[routeKey]) {
        accumulator[routeKey] = [];
      }
      accumulator[routeKey].push(event);
      return accumulator;
    }, {});
  }, []);

  const sheetRows = useMemo(() => {
    return dispatchGridHierarchy.flatMap((siding) =>
      siding.routes.map((route) => {
        const routeEvents = eventsByRouteId[route.id] || [];

        return {
          siding,
          route,
          routeEvents,
          hourStatuses: dispatchGridHours.map((hour) => resolveDispatchHourStatus(routeEvents, hour)),
          summary: buildDispatchRowSummary(routeEvents),
        };
      }),
    );
  }, [eventsByRouteId]);
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-slate-800 sm:text-[28px]">
              Operations Cockpit
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Daily operational overview and dispatch monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dashboardDate}
              onChange={(event) => setDashboardDate(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard key={card.title} card={card} />
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <DispatchTimelineCard
            sheetRows={sheetRows}
          />
          <DispatchSummaryCard 
            sheetRows={sheetRows}
          />
        </section>

        <section>
          <LiveWagonCountCard rows={hourlyChartData.bars} seriesMeta={hourlySeriesMeta} />
        </section>

        {adjustmentRakeRows.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/30 px-6 py-5">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Upcoming Rake</h3>
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Load Correction Tracking</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">SNO</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">ORE TYPE</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">SIDING</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">DESTINATION</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">PLACEMENT TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustmentRakeRows.map((row, index) => (
                    <tr key={row.sno} className={`border-b border-slate-200/70 ${index % 2 === 0 ? "bg-white" : "bg-[#fbfcfe]"}`}>
                      <td className="whitespace-nowrap px-6 py-3 text-[12px] font-bold text-slate-400">{row.sno}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-[12px] font-bold text-[#0f2f67]">{row.oreType}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-[12px] font-semibold text-slate-700">{row.siding}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-[12px] font-semibold text-slate-700">{row.destination}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-[12px] font-bold text-[#155eef]">{row.placementTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/30 px-6 py-5">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Active Rake Log</h3>
              <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Operational Status & Clearances</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  In Transit
                </span>
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Cleared
                </span>
              </div>
              <div className="flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-500">
                PAGINATION {tablePage} / {totalPages}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-375 border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Rake ID" field="rakeId" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="F-Note" field="fNote" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Siding" field="siding" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Route" field="route" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Ore Type" field="oreType" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Customer" field="customer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Wagons" field="wagons" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Tonnage" field="tonnage" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Offer Date" field="offerDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Offer Time" field="offerTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Completion Date" field="completionDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Completion Time" field="completionTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Feed Rate" field="feedRate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Updated At" field="updatedAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                    <SortHeaderButton label="Lag" field="lag" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, index) => (
                  <tr
                    key={`${row.rakeId}-${row.updatedAt}`}
                    className={`border-b border-slate-200/70 ${index % 2 === 0 ? "bg-white" : "bg-[#fbfcfe]"}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-bold text-[#155eef]">{row.rakeId}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-bold text-[#0f2f67]">{row.rakeNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-slate-600">{row.fNote}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-slate-700">{row.siding}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-slate-700">{row.route}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-slate-700">{row.oreType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-slate-700">{row.customer}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-bold text-[#1f67b7]">{row.wagons}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-bold text-[#1f67b7]">{row.tonnage}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-slate-700">{row.destination}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-slate-700">{row.offerDate}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-slate-700">{row.offerTime}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-slate-700">{row.completionDate}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-slate-700">{row.completionTime}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-bold text-slate-700">{row.feedRate}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-slate-700">{row.updatedAt}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex min-w-[90px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold tracking-[0.06em] ${getStatusClasses(
                          row.status,
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-[12px] font-bold ${getLagClasses(row.lag)}`}>{row.lag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
              Showing {(tablePage - 1) * pageSize + 1}-{Math.min(tablePage * pageSize, sortedRows.length)} of {sortedRows.length} rakes
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={tablePage === 1}
                onClick={() => setTablePage((prev) => Math.max(prev - 1, 1))}
                className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={tablePage === totalPages}
                onClick={() => setTablePage((prev) => Math.min(prev + 1, totalPages))}
                className="rounded border border-[#0f2f67] bg-[#0f2f67] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
