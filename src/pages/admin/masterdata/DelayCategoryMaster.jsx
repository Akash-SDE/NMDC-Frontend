import { useState } from "react";
import {
  delayCategoriesData,
  delayCategoriesMeta,
} from "../../../data/adminmasterdatafiles/delayCategories";
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

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="3xl:w-5 3xl:h-5"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function DelayCategoryMaster() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = delayCategoriesData.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900">
            {delayCategoriesMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {delayCategoriesMeta.subtitle}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 text-[13px] 3xl:text-[16px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start">
          <PlusIcon />
          <span>{delayCategoriesMeta.addLabel}</span>
        </button>
      </div>

      {/* Search + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md 3xl:max-w-lg">
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
            placeholder={delayCategoriesMeta.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-2.5 3xl:py-3 text-[13px] 3xl:text-[16px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 3xl:gap-3">
          <button className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
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
          <button className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
            <DownloadIcon />
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
                  Delay Code
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Category Name
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Description
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
              {filtered.map((cat) => (
                <tr
                  key={cat.code}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-600">
                      {cat.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] text-slate-500">
                      {cat.description}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={cat.status} showDot={false} />
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
            totalCount={delayCategoriesMeta.totalCount}
            pageSize={delayCategoriesMeta.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
