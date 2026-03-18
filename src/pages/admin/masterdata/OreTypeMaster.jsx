import { useState } from "react";
import {
  oreTypesData,
  oreTypesStats,
  oreTypesMeta,
} from "../../../data/adminmasterdatafiles/oreTypes";
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

const statIconMap = {
  mountain: (
    <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-brand-100">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-brand-600"
      >
        <path d="M12 2L2 22h20L12 2zm0 5l6.5 13h-13L12 7z" />
      </svg>
    </div>
  ),
  check: (
    <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-emerald-100">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-emerald-600"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    </div>
  ),
  trend: (
    <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-red-100">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-red-500"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    </div>
  ),
};

export default function OreTypeMaster() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = oreTypesData.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900 italic">
            {oreTypesMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {oreTypesMeta.subtitle}
          </p>
        </div>
        <button className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start">
          <PlusIcon className="3xl:w-5 3xl:h-5" />
          <span>{oreTypesMeta.addLabel}</span>
        </button>
      </div>

      {/* Search */}
      <SearchBar
        placeholder={oreTypesMeta.searchPlaceholder}
        value={search}
        onChange={setSearch}
        showFilter={true}
        showExport={true}
        filterLabel="Filters"
      />

      {/* Table */}
      <div className="rounded-xl border border-border-subtle bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Ore Type Code
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Ore Type Name
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden sm:table-cell">
                  Grade (Fe %)
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Description
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3.5 3xl:px-6 3xl:py-4 text-right text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ore) => (
                <tr
                  key={ore.code}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-600">
                      {ore.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                      {ore.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden sm:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] font-medium text-slate-700">
                      {ore.grade}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden md:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] text-slate-500">
                      {ore.description}
                    </span>
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                    <StatusBadge status={ore.status} showDot={false} />
                  </td>
                  <td className="px-5 py-4 3xl:px-6 3xl:py-5">
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
        <div className="px-5 py-4 3xl:px-6 3xl:py-5">
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            totalCount={oreTypesMeta.totalCount}
            pageSize={oreTypesMeta.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 3xl:gap-6">
        {oreTypesStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 shadow-sm"
          >
            <div className="flex items-center gap-3 3xl:gap-4">
              {statIconMap[stat.icon]}
              <div>
                <p className="text-[10px] 3xl:text-[12px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[24px] 3xl:text-[30px] font-bold text-brand-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
