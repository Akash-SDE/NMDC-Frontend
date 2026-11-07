import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import ApiErrorState from "../../../components/common/ApiErrorState";
import { useDashboardData } from "../../../features/dashboard/hooks/useDashboardData";

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
    <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-blue-50/40 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {gridStats.routes} routes tracked
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Real-Time Dispatch Grid
            </h3>
            <p className="mt-0.5 text-[12px] text-slate-500">
              24-hour siding & route allocation timeline
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Current time
              </p>
              <p className="font-mono text-base font-bold tabular-nums text-slate-900">
                {currentTimeLabel}
              </p>
            </div>
            <div className="hidden gap-1.5 sm:flex">
              <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-2.5 py-1.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-700/70">Loading</p>
                <p className="text-base font-bold text-amber-800">{gridStats.loading}h</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700/70">Done</p>
                <p className="text-base font-bold text-emerald-800">{gridStats.completed}h</p>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50/60 px-2.5 py-1.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-rose-700/70">Delay</p>
                <p className="text-base font-bold text-rose-800">{gridStats.demurrage}h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
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

        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/80 bg-slate-50/40 p-2">
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
          {sheetRows.length === 0 ? (
            <p className="px-3 py-6 text-center text-[12px] font-medium text-slate-400">
              No rake activity recorded for the selected date.
            </p>
          ) : null}
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
  const [dashboardDate, setDashboardDate] = useState(() => formatDashboardDate(new Date()));
  const [upcomingPage, setUpcomingPage] = useState(1);
  const UPCOMING_PAGE_SIZE = 5;

  const {
    status: dashboardStatus,
    error: dashboardError,
    dispatchGrid,
    upcomingRakeRows,
    reload: reloadDashboard,
  } = useDashboardData(dashboardDate);

  const eventsByRouteId = useMemo(() => {
    return dispatchGrid.events.reduce((accumulator, event) => {
      const routeKey = event.route || event.siding;
      if (!accumulator[routeKey]) {
        accumulator[routeKey] = [];
      }
      accumulator[routeKey].push(event);
      return accumulator;
    }, {});
  }, [dispatchGrid.events]);

  const sheetRows = useMemo(() => {
    return dispatchGrid.hierarchy.flatMap((siding) =>
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
  }, [dispatchGrid.hierarchy, eventsByRouteId]);

  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingRakeRows.length / UPCOMING_PAGE_SIZE));
  const upcomingPageSafe = Math.min(upcomingPage, upcomingTotalPages);
  const upcomingPageRows = useMemo(() => {
    const start = (upcomingPageSafe - 1) * UPCOMING_PAGE_SIZE;
    return upcomingRakeRows.slice(start, start + UPCOMING_PAGE_SIZE);
  }, [upcomingRakeRows, upcomingPageSafe]);
  const upcomingFrom = upcomingPageRows.length ? (upcomingPageSafe - 1) * UPCOMING_PAGE_SIZE + 1 : 0;
  const upcomingTo = upcomingPageRows.length ? upcomingFrom + upcomingPageRows.length - 1 : 0;

  useEffect(() => {
    setUpcomingPage(1);
  }, [dashboardDate, upcomingRakeRows.length]);

  return (
  <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC] text-slate-800">
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 pt-1 md:px-3">
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-2">
      <header className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
            Daily Overview
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Upcoming rakes and real-time dispatch monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={ROUTES.ADMIN.OPERATIONS_COCKPIT}
            className="inline-flex h-9 items-center rounded-lg border border-[#0f3460]/20 bg-[#0f3460] px-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0c2d5c]"
          >
            Operations Cockpit
          </Link>
          <input
            type="date"
            value={dashboardDate}
            onChange={(event) => setDashboardDate(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </header>

      {dashboardStatus === "failed" ? (
        <ApiErrorState
          error={dashboardError}
          onRetry={() => reloadDashboard()}
          title="Failed to load dashboard data"
        />
      ) : null}

      <section className="shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/30 px-4 py-3">
          <div>
            <h3 className="text-sm font-black tracking-tight text-slate-900 uppercase">Upcoming Rakes</h3>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Offered rakes not yet placed for loading
            </p>
          </div>
        </div>

        {upcomingRakeRows.length === 0 ? (
          <p className="px-4 py-5 text-center text-sm text-slate-500">No upcoming rakes for this date.</p>
        ) : (
          <div className="max-h-[168px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-slate-50/95">
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">SNO</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">RAKE NUMBER</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">ORE TYPE</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">SIDING</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">DESTINATION</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">OFFER TIME</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPageRows.map((row, index) => (
                  <tr key={row.rakeId} className={`border-b border-slate-200/70 ${index % 2 === 0 ? "bg-white" : "bg-[#fbfcfe]"}`}>
                    <td className="whitespace-nowrap px-4 py-2 text-[12px] font-bold text-slate-400">
                      {(upcomingPageSafe - 1) * UPCOMING_PAGE_SIZE + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-[12px] font-bold text-[#155eef]">{row.rakeNumber}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-[12px] font-bold text-[#0f2f67]">{row.oreType}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-[12px] font-semibold text-slate-700">{row.siding}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-[12px] font-semibold text-slate-700">{row.destination}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-[12px] font-bold text-[#155eef]">{row.placementTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {upcomingRakeRows.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
            <span>
              Showing {upcomingFrom} to {upcomingTo} of {upcomingRakeRows.length} upcoming rakes
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={upcomingPageSafe === 1}
                onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                className="rounded border border-slate-200 px-3 py-1 text-[11px] font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: upcomingTotalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setUpcomingPage(n)}
                  className={`rounded px-3 py-1 text-[11px] font-bold ${
                    n === upcomingPageSafe ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={upcomingPageSafe === upcomingTotalPages}
                onClick={() => setUpcomingPage((p) => Math.min(upcomingTotalPages, p + 1))}
                className="rounded border border-slate-200 px-3 py-1 text-[11px] font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <DispatchTimelineCard sheetRows={sheetRows} />
      </section>

      {/*
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
      */}
    </div>
    </div>
  </div>
);
}
