import { useMemo, useState } from "react";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
} from "../../../components/shared/UniformUi";

const initialRows = [
  {
    id: 1,
    refNo: "6972",
    rakeId: "OK80",
    rakeNumber: "OK80",
    wagonType: "MXL59",
    siding: "DS-L",
    oreType: "CLO",
    fNoteDate: "2026-03-19",
    customer: "VIRAJ IRON AND STEEL LIMITED",
    destination: "CHARSIWA TILDA ROAD",
    offerDate: "2026-03-19 06:40",
    completionDate: "2026-03-19 05:55",
  },
  {
    id: 2,
    refNo: "6971",
    rakeId: "NK109",
    rakeNumber: "NK109",
    wagonType: "NSS8",
    siding: "DS-F",
    oreType: "F",
    fNoteDate: "2026-03-19",
    customer: "NMDC STEEL LIMITED",
    destination: "NMAG",
    offerDate: "2026-03-19 05:55",
    completionDate: "2026-03-19 05:38",
  },
  {
    id: 3,
    refNo: "6973",
    rakeId: "VK110",
    rakeNumber: "VK110",
    wagonType: "NH-L58",
    siding: "D19/11A",
    oreType: "F",
    fNoteDate: "2026-03-19",
    customer: "RASHMI ISPAT",
    destination: "VSPS",
    offerDate: "2026-03-19 07:05",
    completionDate: "2026-03-19 06:22",
  },
];

const pageShellClass = "space-y-6 3xl:space-y-8 5xl:space-y-12";
const pageTitleClass = "text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800";
const pageSubtitleClass = "mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500";
const tableCardClass = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

function compareValues(a, b, order) {
  const left = typeof a === "number" ? a : String(a ?? "").toLowerCase();
  const right = typeof b === "number" ? b : String(b ?? "").toLowerCase();

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

export default function DeleteOfferedRakesPage() {
  const [rows, setRows] = useState(initialRows);
  const [draftDate, setDraftDate] = useState("2026-03-19");
  const [appliedDate, setAppliedDate] = useState("2026-03-19");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const deleteTarget = useMemo(() => rows.find((row) => row.id === deleteTargetId) || null, [rows, deleteTargetId]);

  const filteredRows = useMemo(() => {
    if (!appliedDate) return rows;
    return rows.filter((row) => row.fNoteDate === appliedDate);
  }, [rows, appliedDate]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => compareValues(a[sortBy], b[sortBy], sortOrder));
  }, [filteredRows, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortOrder("asc");
  }

  function handleSearch(event) {
    event.preventDefault();
    setAppliedDate(draftDate);
  }

  function confirmDelete() {
    if (!deleteTargetId) return;

    setRows((prev) => prev.filter((row) => row.id !== deleteTargetId));
    setDeleteTargetId(null);
  }

  return (
    <div className={pageShellClass}>
      <div>
        <h2 className={pageTitleClass}>Delete Offered Rakes</h2>
        <p className={pageSubtitleClass}>Search by date and remove offered rake entries using uniform admin controls.</p>
      </div>

      <UniformSectionCard title="Search Filters" subtitle="Filter the offered rake list before deleting records.">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,280px)_max-content] sm:items-end">
          <UniformFormField label="Date">
            <input
              type="date"
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
              className={uniformInputClass}
            />
          </UniformFormField>

          <button type="submit" className={`${uniformPrimaryButtonClass} h-10 sm:min-w-28`}>
            Search
          </button>
        </form>
      </UniformSectionCard>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px]" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Sl No" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <SortHeaderButton label="Ref No" field="refNo" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Rake ID</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Rake Number</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden lg:table-cell">Wagon Type</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden lg:table-cell">Siding</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden xl:table-cell">Ore Type</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden xl:table-cell">F/Note Date</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Customer</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden 2xl:table-cell">Destination</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden 2xl:table-cell">Offer Date</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden 2xl:table-cell">Completion Date</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{row.id}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{row.refNo}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">{row.rakeId}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{row.rakeNumber}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden lg:table-cell">{row.wagonType}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden lg:table-cell">{row.siding}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden xl:table-cell">{row.oreType}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden xl:table-cell">{row.fNoteDate}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700">{row.customer}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden 2xl:table-cell">{row.destination}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden 2xl:table-cell">{row.offerDate}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden 2xl:table-cell">{row.completionDate}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(row.id)}
                        className="rounded-md bg-rose-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-rose-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-5 py-12 text-center text-[14px] text-slate-500">
                    No records found for the selected date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Offered Rake"
        message="Are you sure you want to delete this offered rake entry?"
        itemName={deleteTarget?.rakeNumber || ""}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
