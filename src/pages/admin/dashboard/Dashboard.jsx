import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/shared/Pagination";

// ─── Data ────────────────────────────────────────────────────────────────────
const rakeTransactions = [
  {
    rakeNumber: "RK-7729",
    oreType: "LUMPS-62",
    sidingRoute: "SIDING-A / R14",
    wagonCount: 58,
    totalWeight: "3,450T",
    customer: "METALS-CO",
    destination: "PORT-A",
    offerTime: "10:15",
    completionTime: "14:32",
    feedRate: 850,
    updatedAt: "14:32:05",
    status: "in-progress",
    lagSeconds: 252,
  },
  {
    rakeNumber: "RK-8812",
    oreType: "FINES-58",
    sidingRoute: "SIDING-C / R09",
    wagonCount: 45,
    totalWeight: "2,880T",
    customer: "GLOBAL-ORE",
    destination: "STOCKPILE-2",
    offerTime: "11:00",
    completionTime: "14:15",
    feedRate: 720,
    updatedAt: "14:15:33",
    status: "ready",
    lagSeconds: 45,
  },
  {
    rakeNumber: "RK-7655",
    oreType: "LUMPS-65",
    sidingRoute: "SIDING-B / R22",
    wagonCount: 52,
    totalWeight: "3,100T",
    customer: "STEEL-IND",
    destination: "EAST-JUNCT",
    offerTime: "09:45",
    completionTime: "14:02",
    feedRate: 680,
    updatedAt: "14:02:10",
    status: "delayed",
    lagSeconds: 1338,
  },
  {
    rakeNumber: "RK-9003",
    oreType: "PELLET-67",
    sidingRoute: "SIDING-D / R05",
    wagonCount: 59,
    totalWeight: "3,520T",
    customer: "IRON-CORE",
    destination: "FURNACE-4",
    offerTime: "12:20",
    completionTime: "13:55",
    feedRate: 910,
    updatedAt: "13:55:45",
    status: "ready",
    lagSeconds: 75,
  },
  {
    rakeNumber: "RK-6541",
    oreType: "FINES-60",
    sidingRoute: "SIDING-A / R18",
    wagonCount: 50,
    totalWeight: "3,200T",
    customer: "TATA-STL",
    destination: "YARD-7",
    offerTime: "08:30",
    completionTime: "12:45",
    feedRate: 790,
    updatedAt: "12:45:22",
    status: "cleared",
    lagSeconds: 0,
  },
  {
    rakeNumber: "RK-4420",
    oreType: "LUMPS-70",
    sidingRoute: "SIDING-E / R11",
    wagonCount: 61,
    totalWeight: "3,680T",
    customer: "JSW-STEEL",
    destination: "PORT-B",
    offerTime: "07:00",
    completionTime: "11:30",
    feedRate: 830,
    updatedAt: "11:30:18",
    status: "cleared",
    lagSeconds: 0,
  },
  {
    rakeNumber: "RK-3318",
    oreType: "SINTER-55",
    sidingRoute: "SIDING-B / R03",
    wagonCount: 44,
    totalWeight: "2,750T",
    customer: "SAIL-IND",
    destination: "STOCKPILE-5",
    offerTime: "13:00",
    completionTime: "—",
    feedRate: 640,
    updatedAt: "14:40:10",
    status: "in-progress",
    lagSeconds: 185,
  },
  {
    rakeNumber: "RK-2205",
    oreType: "PELLET-72",
    sidingRoute: "SIDING-F / R27",
    wagonCount: 63,
    totalWeight: "3,780T",
    customer: "VEDANTA",
    destination: "FURNACE-2",
    offerTime: "06:45",
    completionTime: "10:20",
    feedRate: 950,
    updatedAt: "10:20:55",
    status: "cleared",
    lagSeconds: 0,
  },
  {
    rakeNumber: "RK-1190",
    oreType: "FINES-48",
    sidingRoute: "SIDING-C / R15",
    wagonCount: 38,
    totalWeight: "2,400T",
    customer: "NMDC-LTD",
    destination: "WEST-YARD",
    offerTime: "14:00",
    completionTime: "—",
    feedRate: 560,
    updatedAt: "14:38:42",
    status: "delayed",
    lagSeconds: 2580,
  },
  {
    rakeNumber: "RK-5567",
    oreType: "LUMPS-58",
    sidingRoute: "SIDING-A / R08",
    wagonCount: 55,
    totalWeight: "3,300T",
    customer: "HINDALCO",
    destination: "PORT-C",
    offerTime: "11:30",
    completionTime: "14:50",
    feedRate: 770,
    updatedAt: "14:50:30",
    status: "ready",
    lagSeconds: 32,
  },
  {
    rakeNumber: "RK-6789",
    oreType: "SINTER-62",
    sidingRoute: "SIDING-D / R19",
    wagonCount: 47,
    totalWeight: "2,950T",
    customer: "AMNS-IND",
    destination: "STOCKPILE-1",
    offerTime: "09:00",
    completionTime: "13:10",
    feedRate: 700,
    updatedAt: "13:10:15",
    status: "cleared",
    lagSeconds: 0,
  },
  {
    rakeNumber: "RK-8901",
    oreType: "PELLET-80",
    sidingRoute: "SIDING-E / R30",
    wagonCount: 65,
    totalWeight: "3,900T",
    customer: "STEEL-IND",
    destination: "FURNACE-1",
    offerTime: "13:45",
    completionTime: "—",
    feedRate: 980,
    updatedAt: "14:42:08",
    status: "in-progress",
    lagSeconds: 410,
  },
];

