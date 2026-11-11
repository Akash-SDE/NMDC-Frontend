import { useEffect, useMemo, useState } from "react";
import {
  Activity, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, Scale, Search, Timer,
  Train, Truck, Zap,
} from "lucide-react";
import ApiErrorState from "../../../../components/common/ApiErrorState";
import useOperationsCockpitData from "../../../../features/dashboard/hooks/useOperationsCockpitData";

const NAVY = "#10283f"; // eslint-disable-line no-unused-vars
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const PAGE_SIZE = 5;

/* ---------- lookup tables ---------- */
const BAR_STATUS = {
  idle: { bg: "#eef2f6", label: "Siding Idle", border: "1px solid #cbd5e1" },
  loaded: { bg: "#0b91cf", label: "Under Loading" },
  delayed: { bg: "#f59e0b", label: "Load Adjustment" },
  completed: { bg: "#0e9f88", label: "Completed / Released" },
  demurrage: { bg: "#e11d48", label: "Demurraged Rake" },
  shutdown: { bg: "#94a3b8", label: "Under Shutdown" },
  awaiting: { bg: "#fef3c7", label: "Awaiting Release", text: "#92400e", border: "1px solid #f59e0b", hidden: true },
};

const KPI_ICONS = {
  loaded: Train, loading: Truck, completed: CheckCircle2, delay: Clock3,
  calendar: Train, scale: Scale, hours: Timer,
};
const KPI_ICON_TONES = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  red: "bg-rose-50 text-rose-500 ring-rose-100",
  purple: "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
};
const KPI_SUB_TONES = {
  blue: "text-blue-600", danger: "text-rose-600", amber: "text-amber-600", muted: "text-slate-400",
};
const BADGE_TONES = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
  blue: "bg-sky-100 text-sky-700",
};
const DELAY_TONES = {
  ok: "text-emerald-600", amber: "text-amber-600", danger: "text-rose-600", muted: "text-slate-500",
};
const RELEASE_STYLES = {
  Pending: "bg-amber-50 text-amber-800",
  "Awaiting Release": "bg-sky-50 text-sky-800",
  Released: "bg-emerald-50 text-emerald-800",
};
const PRODUCT_STYLES = {
  "Lump Ore": "bg-emerald-50 text-emerald-700",
  "Iron Ore Fines": "bg-sky-50 text-sky-700",
  Slimes: "bg-orange-50 text-orange-600",
  "Calibrated Lump": "bg-violet-50 text-violet-700",
};
const REMARK_TONES = { ok: "text-slate-500", warn: "text-amber-600", danger: "text-rose-600" };

/* ---------- shared ---------- */
function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,35,60,.045)] ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-2.5 py-1.5">
          <div>
            {title && <h3 className="text-[11px] font-extrabold tracking-wide text-slate-800">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[9px] text-slate-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function ProgressRing({ value, color = "#10b981" }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-8 w-8 shrink-0">
      <svg viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#e8eef3" strokeWidth="4" />
        <circle cx="20" cy="20" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)}
          strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold text-slate-700">{value}%</span>
    </div>
  );
}

/* ---------- top header (dark navy) ---------- */
function TopBar() {
  return null;
}

