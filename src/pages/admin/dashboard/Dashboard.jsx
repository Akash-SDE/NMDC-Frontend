import { useMemo, useState } from "react";
import { PlusIcon } from "../../../components/icons";

const metricCards = [
  {
    title: "TOTAL RAKES OFFERED",
    value: "42",
    note: "+ 12% vs yesterday",
    accent: "bg-[#15366f]",
    noteColor: "text-emerald-600",
    icon: "offer",
  },
  {
    title: "TOTAL RAKES COMPLETED",
    value: "28",
    note: "Target: 30",
    accent: "bg-[#2f79e9]",
    noteColor: "text-slate-500",
    icon: "completed",
  },
  {
    title: "TOTAL UNDER LOADING",
    value: "14",
    note: "Active Load Priority High",
    accent: "bg-[#e1a74a]",
    noteColor: "text-[#c97600]",
    icon: "loading",
  },
  {
    title: "TOTAL TONNAGE",
    value: "14,500",
    unit: "MT",
    note: "Cumulative today",
    accent: "bg-[#1f2937]",
    noteColor: "text-slate-500",
    icon: "tonnage",
  },
];

const transactionRows = [
  { ore: "D5-LUMP", total: 18, offered: 4, completed: 10, unloading: 4 },
  { ore: "D5-FINES", total: 12, offered: 4, completed: 5, unloading: 3 },
  { ore: "D10/MA", total: 7, offered: 1, completed: 4, unloading: 2 },
  { ore: "SIDING-X", total: 5, offered: 2, completed: 1, unloading: 2 },
];

const hourlySeries = [
  { hour: "08:00", lump: 55, fines: 42 },
  { hour: "10:00", lump: 68, fines: 47 },
  { hour: "12:00", lump: 74, fines: 60 },
  { hour: "14:00", lump: 66, fines: 58 },
  { hour: "16:00", lump: 61, fines: 46 },
  { hour: "18:00", lump: 49, fines: 39 },
];

const allStatusRows = [
  {
    id: "RK-7729",
    area: "SIDING-A / R14",
    wagons: "58 / 3,450T",
    status: "UNLOADING",
    eta: "14:32:05",
  },
  {
    id: "RK-8812",
    area: "SIDING-C / R09",
    wagons: "45 / 2,880T",
    status: "COMPLETED",
    eta: "14:15:33",
  },
  {
    id: "RK-7655",
    area: "SIDING-B / R22",
    wagons: "52 / 3,100T",
    status: "OFFERED",
    eta: "ETA 16:45",
  },
  {
    id: "RK-9003",
    area: "SIDING-D / R05",
    wagons: "59 / 3,520T",
    status: "COMPLETED",
    eta: "13:55:45",
  },
  {
    id: "RK-6541",
    area: "SIDING-A / R18",
    wagons: "50 / 3,200T",
    status: "COMPLETED",
    eta: "12:45:22",
  },
  {
    id: "RK-4420",
    area: "SIDING-E / R11",
    wagons: "61 / 3,680T",
    status: "OFFERED",
    eta: "11:30:18",
  },
  {
    id: "RK-3318",
    area: "SIDING-B / R03",
    wagons: "44 / 2,750T",
    status: "UNLOADING",
    eta: "14:40:10",
  },
  {
    id: "RK-2205",
    area: "SIDING-F / R27",
    wagons: "63 / 3,780T",
    status: "COMPLETED",
    eta: "10:20:55",
  },
];

const statusLegend = [
  { label: "Completed", value: "60%", color: "bg-[#2f79e9]" },
  { label: "Unloading", value: "25%", color: "bg-[#1f3d72]" },
  { label: "Offered", value: "15%", color: "bg-[#96b9ee]" },
];

