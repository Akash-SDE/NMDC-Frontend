import { useEffect, useMemo, useState } from "react";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import { getWagonTypesMasterData } from "../../../data/adminmasterdatafiles/wagonTypes";

const baseMetricCards = [
  {
    title: "Received",
    value: "12",
    note: "",
    accent: "bg-[#1d6fb8]",
    noteColor: "text-slate-500",
    icon: "offer",
  },
  {
    title: "Loaded",
    value: "8",
    note: "",
    accent: "bg-[#405f22]",
    noteColor: "text-slate-500",
    icon: "completed",
  },
  {
    title: "Under Loading",
    value: "4",
    note: "",
    accent: "bg-[#1d6fb8]",
    noteColor: "text-slate-500",
    icon: "loading",
  },
  {
    title: "Load adjustment",
    value: "2",
    note: "",
    accent: "bg-[#dc2626]",
    noteColor: "text-slate-500",
    icon: "offer",
  },
  {
    title: "demurraged Hours",
    value: "11",
    note: "",
    accent: "bg-[#dc2626]",
    noteColor: "text-slate-500",
    icon: "offer",
  },
  {
    title: "Gross Loading Hours",
    value: "5.5",
    note: "",
    accent: "bg-[#dc2626]",
    noteColor: "text-slate-500",
    icon: "loading",
  },
  {
    title: "Pending Indents",
    value: "33",
    note: "",
    accent: "bg-[#1d6fb8]",
    noteColor: "text-slate-500",
    icon: "completed",
  },
  {
    title: "Dispatch Qty",
    value: "32845",
    note: "",
    accent: "bg-[#1d6fb8]",
    noteColor: "text-slate-500",
    icon: "tonnage",
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
  { key: "lump", label: "LUMP WAGONS", color: "bg-[#1f3d72]" },
  { key: "fines", label: "FINES WAGONS", color: "bg-[#4787e0]" },
  { key: "pellet", label: "PELLET WAGONS", color: "bg-[#16a34a]" },
  { key: "rom", label: "ROM WAGONS", color: "bg-[#d97706]" },
];

const extraWagonSeriesColors = [
  "bg-[#7c3aed]",
  "bg-[#0f766e]",
  "bg-[#c026d3]",
  "bg-[#ea580c]",
  "bg-[#0891b2]",
  "bg-[#be123c]",
  "bg-[#4f46e5]",
  "bg-[#166534]",
];

const dispatchGridHours = Array.from({ length: 24 }, (_, index) => index);

const dispatchStatusMeta = {
  neutral: {
    label: "",
    summaryLabel: "",
    cellClass: "bg-white",
    textClass: "text-slate-900",
  },
  idle: {
    label: "Siding Idle",
    summaryLabel: "Idle",
    cellClass: "bg-[#6f6f6f]",
    textClass: "text-white",
  },
  shutdown: {
    label: "Under Shutdown",
    summaryLabel: "Shutdown",
    cellClass: "bg-[#1f8dd8]",
    textClass: "text-white",
  },
  loading: {
    label: "Under Loading",
    summaryLabel: "loading",
    cellClass: "bg-[#f5df10]",
    textClass: "text-slate-900",
  },
  completed: {
    label: "Completed",
    summaryLabel: "Completed",
    cellClass: "bg-[#405f22]",
    textClass: "text-white",
  },
  demurrage: {
    label: "Demurraged Rake",
    summaryLabel: "Demurrage",
    cellClass: "bg-[#b91c1c]",
    textClass: "text-white",
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
    name: "Siding 1A",
    type: "siding",
    count: 3,
    routes: [
      {
        id: "route-1a-1",
        name: "Route 1",
        type: "route",
        code: "ALPHA",
        count: 2,
      },
      {
        id: "route-1a-2",
        name: "Route 2",
        type: "route",
        code: "BRAVO",
        count: 1,
      },
    ],
  },
  {
    id: "siding-2c",
    name: "Siding 2C",
    type: "siding",
    count: 1,
    routes: [
      {
        id: "route-2c-1",
        name: "Route 1",
        type: "route",
        code: "CHARLIE",
        count: 1,
      },
    ],
  },
  {
    id: "siding-north-junc",
    name: "North Junction",
    type: "siding",
    count: 1,
    alert: "HIGH ALERT",
    routes: [
      {
        id: "route-nj-1",
        name: "Direct Line",
        type: "route",
        code: "DELTA",
        count: 1,
      },
    ],
  },
  {
    id: "siding-4b",
    name: "Siding 4B",
    type: "siding",
    count: 2,
    routes: [
      {
        id: "route-4b-1",
        name: "Route 1",
        type: "route",
        code: "ECHO",
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

function toWagonSeriesKey(code) {
  return `wagon_${String(code || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}

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
  return String(hour);
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

function formatDashboardDateLabel(dateValue) {
  if (!dateValue) {
    return "--/--/----";
  }

  const [year, month, day] = String(dateValue).split("-");
  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}/${month}/${year}`;
}

function LiveWagonCountCard({ rows, seriesMeta }) {
  const [fixedTime] = useState(() => new Date());
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

    return {
      chartWidth,
      chartHeight,
      left,
      right,
      bottom,
      rowsAscending,
      lines,
      guides,
      stepX,
    };
  }, [fullDayRows, seriesMeta]);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4">
        <div>
          <h3 className="text-[22px] font-extrabold leading-tight text-[#102a57]">HOURLY WAGON COUNT</h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">TIME-STAMPED WAGON SNAPSHOT</p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-[#f8fbff] px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">WAGON COUNT TREND</p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-600">
          {seriesMeta.map((series) => (
            <span key={`trend-legend-${series.key}`} className="inline-flex items-center gap-1.5 uppercase tracking-[0.04em]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: resolveSeriesStroke(series.color) }} />
              {series.label}
            </span>
          ))}
        </div>

        <div className="mt-2 min-h-10">
          {hoveredTrendPoint ? (
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hoveredTrendPoint.color }} />
              <p className="text-[11px] font-semibold text-[#0f2f67]">
                {hoveredTrendPoint.label} at {hoveredTrendPoint.hour}: <span className="font-extrabold">{hoveredTrendPoint.value}</span>
              </p>
            </div>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">Hover a dot to view details</p>
          )}
        </div>

        <div className="mt-2 overflow-x-auto">
          <svg viewBox={`0 0 ${lineChartData.chartWidth} ${lineChartData.chartHeight}`} className="h-72 w-full min-w-240">
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

function CardIcon({ type }) {
  if (type === "offer") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-slate-300"
      >
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M7 21h10" />
        <path d="M12 17v4" />
      </svg>
    );
  }
  if (type === "completed") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-[#92baf7]"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12 2.2 2.3 4.8-4.8" />
      </svg>
    );
  }
  if (type === "loading") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-[#f0d5ab]"
      >
        <path d="M3 17h18" />
        <path d="m6 17 2-7h8l2 7" />
        <path d="M10 10V7h4v3" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="text-slate-300"
    >
      <path d="M6 7h12" />
      <path d="M8 7V5h8v2" />
      <path d="M7 7h10l-1 12H8L7 7Z" />
    </svg>
  );
}

