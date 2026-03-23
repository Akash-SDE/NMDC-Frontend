import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pagination from "../../../components/shared/Pagination";

// ─── Data ────────────────────────────────────────────────────────────────────
const rakeTransactions = [
  {
    rakeId: "RK-24031",
    oreType: "Lump Ore",
    entryTime: "2026-03-24T05:10:00",
    exitTime: null,
    status: "in-progress",
  },
  {
    rakeId: "RK-24032",
    oreType: "Fines",
    entryTime: "2026-03-24T06:00:00",
    exitTime: null,
    status: "delay",
  },
  {
    rakeId: "RK-24033",
    oreType: "Pellets",
    entryTime: "2026-03-24T06:20:00",
    exitTime: null,
    status: "ready",
  },
  {
    rakeId: "RK-24034",
    oreType: "Lump Ore",
    entryTime: "2026-03-24T01:15:00",
    exitTime: "2026-03-24T03:05:00",
    status: "dispatched",
  },
  {
    rakeId: "RK-24035",
    oreType: "Sinter Feed",
    entryTime: "2026-03-24T02:00:00",
    exitTime: "2026-03-24T04:00:00",
    status: "dispatched",
  },
  {
    rakeId: "RK-24036",
    oreType: "Fines",
    entryTime: "2026-03-24T04:15:00",
    exitTime: null,
    status: "in-progress",
  },
  {
    rakeId: "RK-24037",
    oreType: "Calibrated Ore",
    entryTime: "2026-03-24T03:50:00",
    exitTime: null,
    status: "delay",
  },
  {
    rakeId: "RK-24038",
    oreType: "Pellets",
    entryTime: "2026-03-24T00:50:00",
    exitTime: null,
    status: "ready",
  },
  {
    rakeId: "RK-24039",
    oreType: "Lump Ore",
    entryTime: "2026-03-24T07:35:00",
    exitTime: null,
    status: "in-progress",
  },
  {
    rakeId: "RK-24040",
    oreType: "Mixed Ore",
    entryTime: "2026-03-24T07:40:00",
    exitTime: null,
    status: "ready",
  },
  {
    rakeId: "RK-24041",
    oreType: "Fines",
    entryTime: "2026-03-24T07:45:00",
    exitTime: null,
    status: "delay",
  },
  {
    rakeId: "RK-24042",
    oreType: "Sinter Feed",
    entryTime: "2026-03-24T07:50:00",
    exitTime: null,
    status: "in-progress",
  },
];

