import { useState } from "react";
import {
  routesData,
  routesStats,
  routesMeta,
} from "../../../data/adminmasterdatafiles/routes";
import SearchBar from "../../../components/shared/SearchBar";
import StatusBadge from "../../../components/shared/StatusBadge";
import Pagination from "../../../components/shared/Pagination";
import { PlusIcon } from "../../../components/icons";

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="3xl:w-5 3xl:h-5"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="3xl:w-5 3xl:h-5"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

const statColorMap = {
  blue: { bg: "bg-brand-50", icon: "text-brand-600" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  yellow: { bg: "bg-amber-50", icon: "text-amber-600" },
};

const statIconMap = {
  route: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  warning: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
};

export default function RouteMaster() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = routesData.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900">
            {routesMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {routesMeta.subtitle}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start">
          <PlusIcon />
          <span>{routesMeta.addLabel}</span>
        </button>
      </div>

      {/* Search + Export/Print */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md 3xl:max-w-lg">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={routesMeta.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-2.5 3xl:py-3 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
              />
            </div>
            <button className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 3xl:gap-3">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 3xl:px-5 3xl:py-3 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-medium text-slate-600 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
            Export CSV
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 3xl:px-5 3xl:py-3 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-medium text-slate-600 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
            Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-subtle bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Route Code
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Route Name
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden sm:table-cell">
                  Source Siding
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Destination
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  Distance (KM)
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((route) => (
                <tr
                  key={route.code}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-600">
                      {route.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                      {route.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] text-slate-600">
                      {route.sourceSiding}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] text-slate-600">
                      {route.destination}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                      {route.distance}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={route.status} showDot={false} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <EditIcon />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            totalCount={routesMeta.totalCount}
            pageSize={routesMeta.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 3xl:gap-6 5xl:gap-8">
        {routesStats.map((stat) => {
          const colors = statColorMap[stat.color] || statColorMap.blue;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={colors.icon}>{statIconMap[stat.icon]}</span>
                <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {stat.label}
                </p>
              </div>
              <p className="text-[26px] 3xl:text-[32px] 5xl:text-[42px] font-bold text-brand-900">
                {stat.value}
              </p>
              {stat.description && (
                <p className="mt-1 text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400">
                  {stat.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