// ─── Status config ───────────────────────────────────────────────────────────
const statusConfig = {
  "in-progress": {
    label: "IN PROGRESS",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  ready: {
    label: "READY",
    bg: "bg-teal-100",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  delayed: {
    label: "DELAYED",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  cleared: {
    label: "CLEARED",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

const legendItems = [
  { key: "in-progress", label: "IN TRANSIT", color: "bg-blue-500" },
  { key: "cleared", label: "CLEARED", color: "bg-emerald-500" },
  { key: "ready", label: "READY", color: "bg-teal-500" },
  { key: "delayed", label: "DELAYED", color: "bg-red-500" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatLag(totalSeconds) {
  if (totalSeconds <= 0) return "0m 0s";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

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

  return <span>{display}</span>;
}

// ─── Sort arrow icon ─────────────────────────────────────────────────────────
function SortIcon({ direction }) {
  if (!direction)
    return (
      <svg
        className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 text-slate-300 ml-1 inline-block shrink-0"
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
      className={`w-3 h-3 3xl:w-3.5 3xl:h-3.5 text-blue-600 ml-1 inline-block shrink-0 transition-transform ${
        direction === "desc" ? "rotate-180" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

// ─── Live lag cell ───────────────────────────────────────────────────────────
function LiveLag({ lagSeconds, status }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status === "cleared") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const totalSec = status === "cleared" ? 0 : lagSeconds + elapsed;
  const isHigh = totalSec > 600;

  return (
    <span
      className={`font-bold tabular-nums text-[13px] 3xl:text-[15px] 5xl:text-[19px] ${
        isHigh ? "text-red-600" : "text-blue-800"
      }`}
    >
      {formatLag(totalSec)}
    </span>
  );
}

// ─── Live clock hook ─────────────────────────────────────────────────────────
function useLiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

// ─── Column definitions ─────────────────────────────────────────────────────
const columns = [
  { key: "rakeNumber", label: "RAKE_NUMBER" },
  { key: "oreType", label: "ORE_TYPE" },
  { key: "sidingRoute", label: "SIDING/ROUTE", hiddenBelow: "md" },
  { key: "wagonCount", label: "WAGON/COUNT" },
  { key: "customer", label: "CUSTOMER", hiddenBelow: "lg" },
  { key: "destination", label: "DESTINATION", hiddenBelow: "lg" },
  { key: "offerTime", label: "OFFER_TIME", hiddenBelow: "md" },
  { key: "completionTime", label: "COMPLETION_TIME", hiddenBelow: "md" },
  { key: "feedRate", label: "FEED_RATE", hiddenBelow: "xl" },
  { key: "updatedAt", label: "UPDATED_AT", hiddenBelow: "xl" },
  { key: "status", label: "STATUS" },
  { key: "lag", label: "LAG" },
];

// ─── Main dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const pageSize = 10;
  const liveTime = useLiveClock();

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { "in-progress": 0, delayed: 0, ready: 0, cleared: 0 };
    let totalWagons = 0;
    let totalFeedRate = 0;

    for (const item of rakeTransactions) {
      counts[item.status] = (counts[item.status] || 0) + 1;
      totalWagons += item.wagonCount;
      totalFeedRate += item.feedRate;
    }

    const avgFeedRate = Math.round(totalFeedRate / rakeTransactions.length);

    return [
      {
        title: "In-Progress",
        value: counts["in-progress"],
        gradient: "from-blue-500 to-blue-600",
        lightBg: "bg-blue-400/20",
        icon: (
          <svg
            className="w-6 h-6 3xl:w-7 3xl:h-7 5xl:w-8 5xl:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
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
        title: "Delayed",
        value: counts.delayed,
        gradient: "from-red-500 to-rose-600",
        lightBg: "bg-red-400/20",
        icon: (
          <svg
            className="w-6 h-6 3xl:w-7 3xl:h-7 5xl:w-8 5xl:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
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
        title: "Ready",
        value: counts.ready,
        gradient: "from-amber-500 to-orange-500",
        lightBg: "bg-amber-400/20",
        icon: (
          <svg
            className="w-6 h-6 3xl:w-7 3xl:h-7 5xl:w-8 5xl:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
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
        title: "Cleared",
        value: counts.cleared,
        gradient: "from-emerald-500 to-green-600",
        lightBg: "bg-emerald-400/20",
        icon: (
          <svg
            className="w-6 h-6 3xl:w-7 3xl:h-7 5xl:w-8 5xl:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
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
        title: "Total Wagons",
        value: totalWagons,
        gradient: "from-violet-500 to-purple-600",
        lightBg: "bg-violet-400/20",
        icon: (
          <svg
            className="w-6 h-6 3xl:w-7 3xl:h-7 5xl:w-8 5xl:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
      },
      {
        title: "Avg Feed Rate",
        value: avgFeedRate,
        suffix: " T/H",
        gradient: "from-cyan-500 to-teal-600",
        lightBg: "bg-cyan-400/20",
        icon: (
          <svg
            className="w-6 h-6 3xl:w-7 3xl:h-7 5xl:w-8 5xl:h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
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

  // ── Filtered + sorted data ─────────────────────────────────────────────
  const processedRows = useMemo(() => {
    let rows = [...rakeTransactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.rakeNumber.toLowerCase().includes(q) ||
          r.oreType.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q),
      );
    }

    if (sortKey) {
      rows.sort((a, b) => {
        let valA, valB;
        switch (sortKey) {
          case "rakeNumber":
            valA = a.rakeNumber;
            valB = b.rakeNumber;
            break;
          case "oreType":
            valA = a.oreType;
            valB = b.oreType;
            break;
          case "sidingRoute":
            valA = a.sidingRoute;
            valB = b.sidingRoute;
            break;
          case "wagonCount":
            valA = a.wagonCount;
            valB = b.wagonCount;
            break;
          case "customer":
            valA = a.customer;
            valB = b.customer;
            break;
          case "destination":
            valA = a.destination;
            valB = b.destination;
            break;
          case "offerTime":
            valA = a.offerTime;
            valB = b.offerTime;
            break;
          case "completionTime":
            valA = a.completionTime;
            valB = b.completionTime;
            break;
          case "feedRate":
            valA = a.feedRate;
            valB = b.feedRate;
            break;
          case "updatedAt":
            valA = a.updatedAt;
            valB = b.updatedAt;
            break;
          case "status":
            valA = a.status;
            valB = b.status;
            break;
          case "lag":
            valA = a.lagSeconds;
            valB = b.lagSeconds;
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

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalCount = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedRows = processedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortKey, sortDir]);

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

  const hiddenClass = (hiddenBelow) => {
    if (!hiddenBelow) return "";
    const map = {
      sm: "hidden sm:table-cell",
      md: "hidden md:table-cell",
      lg: "hidden lg:table-cell",
      xl: "hidden xl:table-cell",
    };
    return map[hiddenBelow] || "";
  };

  // ── Render cell content ────────────────────────────────────────────────
  const renderCell = (row, colKey) => {
    switch (colKey) {
      case "rakeNumber":
        return (
          <span className="font-bold text-blue-800 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.rakeNumber}
          </span>
        );
      case "oreType":
        return (
          <span className="font-semibold text-slate-800 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.oreType}
          </span>
        );
      case "sidingRoute":
        return (
          <span className="text-slate-600 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.sidingRoute}
          </span>
        );
      case "wagonCount":
        return (
          <span className="font-bold text-green-700 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.wagonCount} / {row.totalWeight}
          </span>
        );
      case "customer":
        return (
          <span className="font-medium text-slate-700 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.customer}
          </span>
        );
      case "destination":
        return (
          <span className="font-medium text-slate-700 text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.destination}
          </span>
        );
      case "offerTime":
        return (
          <span className="text-slate-700 tabular-nums text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.offerTime}
          </span>
        );
      case "completionTime":
        return (
          <span className="text-slate-700 tabular-nums text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.completionTime}
          </span>
        );
      case "feedRate":
        return (
          <span className="font-bold text-blue-800 tabular-nums text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.feedRate}{" "}
            <span className="text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-semibold">
              T/H
            </span>
          </span>
        );
      case "updatedAt":
        return (
          <span className="text-slate-600 tabular-nums text-[13px] 3xl:text-[15px] 5xl:text-[19px]">
            {row.updatedAt}
          </span>
        );
      case "status": {
        const cfg = statusConfig[row.status] || statusConfig["in-progress"];
        return (
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 3xl:px-3 3xl:py-1.5 5xl:px-4 5xl:py-2 text-[11px] 3xl:text-[13px] 5xl:text-[16px] font-bold tracking-wide whitespace-nowrap ${cfg.bg} ${cfg.text}`}
          >
            {cfg.label}
          </span>
        );
      }
      case "lag":
        return <LiveLag lagSeconds={row.lagSeconds} status={row.status} />;
      default:
        return null;
    }
  };

  const formattedTime = liveTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = liveTime.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10 3xl:px-14 3xl:py-10 5xl:px-20 5xl:py-14 space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] 3xl:text-[28px] 5xl:text-[36px] font-bold text-brand-900 tracking-tight">
            Rake Dashboard
          </h1>
          <p className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-500 mt-0.5">
            Real-time overview of rake operations and transactions
          </p>
        </div>

        {/* Live clock */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 3xl:px-5 3xl:py-3 5xl:px-6 5xl:py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 3xl:h-3 3xl:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 3xl:h-3 3xl:w-3 bg-emerald-500" />
            </span>
            <span className="text-[12px] 3xl:text-[14px] 5xl:text-[17px] font-semibold text-emerald-600 uppercase tracking-wide">
              Live
            </span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-right">
            <p className="text-[15px] 3xl:text-[18px] 5xl:text-[22px] font-bold text-slate-800 tabular-nums leading-tight">
              {formattedTime}
            </p>
            <p className="text-[11px] 3xl:text-[13px] 5xl:text-[16px] text-slate-400 leading-tight">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 3xl:gap-5 5xl:gap-7">
        {stats.map((card) => (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 3xl:p-7 5xl:p-9 text-white shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default`}
          >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 w-20 h-20 3xl:w-24 3xl:h-24 5xl:w-28 5xl:h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 3xl:w-20 3xl:h-20 5xl:w-24 5xl:h-24 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-xl p-2 3xl:p-2.5 5xl:p-3 ${card.lightBg} backdrop-blur-sm`}
                >
                  {card.icon}
                </span>
              </div>

              <p className="mt-4 3xl:mt-5 text-[32px] 3xl:text-[40px] 5xl:text-[52px] font-extrabold leading-none tabular-nums tracking-tight">
                <AnimatedNumber value={card.value} />
                {card.suffix && (
                  <span className="text-[14px] 3xl:text-[18px] 5xl:text-[24px] font-semibold ml-1 opacity-80">
                    {card.suffix}
                  </span>
                )}
              </p>

              <p className="mt-1.5 3xl:mt-2 text-[12px] 3xl:text-[14px] 5xl:text-[17px] font-semibold uppercase tracking-[0.08em] text-white/80">
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Table section ──────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Title row + legend */}
        <div className="px-5 py-4 3xl:px-7 3xl:py-5 5xl:px-9 5xl:py-7 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 className="text-[20px] 3xl:text-[24px] 5xl:text-[30px] font-bold text-slate-800">
            Active Rake Log &amp; Clearances
          </h3>
          <div className="flex items-center gap-4 3xl:gap-5 5xl:gap-6 flex-wrap">
            {legendItems.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1.5 text-[12px] 3xl:text-[14px] 5xl:text-[17px] font-semibold text-slate-600"
              >
                <span
                  className={`w-3 h-3 3xl:w-3.5 3xl:h-3.5 5xl:w-4 5xl:h-4 rounded-full ${item.color}`}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Search toolbar */}
        <div className="px-5 py-3 3xl:px-7 3xl:py-4 5xl:px-9 5xl:py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
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
              placeholder="Search rake, ore, customer…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 3xl:pl-11 pr-4 py-2 3xl:py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-4 py-3.5 3xl:px-5 3xl:py-4 5xl:px-6 5xl:py-5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[16px] font-bold tracking-[0.08em] text-slate-500 uppercase cursor-pointer select-none hover:text-slate-700 transition-colors whitespace-nowrap ${hiddenClass(col.hiddenBelow)}`}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-16 3xl:py-20 text-center"
                  >
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
                        No rakes found
                      </p>
                      <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.rakeNumber}
                    className="hover:bg-blue-50/40 transition-colors duration-100"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-4 3xl:px-5 3xl:py-5 5xl:px-6 5xl:py-6 whitespace-nowrap ${hiddenClass(col.hiddenBelow)}`}
                      >
                        {renderCell(row, col.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 3xl:px-7 3xl:py-5 5xl:px-9 5xl:py-6 border-t border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-600 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-bold text-slate-800">{totalCount}</span>{" "}
            rakes
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