const statusConfig = {
  "in-progress": {
    label: "In Progress",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: (
      <svg
        className="w-4 h-4 3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    ),
  },
  delay: {
    label: "Delayed",
    classes: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: (
      <svg
        className="w-4 h-4 3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  ready: {
    label: "Ready",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: (
      <svg
        className="w-4 h-4 3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  dispatched: {
    label: "Dispatched",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: (
      <svg
        className="w-4 h-4 3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

const sortableColumns = [
  { key: "rakeId", label: "Rake ID" },
  { key: "oreType", label: "Ore Type" },
  { key: "entryTime", label: "Entry Time" },
  { key: "exitTime", label: "Exit Time" },
  { key: "status", label: "Status" },
  { key: "duration", label: "Duration" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getDurationMs(entryTime, exitTime) {
  const start = new Date(entryTime).getTime();
  const end = exitTime ? new Date(exitTime).getTime() : Date.now();
  return Math.max(0, end - start);
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const duration = 600;
    const stepTime = Math.max(Math.floor(duration / end), 30);
    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Live duration cell ──────────────────────────────────────────────────────
function LiveDuration({ entryTime, exitTime }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (exitTime) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [exitTime]);

  const ms = getDurationMs(entryTime, exitTime);
  const isLong = ms > 3 * 3600_000; // > 3 hours

  return (
    <span
      className={`font-semibold tabular-nums ${isLong ? "text-red-600" : "text-slate-700"}`}
    >
      {formatDuration(ms)}
      {!exitTime && (
        <span className="inline-block ml-1.5 w-1.5 h-1.5 3xl:w-2 3xl:h-2 rounded-full bg-blue-500 animate-pulse align-middle" />
      )}
    </span>
  );
}

// ─── Sort arrow icon ─────────────────────────────────────────────────────────
function SortIcon({ direction }) {
  if (!direction)
    return (
      <svg
        className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-slate-300 ml-1 inline-block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  return (
    <svg
      className={`w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-brand-600 ml-1 inline-block transition-transform ${direction === "desc" ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [, setTick] = useState(0);

  const pageSize = 8;
  const now = new Date();

  // Live clock tick every minute for stats
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { "in-progress": 0, delay: 0, ready: 0, dispatched: 0 };
    let todaysTransactions = 0;
    let hourlyWagonCount = 0;

    for (const item of rakeTransactions) {
      counts[item.status] = (counts[item.status] || 0) + 1;
      const entry = new Date(item.entryTime);
      if (isSameDay(entry, now)) {
        todaysTransactions++;
        if (entry.getHours() === now.getHours()) hourlyWagonCount++;
      }
    }

    return [
      {
        title: "In-Progress Rakes",
        value: counts["in-progress"],
        tone: "text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100/60 border-blue-200",
        iconBg: "bg-blue-100",
        icon: (
          <svg
            className="w-5 h-5 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      {
        title: "Delayed Rakes",
        value: counts.delay,
        tone: "text-red-700 bg-gradient-to-br from-red-50 to-red-100/60 border-red-200",
        iconBg: "bg-red-100",
        icon: (
          <svg
            className="w-5 h-5 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        title: "Ready Rakes",
        value: counts.ready,
        tone: "text-amber-700 bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-200",
        iconBg: "bg-amber-100",
        icon: (
          <svg
            className="w-5 h-5 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        title: "Dispatched Rakes",
        value: counts.dispatched,
        tone: "text-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200",
        iconBg: "bg-emerald-100",
        icon: (
          <svg
            className="w-5 h-5 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      },
      {
        title: "Today's Transactions",
        value: todaysTransactions,
        tone: "text-violet-700 bg-gradient-to-br from-violet-50 to-violet-100/60 border-violet-200",
        iconBg: "bg-violet-100",
        icon: (
          <svg
            className="w-5 h-5 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        title: "Hourly Wagon Count",
        value: hourlyWagonCount,
        tone: "text-cyan-700 bg-gradient-to-br from-cyan-50 to-cyan-100/60 border-cyan-200",
        iconBg: "bg-cyan-100",
        icon: (
          <svg
            className="w-5 h-5 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7 text-cyan-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
    ];
  }, []);

  // ── Filtered + sorted data ───────────────────────────────────────────────
  const processedRows = useMemo(() => {
    let rows = [...rakeTransactions];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.rakeId.toLowerCase().includes(q) ||
          r.oreType.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortKey) {
      rows.sort((a, b) => {
        let valA, valB;

        switch (sortKey) {
          case "rakeId":
            valA = a.rakeId;
            valB = b.rakeId;
            break;
          case "oreType":
            valA = a.oreType;
            valB = b.oreType;
            break;
          case "entryTime":
            valA = new Date(a.entryTime).getTime();
            valB = new Date(b.entryTime).getTime();
            break;
          case "exitTime":
            valA = a.exitTime ? new Date(a.exitTime).getTime() : 0;
            valB = b.exitTime ? new Date(b.exitTime).getTime() : 0;
            break;
          case "status":
            valA = a.status;
            valB = b.status;
            break;
          case "duration":
            valA = getDurationMs(a.entryTime, a.exitTime);
            valB = getDurationMs(b.entryTime, b.exitTime);
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [searchQuery, sortKey, sortDir]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalCount = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedRows = processedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortKey, sortDir]);

  // ── Sort handler ─────────────────────────────────────────────────────────
  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10 3xl:px-14 3xl:py-10 5xl:px-20 5xl:py-14 space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] 3xl:text-[28px] 5xl:text-[36px] font-bold text-brand-900 tracking-tight">
            Rake Dashboard
          </h1>
          <p className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-500 mt-0.5">
            Real-time overview of rake operations and transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-500">
            <span className="relative flex h-2 w-2 3xl:h-2.5 3xl:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 3xl:h-2.5 3xl:w-2.5 bg-emerald-500" />
            </span>
            Live
          </span>
          <span className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400 hidden sm:inline">
            · Last updated{" "}
            {now.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 3xl:gap-5 5xl:gap-7">
        {stats.map((card) => (
          <div
            key={card.title}
            className={`group relative rounded-xl border p-4 3xl:p-6 5xl:p-8 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default ${card.tone}`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-semibold uppercase tracking-[0.06em] leading-tight">
                {card.title}
              </p>
              <span
                className={`shrink-0 rounded-lg p-1.5 3xl:p-2 ${card.iconBg} opacity-80 group-hover:opacity-100 transition-opacity`}
              >
                {card.icon}
              </span>
            </div>
            <p className="mt-3 text-[28px] 3xl:text-[36px] 5xl:text-[48px] font-bold leading-none tabular-nums">
              <AnimatedNumber value={card.value} />
            </p>
          </div>
        ))}
      </section>

      {/* ── Table section ───────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border-subtle bg-card shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="px-5 py-4 3xl:px-6 3xl:py-5 border-b border-slate-100 bg-slate-50/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-[18px] 3xl:text-[22px] 5xl:text-[28px] font-bold text-brand-900">
              Rake Transactions
            </h3>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 3xl:w-5 3xl:h-5 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search rake ID or ore type…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 3xl:w-80 pl-9 3xl:pl-11 pr-4 py-2 3xl:py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-brand-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40">
                {sortableColumns.map((col) => {
                  const isHiddenMd = col.key === "entryTime";
                  const isHiddenLg = col.key === "exitTime";
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase cursor-pointer select-none hover:text-slate-700 transition-colors group/th ${
                        isHiddenMd
                          ? "hidden md:table-cell"
                          : isHiddenLg
                            ? "hidden lg:table-cell"
                            : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {col.label}
                        <SortIcon
                          direction={sortKey === col.key ? sortDir : null}
                        />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 3xl:py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-10 h-10 3xl:w-12 3xl:h-12 5xl:w-14 5xl:h-14 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-medium text-slate-400">
                        No transactions found
                      </p>
                      <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, index) => {
                  const status = statusConfig[row.status] || statusConfig.delay;
                  return (
                    <tr
                      key={row.rakeId}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                      style={{
                        animationDelay: `${index * 30}ms`,
                      }}
                    >
                      <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                        <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-brand-600">
                          {row.rakeId}
                        </span>
                      </td>
                      <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                        <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-medium text-brand-900">
                          {row.oreType}
                        </span>
                      </td>
                      <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden md:table-cell text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-700">
                        {formatDateTime(row.entryTime)}
                      </td>
                      <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden lg:table-cell text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-700">
                        {formatDateTime(row.exitTime)}
                      </td>
                      <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 3xl:px-3 3xl:py-1.5 5xl:px-4 5xl:py-2 text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-semibold ${status.classes}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 3xl:w-2 3xl:h-2 rounded-full ${status.dot} ${
                              row.status === "in-progress"
                                ? "animate-pulse"
                                : ""
                            }`}
                          />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 3xl:px-6 3xl:py-5 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
                        <LiveDuration
                          entryTime={row.entryTime}
                          exitTime={row.exitTime}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination + summary */}
        <div className="px-5 py-4 3xl:px-6 3xl:py-5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>
            –
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">{totalCount}</span>{" "}
            transactions
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </div>
  );
}