/* ---------- KPI / metrics ---------- */
function KpiCard({ kpi }) {
  const Icon = KPI_ICONS[kpi.icon] || Activity;
  const valueTone = kpi.tone === "red" ? "text-rose-600" : kpi.tone === "amber" ? "text-amber-700" : "text-slate-900";
  return (
    <article className="flex min-h-[72px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-[0_1px_5px_rgba(15,35,60,.04)]">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center ring-1 ${kpi.shape === "circle" ? "rounded-full" : "rounded-lg"} ${KPI_ICON_TONES[kpi.tone] || KPI_ICON_TONES.blue}`}>
          <Icon size={15} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <p className={`text-[18px] font-black leading-none tracking-tight ${valueTone}`}>{kpi.value}</p>
          <p className="mt-0.5 text-[8px] font-semibold leading-tight text-slate-500">{kpi.title}</p>
          <p className={`mt-0.5 text-[7px] font-bold ${KPI_SUB_TONES[kpi.subTone] || "text-slate-400"}`}>{kpi.sub}</p>
        </div>
      </div>
      {typeof kpi.progress === "number" && <ProgressRing value={kpi.progress} color={kpi.ring} />}
    </article>
  );
}

function normalizeSiding(siding) {
  if (Array.isArray(siding.rakes) && siding.rakes.length > 0) {
    return siding;
  }
  return {
    ...siding,
    rakeCount: 1,
    rakes: [
      {
        code: siding.code,
        progress: siding.progress,
        rakeNo: siding.rakeNo,
        customer: siding.customer,
        start: siding.start,
        completeLabel: siding.completeLabel,
        estComplete: siding.estComplete,
        delayRowLabel: siding.delayRowLabel,
        delayLabel: siding.delayLabel,
        delayTone: siding.delayTone,
        state: siding.state,
        badgeTone: siding.badgeTone,
      },
    ],
  };
}

function SidingCard({ siding: rawSiding }) {
  const siding = normalizeSiding(rawSiding);
  const [index, setIndex] = useState(0);
  const rake = siding.rakes[Math.min(index, siding.rakes.length - 1)];
  const badge = BADGE_TONES[rake.badgeTone] || BADGE_TONES.blue;
  const hasMultiple = siding.rakes.length > 1;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="h-[2px]" style={{ backgroundColor: siding.barColor }} />
      <div className="p-2">
        <div className="flex items-center justify-between gap-1">
          <h4 className="truncate text-[9px] font-extrabold text-slate-800">
            {siding.id}. {siding.name}
            {hasMultiple ? (
              <span className="ml-1 font-semibold text-slate-400">({siding.rakes.length} rakes)</span>
            ) : null}
          </h4>
          <span className={`rounded-full px-2 py-0.5 text-[7px] font-extrabold tracking-wide ${badge}`}>{rake.state}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5">
          <Train size={13} style={{ color: siding.barColor }} />
          <span className="text-[8px] font-bold text-slate-500">{rake.code}</span>
          <div className="ml-auto w-20">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${rake.progress}%`, backgroundColor: siding.barColor }} />
            </div>
          </div>
          <b className="text-[9px] text-slate-700">{rake.progress}%</b>
        </div>
        <dl className="mt-1.5 space-y-1 text-[8px]">
          <div className="flex justify-between gap-2"><dt className="text-slate-400">Rake No:</dt><dd className="font-bold text-slate-700">{rake.rakeNo}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-slate-400">Customer:</dt><dd className="truncate font-bold text-slate-700">{rake.customer}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-slate-400">Start Time:</dt><dd className="font-semibold text-slate-600">{rake.start}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-slate-400">{rake.completeLabel}</dt><dd className="font-semibold text-slate-600">{rake.estComplete}</dd></div>
        </dl>
        <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-slate-100 pt-1.5">
          <span className="text-[8px] text-slate-400">{rake.delayRowLabel}</span>
          <span className={`truncate text-[8px] font-bold ${DELAY_TONES[rake.delayTone] || "text-slate-500"}`}>{rake.delayLabel}</span>
        </div>
        {hasMultiple ? (
          <div className="mt-2 flex items-center justify-between gap-1">
            <button
              type="button"
              aria-label="Previous rake on this siding"
              onClick={() => setIndex((i) => (i - 1 + siding.rakes.length) % siding.rakes.length)}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[8px] font-semibold text-slate-500">
              Rake {index + 1} / {siding.rakes.length}
            </span>
            <button
              type="button"
              aria-label="Next rake on this siding"
              onClick={() => setIndex((i) => (i + 1) % siding.rakes.length)}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ---------- dispatch grid ---------- */
function DispatchGrid({ rows, nowHour, currentTime }) {
  const hour = nowHour ?? 0;
  const pct = h => `${(h / 24) * 100}%`;
  const legend = ["idle", "loaded", "delayed", "completed", "demurrage", "shutdown"];
  if (!rows?.length) {
    return (
      <p className="px-3 py-8 text-center text-[10px] text-slate-400">
        No dispatch activity for the selected day. Add loading records with placement times to populate the grid.
      </p>
    );
  }
  return (
    <div className="px-3 pb-3">
      <div className="mb-3 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2 text-[8px] font-semibold text-slate-500">
        <b className="tracking-wide text-slate-500">STATUS LEGEND:</b>
        {legend.map(key => (
          <span key={key} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-sm" style={{ background: BAR_STATUS[key].bg, border: BAR_STATUS[key].border }} />{BAR_STATUS[key].label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="relative min-w-[900px] overflow-hidden rounded-md border border-slate-200">
          <div className="grid grid-cols-[145px_1fr] border-b border-slate-200 bg-slate-50 text-[8px] font-bold text-slate-500">
            <div className="px-2 py-2.5">SIDING / TRACK ALLOCATION</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {HOURS.map(h => (
                <span key={h} className={`border-l border-slate-200 py-2.5 text-center ${h === Math.floor(hour) ? "bg-sky-100 text-blue-700" : ""}`}>{String(h).padStart(2, "0")}h</span>
              ))}
            </div>
          </div>

          {rows.map(row => (
            <div key={row.siding} className="grid grid-cols-[145px_1fr] border-b border-slate-100 last:border-0">
              <div className="flex flex-col justify-center px-2 py-2">
                <b className="text-[8px] text-slate-700">{row.siding}</b>
                <span className="mt-0.5 text-[7px] text-slate-400">{row.subtitle}</span>
              </div>
              <div className="relative h-[42px] border-l border-slate-200"
                style={{ backgroundImage: "repeating-linear-gradient(to right, transparent, transparent calc(100%/24 - 1px), #edf1f5 calc(100%/24 - 1px), #edf1f5 calc(100%/24))" }}>
                {row.bars.map((bar, i) => {
                  const st = BAR_STATUS[bar.status];
                  return (
                    <div key={i} title={bar.label || st.label}
                      className="absolute top-[8px] flex h-[26px] items-center justify-between gap-1 overflow-hidden rounded px-1.5 text-[7px] font-bold shadow-sm"
                      style={{ left: pct(bar.start), width: `${((bar.end - bar.start) / 24) * 100}%`, background: st.bg, color: st.text || "#fff", border: st.border }}>
                      <span className="truncate">{bar.label}</span>
                      {bar.tag && (
                        <span className={`shrink-0 rounded-sm px-1 py-0.5 text-[6.5px] leading-tight ${bar.status === "awaiting" ? "bg-amber-500 text-white" : "bg-black/20"} ${bar.tagWrap ? "w-9 whitespace-normal" : "whitespace-nowrap"}`}>{bar.tag}</span>
                      )}
                    </div>
                  );
                })}
                {(row.notes || []).map((n, i) => (
                  <span key={i}
                    className={`absolute top-1/2 -translate-y-1/2 text-[7px] italic leading-tight text-slate-400 ${n.wrap ? "w-10 whitespace-normal" : "whitespace-nowrap"}`}
                    style={{ left: pct(n.at) }}>{n.text}</span>
                ))}
              </div>
            </div>
          ))}

          {/* NOW marker */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-[145px_1fr]">
            <div />
            <div className="relative">
              <div className="absolute inset-y-0 z-10 w-[2px] bg-blue-600 shadow-[0_0_5px_#60a5fa]" style={{ left: pct(hour) }}>
                <span className="absolute -left-3 top-0 rounded-b bg-blue-600 px-1.5 py-0.5 text-[6.5px] font-bold text-white">NOW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- charts ---------- */
function ChartLegend({ items }) {
  return (
    <div className="flex items-center gap-3 text-[8px] text-slate-500">
      {items.map(i => (
        <span key={i.label} className="flex items-center gap-1">
          <i className={i.line ? "h-0.5 w-3 rounded" : "h-2 w-2 rounded-sm"} style={{ background: i.color }} />{i.label}
        </span>
      ))}
    </div>
  );
}

function MonthlyTrendChart({ monthlyTrend }) {
  const data = monthlyTrend?.length ? monthlyTrend : [{ month: "—", rakes: 0, target: 0 }];
  const MIN = 0;
  const MAX = Math.max(400, ...data.map(x => Math.max(x.rakes, x.target, 1)));
  const ticks = [0, Math.round(MAX / 4), Math.round(MAX / 2), MAX];
  const pct = v => ((v - MIN) / (MAX - MIN)) * 100;
  const n = data.length;
  const peak = Math.max(...data.map(x => x.rakes));
  const points = data.map((x, i) => `${((i + 0.5) / n) * 100},${100 - pct(x.target)}`).join(" ");
  return (
    <div className="px-2.5 pb-1.5 pt-2">
      <div className="flex">
        <div className="relative mr-1 h-[76px] w-6 shrink-0">
          {ticks.map(t => <span key={t} className="absolute right-0 translate-y-1/2 text-[7px] text-slate-400" style={{ bottom: `${pct(t)}%` }}>{t}</span>)}
        </div>
        <div className="relative h-[76px] flex-1 border-b border-slate-200">
          {ticks.map(t => <div key={t} className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ bottom: `${pct(t)}%` }} />)}
          <div className="absolute inset-0 flex items-end">
            {data.map((x, i) => {
              const strong = x.rakes === peak || i === n - 1;
              return (
                <div key={x.month} className="flex h-full flex-1 items-end justify-center">
                  <div className="relative w-[55%] rounded-t-sm" style={{ height: `${pct(x.rakes)}%`, background: strong ? "#0b78c2" : "#4aa8e8" }}>
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-sky-700">{x.rakes}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
          {data.map((x, i) => (
            <i key={x.month} className="absolute h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-500 ring-1 ring-white"
              style={{ left: `${((i + 0.5) / n) * 100}%`, bottom: `${pct(x.target)}%` }} />
          ))}
        </div>
      </div>
      <div className="ml-7 mt-1 flex">
        {data.map((x, i) => (
          <span key={x.month} className={`flex-1 text-center text-[8px] ${i === n - 1 ? "font-extrabold text-sky-700" : "font-semibold text-slate-400"}`}>{x.month}</span>
        ))}
      </div>
    </div>
  );
}

function ProductDonut({ productDispatch, totalMt }) {
  const slices = productDispatch?.length
    ? productDispatch
    : [{ label: "No data", pct: 100, mt: "0 MT", color: "#cbd5e1" }];
  const displayTotal = totalMt > 0 ? totalMt.toFixed(2) : "0";
  const gradient = slices.reduce((state, item) => {
    const start = state.total;
    state.total += item.pct;
    state.parts.push(`${item.color} ${start}% ${state.total}%`);
    return state;
  }, { total: 0, parts: [] }).parts.join(", ");
  return (
    <div className="flex items-center gap-3 p-2 pt-2">
      <div className="relative h-[76px] w-[76px] shrink-0 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-white">
          <b className="text-[13px] text-slate-800">{displayTotal}</b><span className="text-[7px] font-bold text-slate-400">MT TOTAL</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {slices.map(p => (
          <div key={p.label} className="flex flex-wrap items-baseline gap-x-1.5 text-[9px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600"><i className="h-2 w-2 rounded-sm" style={{ background: p.color }} />{p.label}</span>
            <b className="text-slate-800">{p.pct}%</b>
            <span className="text-[8px] text-slate-400">({p.mt})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidingBarChart({ sidingLoading }) {
  const data = sidingLoading?.length ? sidingLoading : [{ siding: "—", rakes: 0, tonnage: 0 }];
  const R_MAX = Math.max(120, ...data.map(s => s.rakes));
  const T_MAX = Math.max(0.6, ...data.map(s => s.tonnage), 0.1);
  const leftTicks = [0, 40, 80, 120];
  const rightTicks = [0.0, 0.2, 0.4, 0.6];
  return (
    <div className="px-2.5 pb-1.5 pt-2">
      <div className="flex">
        <div className="relative mr-1 h-[76px] w-5 shrink-0">
          {leftTicks.map(t => <span key={t} className="absolute right-0 translate-y-1/2 text-[7px] text-slate-400" style={{ bottom: `${(t / R_MAX) * 100}%` }}>{t}</span>)}
        </div>
        <div className="relative h-[76px] flex-1 border-b border-slate-200">
          {leftTicks.map(t => <div key={t} className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ bottom: `${(t / R_MAX) * 100}%` }} />)}
          <div className="absolute inset-0 flex items-end">
            {data.map(s => (
              <div key={s.siding} className="flex h-full flex-1 items-end justify-center gap-0.5">
                <div className="relative w-[28%] rounded-t-sm bg-blue-500" style={{ height: `${(s.rakes / R_MAX) * 100}%` }}>
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-bold text-blue-700">{s.rakes}</span>
                </div>
                <div className="relative w-[28%] rounded-t-sm bg-emerald-500" style={{ height: `${(s.tonnage / T_MAX) * 100}%` }}>
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-bold text-emerald-700">{s.tonnage.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative ml-1 h-[76px] w-5 shrink-0">
          {rightTicks.map(t => <span key={t} className="absolute left-0 translate-y-1/2 text-[7px] text-slate-400" style={{ bottom: `${(t / T_MAX) * 100}%` }}>{t.toFixed(1)}</span>)}
        </div>
      </div>
      <div className="mx-6 mt-1 flex">
        {data.map(s => <span key={s.siding} className="flex-1 truncate text-center text-[8px] font-semibold text-slate-500">{s.siding}</span>)}
      </div>
    </div>
  );
}

/* ---------- register helpers ---------- */
function LoadedCell({ pct }) {
  const color = pct >= 100 ? "#10b981" : pct >= 50 ? "#0ea5e9" : "#f59e0b";
  return (
    <div className="w-12">
      <div className="flex items-center gap-1 text-[9px] font-extrabold" style={{ color }}>
        {pct}%{pct < 100 && <i className="h-1 w-1 rounded-full bg-blue-500" />}
      </div>
      <div className="mt-0.5 h-[3px] overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

const TD = "border-b border-slate-100 px-2 py-1.5";

/* ---------- page ---------- */
export default function OperationsCockpitDashboard({ showHeader = true }) {
  const { status, error, bundle, dataSource, reload } = useOperationsCockpitData();
  const {
    meta,
    kpis,
    sidings,
    liveRakeRegister,
    registerTotalTracked,
    monthlyTrend,
    productDispatch,
    productDispatchTotalMt,
    sidingLoading,
  } = bundle;

  const [search, setSearch] = useState("");
  const [sidingFilter, setSidingFilter] = useState("All Sidings");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => liveRakeRegister.filter(row => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [row.rakeNo, row.customer, row.siding, row.product].some(v => String(v).toLowerCase().includes(query));
    const matchesSiding = sidingFilter === "All Sidings" || row.siding === sidingFilter;
    const matchesStatus = statusFilter === "All Status" || row.release === statusFilter;
    const matchesCustomer = customerFilter === "All Customers" || row.customer === customerFilter;
    return matchesSearch && matchesSiding && matchesStatus && matchesCustomer;
  }), [search, sidingFilter, statusFilter, customerFilter, liveRakeRegister]);

  const isUnfiltered = filteredRows.length === liveRakeRegister.length;
  const totalRecords = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = pageRows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = pageRows.length ? from + pageRows.length - 1 : 0;
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetFilter = setter => e => { setter(e.target.value); setPage(1); };

  const exportCsv = () => {
    const columns = ["sno", "rakeNo", "siding", "customer", "product", "placementDate", "placement", "start", "complete", "loadedPct", "permitH", "actualH", "delayMin", "release", "dept", "remarks"];
    const csv = [columns.join(","), ...filteredRows.map(row => columns.map(key => `"${String(row[key] ?? "").replace(/\n/g, " ").replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "live-rake-register.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const selectCls = "h-7 rounded-md border border-slate-200 bg-white px-2 text-[9px] text-slate-600";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#eef2f7] text-slate-800">
      {showHeader && <TopBar />}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 pb-2 pt-1 md:px-3">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-2">
          {status === "failed" && !bundle.isDemo ? (
            <ApiErrorState error={error} message="Could not load live cockpit data." onRetry={reload} />
          ) : null}

          {bundle.isDemo ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              <b className="font-bold">Sample dashboard data</b> — cockpit APIs failed and demo fallback is enabled.
              Redeploy with <code className="rounded bg-amber-100 px-1">VITE_COCKPIT_ALLOW_DEMO=false</code> (default)
              for production.
            </div>
          ) : bundle.isEmpty ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
              No loadings match today&apos;s cockpit window (in-progress or completed today). KPIs still reflect live
              API data. Add <b>placement time</b> on loading records to populate siding cards and the register.
            </div>
          ) : null}

          <div className="flex justify-end">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[8px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-slate-500">Target Ratio:</span>
              <b className="text-slate-800">{meta.targetRatio}</b>
              {dataSource === "live" ? (
                <span className="text-[7px] font-semibold uppercase text-emerald-600">Live</span>
              ) : null}
            </div>
          </div>

          <section className="grid grid-cols-2 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map(kpi => <KpiCard key={kpi.title} kpi={kpi} />)}
          </section>

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide text-slate-700"><Zap size={12} className="text-sky-600" />Active Siding Operations Status (Live Control Tower)</h2>
              <span className="text-[8px] font-semibold text-slate-400">{sidings.length} active track{sidings.length === 1 ? "" : "s"}</span>
            </div>
            {sidings.length ? (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-5">{sidings.map(s => <SidingCard key={`${s.id}-${s.name}`} siding={s} />)}</div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-[9px] text-slate-400">
                No sidings in loading for today. Create rakes and loading records with placement times.
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 gap-1.5 xl:grid-cols-3">
            <Panel title="Monthly Rake Loading Trend" subtitle="Actual loaded rakes vs targeted operational benchmark"
              action={<ChartLegend items={[{ label: "Rakes Loaded", color: "#1d8fe0" }, { label: "Target", color: "#f59e0b", line: true }]} />}>
              <MonthlyTrendChart monthlyTrend={monthlyTrend} />
            </Panel>
            <Panel title="Product-wise Dispatch" subtitle="Month-to-date dispatch share">
              <ProductDonut productDispatch={productDispatch} totalMt={productDispatchTotalMt} />
            </Panel>
            <Panel title="Siding-wise Rake Loading" subtitle="Total rake count vs exported tonnage"
              action={<ChartLegend items={[{ label: "Rakes", color: "#3b82f6" }, { label: "Tonnage (MT)", color: "#10b981" }]} />}>
              <SidingBarChart sidingLoading={sidingLoading} />
            </Panel>
          </section>

          <Panel
            className="min-h-0 shrink-0"
            title={<span className="flex items-center gap-2"><span className="h-3 w-0.5 rounded bg-sky-600" /><span className="text-[11px] font-extrabold text-slate-900">Live Rake Register</span><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-slate-500">{filteredRows.length} records</span></span>}
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="relative"><Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={resetFilter(setSearch)} placeholder="Search by Rake No, Customer, Pro" className="h-7 w-52 rounded-md border border-slate-200 bg-white pl-7 pr-2 text-[9px] outline-none focus:border-sky-400" /></label>
                <select value={sidingFilter} onChange={resetFilter(setSidingFilter)} className={selectCls}><option>All Sidings</option>{[...new Set(liveRakeRegister.map(x => x.siding))].map(x => <option key={x}>{x}</option>)}</select>
                <select value={statusFilter} onChange={resetFilter(setStatusFilter)} className={selectCls}><option>All Status</option><option>Pending</option><option>Awaiting Release</option><option>Released</option></select>
                <select value={customerFilter} onChange={resetFilter(setCustomerFilter)} className={selectCls}><option>All Customers</option>{[...new Set(liveRakeRegister.map(x => x.customer))].map(x => <option key={x}>{x}</option>)}</select>
                <button onClick={exportCsv} className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[9px] font-bold text-white hover:bg-emerald-700"><Download size={11} />Export CSV</button>
              </div>
            }>
            <div className="max-h-[200px] overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left text-[9px]">
                <thead className="bg-slate-50 text-[8px] font-extrabold tracking-wide text-slate-600"><tr>
                  {["S.No.", "Rake No.", "Siding", "Customer", "Product", "Placement Time", "Start Time", "Compl. Time", "Loaded (%)", "Permit (h)", "Actual (h)", "Delay (min)", "Release Status", "Dept. Time", "Remarks / Headway"].map(x => <th key={x} className="border-y border-slate-100 px-2 py-1.5">{x}</th>)}
                </tr></thead>
                <tbody>
                  {pageRows.map((row, i) => (
                    <tr key={row.rakeNo} className={i % 2 ? "bg-slate-50/70" : "bg-white"}>
                      <td className={`${TD} text-slate-400`}>{row.sno}</td>
                      <td className={`${TD} font-extrabold text-sky-700`}>{row.rakeNo}</td>
                      <td className={`${TD} font-semibold`}>{row.siding}</td>
                      <td className={`${TD} max-w-[90px]`}>{row.customer}</td>
                      <td className={TD}><span className={`inline-block max-w-[54px] rounded px-1.5 py-1 font-semibold leading-tight ${PRODUCT_STYLES[row.product] || "bg-sky-50 text-sky-700"}`}>{row.product}</span></td>
                      <td className={`${TD} tabular-nums leading-tight`}><div>{row.placementDate}</div><div>{row.placement}</div></td>
                      <td className={`${TD} tabular-nums`}>{row.start}</td>
                      <td className={`${TD} tabular-nums ${row.complete !== "—" ? "font-bold text-emerald-600" : ""}`}>{row.complete}</td>
                      <td className={TD}><LoadedCell pct={row.loadedPct} /></td>
                      <td className={`${TD} tabular-nums`}>{row.permitH}</td>
                      <td className={`${TD} font-bold tabular-nums`}>{row.actualH}</td>
                      <td className={`${TD} font-extrabold tabular-nums ${row.delayMin ? "text-rose-600" : "text-emerald-600"}`}>{row.delayMin}</td>
                      <td className={TD}><span className={`inline-block rounded px-2 py-1 text-center text-[8px] font-bold leading-tight ${row.release === "Awaiting Release" ? "max-w-[54px]" : "whitespace-nowrap"} ${RELEASE_STYLES[row.release] || "bg-slate-100 text-slate-600"}`}>{row.release}</span></td>
                      <td className={`${TD} tabular-nums`}>{row.dept}</td>
                      <td className={`${TD} max-w-[140px] whitespace-pre-line leading-tight ${REMARK_TONES[row.remarkTone] || "text-slate-500"}`}>{row.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pageRows.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  {filteredRows.length === 0 ? "No rake records match these filters." : "No more records loaded for this page."}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1.5 text-[8px] text-slate-400">
              <span>Showing {from} to {to} of {totalRecords} total rakes tracked today</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-40">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`rounded px-2.5 py-1 font-bold ${n === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"}`}>{n}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-40">Next</button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <footer className="shrink-0 flex flex-wrap items-center justify-between gap-2 bg-[#10283f] px-3 py-1.5 text-[7px] text-slate-300">
        <span><b className="text-white">NMDC BIOM Bacheli Complex</b> · Integrated Rake Dispatch &amp; Operations Control System · <b className="text-sky-300">System v4.8.2-PROD</b></span>
        <span className="flex items-center gap-1 text-emerald-300">● Railway FOIS Gateway Connected <span className="mx-2 text-slate-600">|</span> <span className="text-slate-300">SCADA Telemetry: Synced</span> <span className="mx-2 text-slate-600">|</span> <u className="text-slate-300">Control Desk SOPs</u></span>
      </footer>
    </div>
  );
}