function getStatusClasses(status) {
  if (status === "COMPLETED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "UNLOADING") {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-slate-200 text-slate-700";
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

function SegmentBar({ offered, completed, unloading }) {
  const total = offered + completed + unloading;
  const offeredWidth = `${(offered / total) * 100}%`;
  const completedWidth = `${(completed / total) * 100}%`;
  const unloadingWidth = `${(unloading / total) * 100}%`;

  return (
    <div className="flex h-7 overflow-hidden rounded-md bg-slate-100">
      <span className="h-full bg-[#1f3d72]" style={{ width: offeredWidth }} />
      <span className="h-full bg-[#1664bc]" style={{ width: completedWidth }} />
      <span className="h-full bg-[#4787e0]" style={{ width: unloadingWidth }} />
    </div>
  );
}

export default function Dashboard() {
  const [tablePage, setTablePage] = useState(1);

  const pageSize = 4;
  const totalPages = Math.ceil(allStatusRows.length / pageSize);
  const statusRows = useMemo(() => {
    const start = (tablePage - 1) * pageSize;
    return allStatusRows.slice(start, start + pageSize);
  }, [tablePage]);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.title} card={card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(270px,1fr)]">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[30px] font-extrabold leading-tight tracking-tight text-[#102a57]">
                Today&apos;s Transactions
              </h3>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                Distribution by Ore Type and Status
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#1f3d72]" />
                OFFERED
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#1664bc]" />
                COMPLETED
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#4787e0]" />
                UNLOADING
              </span>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {transactionRows.map((row) => (
              <div key={row.ore}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-bold text-[#102a57]">{row.ore}</p>
                  <p className="text-[13px] font-bold text-[#0f2f67]">{row.total} Rakes</p>
                </div>
                <SegmentBar
                  offered={row.offered}
                  completed={row.completed}
                  unloading={row.unloading}
                />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-[24px] font-extrabold leading-tight text-[#102a57]">Hourly Wagon Count</h3>
          <p className="text-[11px] font-bold tracking-[0.08em] text-slate-500">LUMP VS FINES PRODUCTION</p>

          <div className="relative mt-4 h-65 rounded-lg border border-slate-100 bg-[#fafbfe] p-3">
            <div className="absolute inset-x-3 top-8 h-px bg-slate-200" />
            <div className="absolute inset-x-3 top-1/2 h-px bg-slate-200" />
            <div className="absolute inset-x-3 bottom-10 h-px bg-slate-200" />

            <div className="flex h-full items-end gap-2 pb-3">
              {hourlySeries.map((item) => (
                <div key={item.hour} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <div className="flex w-full items-end justify-center gap-1">
                    <span className="w-2 rounded-t bg-[#1f3d72]" style={{ height: `${item.lump}px` }} />
                    <span className="w-2 rounded-t bg-[#4787e0]" style={{ height: `${item.fines}px` }} />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400">{item.hour.slice(0, 2)}:00</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#1f3d72]" />
                LUMP WAGONS
              </span>
              <span className="font-bold text-[#0f2f67]">1,240</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#4787e0]" />
                FINES WAGONS
              </span>
              <span className="font-bold text-[#0f2f67]">892</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(270px,1fr)]">
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-[15px] font-extrabold uppercase tracking-[0.03em] text-[#102a57]">
              Current Rake Status Detail
            </h3>
            <button
              type="button"
              className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#2f79e9] hover:text-[#1454a8]"
            >
              Download Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-175 w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-[#f8fafd]">
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Rake ID
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Operational Area
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Wagons
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    ETA/Completion
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusRows.map((row) => (
                  <tr key={`${row.id}-${row.eta}`} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-[12px] font-bold text-[#0f2f67]">{row.id}</td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">{row.area}</td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#0f2f67]">{row.wagons}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold tracking-[0.06em] ${getStatusClasses(
                          row.status,
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-semibold text-slate-600">{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
              Showing {(tablePage - 1) * pageSize + 1}-{Math.min(tablePage * pageSize, allStatusRows.length)} of {allStatusRows.length} rakes
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={tablePage === 1}
                onClick={() => setTablePage((prev) => Math.max(prev - 1, 1))}
                className="rounded border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={tablePage === totalPages}
                onClick={() => setTablePage((prev) => Math.min(prev + 1, totalPages))}
                className="rounded border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[26px] font-extrabold leading-tight text-[#102a57]">Status Distribution</h3>
              <p className="text-[11px] font-medium text-slate-500">Global Rake Lifecycle (%)</p>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2f79e9] text-white shadow-sm hover:bg-[#1f64c2]"
              aria-label="Add"
            >
              <PlusIcon size={16} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div
              className="relative h-42.5 w-42.5 rounded-full"
              style={{
                background:
                  "conic-gradient(#2f79e9 0 60%, #1f3d72 60% 85%, #96b9ee 85% 100%)",
              }}
            >
              <div className="absolute inset-4.75 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-[40px] font-extrabold leading-none text-[#102a57]">42</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">Total Rakes</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {statusLegend.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[12px]">
                <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </span>
                <span className="font-bold text-[#0f2f67]">{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