function MetricCard({ card }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className={`absolute left-0 top-0 h-full w-0.75 ${card.accent}`} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold tracking-[0.11em] text-slate-500">{card.title}</p>
        <CardIcon type={card.icon} />
      </div>
      <div className="mt-2 flex items-end gap-1.5">
        <p className="text-[39px] font-extrabold leading-none tracking-tight text-[#0f2f67]">{card.value}</p>
        {card.unit ? <span className="pb-1 text-[14px] font-bold text-[#9ca3af]">{card.unit}</span> : null}
      </div>
      <p className={`mt-1 text-[10px] font-semibold ${card.noteColor}`}>{card.note}</p>
      {card.title === "TOTAL RAKES COMPLETED" ? (
        <div className="mt-2 h-0.75 rounded bg-slate-200">
          <span className="block h-full w-[93%] rounded bg-[#2f79e9]" />
        </div>
      ) : null}
    </article>
  );
}

function DispatchTimelineCard({ hierarchy, events }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const syncCurrentTime = () => {
      setCurrentTime(new Date());
    };

    syncCurrentTime();
    const intervalId = setInterval(syncCurrentTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const currentHour = currentTime.getHours();
  const currentTimeLabel = formatDispatchTime(currentTime);

  const eventsByRouteId = useMemo(() => {
    return events.reduce((accumulator, event) => {
      const routeKey = event.route || event.siding;
      if (!accumulator[routeKey]) {
        accumulator[routeKey] = [];
      }
      accumulator[routeKey].push(event);
      return accumulator;
    }, {});
  }, [events]);

  const sheetRows = useMemo(() => {
    return hierarchy.flatMap((siding) =>
      siding.routes.map((route) => {
        const routeEvents = eventsByRouteId[route.id] || [];

        return {
          siding,
          route,
          hourStatuses: dispatchGridHours.map((hour) => resolveDispatchHourStatus(routeEvents, hour)),
          summary: buildDispatchRowSummary(routeEvents),
        };
      }),
    );
  }, [eventsByRouteId, hierarchy]);

  return (
    <article className="overflow-hidden rounded-[24px] border border-rose-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rose-200 px-5 py-4">
        <div>
          <h3 className="text-[22px] font-extrabold leading-tight text-[#102a57]">REAL-TIME DISPATCH GRID</h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
            24-HOUR SIDING & ROUTE ALLOCATION
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
            CURRENT TIME: <span className="text-[#1565c0]">{currentTimeLabel}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-3 py-3 xl:grid-cols-[minmax(0,1fr)_210px] xl:px-4 xl:pb-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1650px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  rowSpan={2}
                  className="sticky left-0 z-30 border-r border-b border-rose-300 bg-[#f8fafc] px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700"
                >
                  Siding / Route
                </th>
                {dispatchGridHours.map((hour) => (
                  <th
                    key={hour}
                    className={`border-r border-b border-rose-300 px-1 py-3 text-center text-[15px] font-bold leading-none text-slate-800 ${
                      hour === currentHour ? "bg-[#dfeafb] text-[#1565c0]" : "bg-[#f8fafc]"
                    }`}
                  >
                    {formatDispatchHour(hour)}
                  </th>
                ))}
                <th
                  colSpan={dispatchSummaryOrder.length}
                  className="border-b border-rose-300 bg-[#f8fafc] px-4 py-3 text-center text-[18px] font-extrabold text-slate-800"
                >
                  Summary
                </th>
              </tr>
              <tr>
                <th colSpan={dispatchGridHours.length} className="border-r border-b border-rose-300 bg-white p-0" />
                {dispatchSummaryOrder.map((columnKey) => {
                  const meta = dispatchStatusMeta[columnKey];

                  return (
                    <th
                      key={columnKey}
                      className="border-r border-b border-rose-300 bg-white px-3 py-2 text-center text-[13px] font-bold capitalize tracking-[0.06em] text-slate-600"
                    >
                      {meta.summaryLabel}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {sheetRows.map((row, rowIndex) => {
                const rowBackground = rowIndex % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]";

                return (
                  <tr key={`${row.siding.id}-${row.route.id}`}>
                    <td className={`sticky left-0 z-20 border-r border-b border-rose-300 px-4 py-3 align-middle ${rowBackground}`}>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#0f2f67]">{row.route.name}</p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                            {row.siding.name}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                            {row.route.code}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            {row.route.count}
                          </span>
                        </div>
                      </div>
                    </td>

                    {dispatchGridHours.map((hour) => {
                      const status = row.hourStatuses[hour];
                      const meta = dispatchStatusMeta[status] || dispatchStatusMeta.neutral;
                      const isCurrentHour = hour === currentHour;

                      return (
                        <td
                          key={`${row.route.id}-${hour}`}
                          className={`h-10 border-r border-b border-rose-300 p-0 ${meta.cellClass} ${meta.textClass} ${
                            isCurrentHour ? "ring-2 ring-inset ring-[#1565c0]" : ""
                          }`}
                          title={`${row.route.name} • ${hour}:00`}
                        />
                      );
                    })}

                    {dispatchSummaryOrder.map((columnKey) => (
                      <td
                        key={`${row.route.id}-${columnKey}`}
                        className="border-r border-b border-rose-300 bg-white px-3 py-3 text-center text-[14px] font-semibold text-slate-800"
                      >
                        {row.summary[columnKey]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="self-start">
          <div className="overflow-hidden rounded-[20px] border border-rose-300 bg-white shadow-sm">
            <div className="border-b border-rose-300 px-4 py-3 text-center text-[18px] font-extrabold text-slate-800">
              Index
            </div>
            <div className="divide-y divide-rose-300">
              {dispatchLegendOrder.map((statusKey) => {
                const meta = dispatchStatusMeta[statusKey];

                return (
                  <div
                    key={statusKey}
                    className={`${meta.cellClass} px-4 py-2 text-center text-[13px] font-semibold ${meta.textClass}`}
                  >
                    {meta.label}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [dashboardDate, setDashboardDate] = useState(() => formatDashboardDate(new Date()));
  const storedWagonTypes = useMemo(() => {
    return getWagonTypesMasterData().filter(
      (item) => item?.code && item?.name && item.status !== "inactive",
    );
  }, []);

  const hourlySeriesMeta = useMemo(() => {
    const baseSeries = [...baseHourlySeriesMeta];
    const existingKeys = new Set(baseSeries.map((series) => series.key));

    const dynamicSeries = storedWagonTypes
      .map((item, index) => ({
        key: toWagonSeriesKey(item.code),
        label: `${item.name.toUpperCase()} WAGONS`,
        color: extraWagonSeriesColors[index % extraWagonSeriesColors.length],
      }))
      .filter((series) => !existingKeys.has(series.key));

    return [...baseSeries, ...dynamicSeries];
  }, [storedWagonTypes]);

  const hourlySeries = useMemo(() => {
    return baseHourlySeries.map((item) => {
      const normalized = { ...item };

      hourlySeriesMeta.forEach((series) => {
        if (normalized[series.key] == null) {
          normalized[series.key] = 0;
        }
      });

      return normalized;
    });
  }, [hourlySeriesMeta]);

  const [tablePage, setTablePage] = useState(1);
  const [sortBy, setSortBy] = useState("rakeId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeHourlySeries, setActiveHourlySeries] = useState(() => {
    return hourlySeriesMeta.reduce((accumulator, series) => {
      accumulator[series.key] = true;
      return accumulator;
    }, {});
  });
  const [hoveredHourlySeries, setHoveredHourlySeries] = useState(null);

  const metricCards = baseMetricCards;

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
  const toggleHourlySeries = (seriesKey) => {
    setActiveHourlySeries((previous) => {
      const currentlyEnabled = Object.values(previous).filter(Boolean).length;

      if (previous[seriesKey] && currentlyEnabled === 1) {
        return previous;
      }

      return {
        ...previous,
        [seriesKey]: !previous[seriesKey],
      };
    });
    setHoveredHourlySeries(null);
  };

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

  const hourlyHoverSummary = useMemo(() => {
    if (!hoveredHourlySeries || !activeHourlySeries[hoveredHourlySeries.key]) {
      return null;
    }

    const seriesLabel = hourlySeriesMeta.find((series) => series.key === hoveredHourlySeries.key)?.label;
    return {
      hour: hoveredHourlySeries.hour,
      label: seriesLabel,
      value: hoveredHourlySeries.value,
    };
  }, [hoveredHourlySeries, activeHourlySeries, hourlySeriesMeta]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">REPORT DATE</p>
            <p className="mt-1 text-[12px] font-semibold text-[#0f2f67]">Pick the dashboard date to review</p>
          </div>

          <div className="w-full sm:w-60">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Select date</label>
            <input
              type="date"
              value={dashboardDate}
              onChange={(event) => setDashboardDate(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f2f67] outline-none transition focus:border-[#1565c0] focus:ring-1 focus:ring-[#1565c0]"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.title} card={card} />
        ))}
      </section>

      <section>
        <DispatchTimelineCard
          hierarchy={dispatchGridHierarchy}
          events={dispatchGridEvents}
        />
      </section>

      <section>
        <LiveWagonCountCard rows={hourlyChartData.bars} seriesMeta={hourlySeriesMeta} />
      </section>

      <section>
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h3 className="text-[17px] font-extrabold tracking-[0.01em] text-[#102a57]">
              Active Rake Log &amp; Clearances
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1f4f96]" />
                In Transit
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Cleared
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-375">
              <thead>
                <tr className="border-b border-slate-100 bg-[#f3f4f6]">
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Rake ID" field="rakeId" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="F-Note" field="fNote" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Siding" field="siding" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Route" field="route" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Ore Type" field="oreType" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Customer" field="customer" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Wagons" field="wagons" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Tonnage" field="tonnage" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Destination" field="destination" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Offer Date" field="offerDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Offer Time" field="offerTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Completion Date" field="completionDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Completion Time" field="completionTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Feed Rate" field="feedRate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Updated At" field="updatedAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <SortHeaderButton label="Lag" field="lag" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, index) => (
                  <tr
                    key={`${row.rakeId}-${row.updatedAt}`}
                    className={`border-b border-white ${index % 2 === 0 ? "bg-[#eff1f3]" : "bg-[#f4f5f7]"}`}
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
                        className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold tracking-[0.06em] ${getStatusClasses(
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
        </article>
      </section>

    </div>
  );
}
