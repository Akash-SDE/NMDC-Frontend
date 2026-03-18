import { useState } from "react";
import { PlusIcon } from "../../../components/icons";
import {
  customersData,
  customersMeta,
} from "../../../data/adminmasterdatafiles/customers";
import SearchBar from "../../../components/shared/SearchBar";
import Pagination from "../../../components/shared/Pagination";
import StatusBadge from "../../../components/shared/StatusBadge";

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

const contractBadgeColors = {
  "Long Term": "bg-brand-100 text-brand-700 border-brand-200",
  Annual: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Spot: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function CustomerMaster() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = customersData.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900">
            {customersMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {customersMeta.subtitle}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 text-[13px] 3xl:text-[16px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start">
          <PlusIcon />
          <span>{customersMeta.addLabel}</span>
        </button>
      </div>

      {/* Search */}
      <SearchBar
        placeholder={customersMeta.searchPlaceholder}
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
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Customer Code
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Customer Name
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden sm:table-cell">
                  Contact Person
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Location
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  Contract
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
              {filtered.map((cust) => (
                <tr
                  key={cust.code}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-600">
                      {cust.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                      {cust.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] text-slate-600">
                      {cust.contactPerson}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-[13px] 3xl:text-[15px] text-slate-600">
                      {cust.location}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span
                      className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] 3xl:text-[13px] font-semibold ${contractBadgeColors[cust.contractType] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                      {cust.contractType}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={cust.status} showDot={false} />
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
            totalCount={customersMeta.totalCount}
            pageSize={customersMeta.pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
