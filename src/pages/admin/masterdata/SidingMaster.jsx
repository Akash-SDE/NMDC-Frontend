import { useState } from "react";
import {
  sidingsData,
  sidingsStats,
  sidingsMeta,
} from "../../../data/adminmasterdatafiles/sidings";
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
      className="3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
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
      className="3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

const statIcons = {
  chart: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-brand-500"
    >
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="4" width="4" height="17" rx="1" />
    </svg>
  ),
  flag: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-brand-500"
    >
      <path d="M4 2v20M4 4h12l-2 4 2 4H4" />
    </svg>
  ),
  trend: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="text-emerald-500"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

export default function SidingMaster() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = sidingsData.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900">
            {sidingsMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {sidingsMeta.subtitle}
          </p>
        </div>
        <button className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start">
          <PlusIcon className="3xl:w-5 3xl:h-5" />
          <span>{sidingsMeta.addLabel}</span>
        </button>
      </div>

      {/* Search & Filter */}
      <SearchBar
        placeholder={sidingsMeta.searchPlaceholder}
        value={search}
        onChange={setSearch}
        showFilter={true}
        filterLabel="Filter"
      />

      {/* Table */}
      <div className="rounded-xl border border-border-subtle bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Siding Code
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Siding Name
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Location
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  Railway Zone
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5 text-right text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((siding) => (
                <tr
                  key={siding.code}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 5xl:px-8 5xl:py-6">
                    <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-brand-600">
                      {siding.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 5xl:px-8 5xl:py-6">
                    <div>
                      <p className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-brand-900">
                        {siding.name}
                      </p>
                      <p className="text-[11px] 3xl:text-[13px] 5xl:text-[17px] text-slate-400 mt-0.5">
                        {siding.subName}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 5xl:px-8 5xl:py-6 hidden md:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-600">
                      {siding.location}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 5xl:px-8 5xl:py-6 hidden lg:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-600">
                      {siding.railwayZone}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 5xl:px-8 5xl:py-6">
                    <StatusBadge status={siding.status} />
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 5xl:px-8 5xl:py-6">
                    <div className="flex items-center justify-end gap-2 3xl:gap-3">
                      <button className="flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <EditIcon />
                      </button>
                      <button className="flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 3xl:px-6 3xl:py-5">
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            totalCount={sidingsMeta.totalCount}
            pageSize={sidingsMeta.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 3xl:gap-6 5xl:gap-8">
        {sidingsStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm"
          >
            <div>
              <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                {stat.label}
              </p>
              <p className="mt-1 text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900">
                {stat.value}
              </p>
            </div>
            <div className="flex h-12 w-12 3xl:h-14 3xl:w-14 5xl:h-18 5xl:w-18 items-center justify-center rounded-xl bg-brand-50">
              {statIcons[stat.icon]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
