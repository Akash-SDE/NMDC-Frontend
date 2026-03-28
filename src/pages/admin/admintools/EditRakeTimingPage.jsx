import { useMemo, useState } from "react";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
} from "../../../components/shared/UniformUi";

const initialRows = [
  {
    id: 1,
    rakeNumber: "NK109",
    completionDate: "2026-03-19",
    customer: "NMDC STEEL LIMITED",
    destination: "NMAG",
    offerTime: "2026-03-19T05:55",
    completionTime: "2026-03-19T06:40",
  },
  {
    id: 2,
    rakeNumber: "VK110",
    completionDate: "2026-03-19",
    customer: "RASHMI ISPAT",
    destination: "VSPS",
    offerTime: "2026-03-19T07:05",
    completionTime: "2026-03-19T07:48",
  },
  {
    id: 3,
    rakeNumber: "OK80",
    completionDate: "2026-03-18",
    customer: "VIRAJ IRON AND STEEL LIMITED",
    destination: "CHARSIWA",
    offerTime: "2026-03-18T06:40",
    completionTime: "2026-03-18T07:22",
  },
];

const pageShellClass = "space-y-6 3xl:space-y-8 5xl:space-y-12";
const pageTitleClass = "text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800";
const pageSubtitleClass = "mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500";
const tableCardClass = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

function toSavedSnapshot(rows) {
  return rows.reduce((accumulator, row) => {
    accumulator[row.id] = {
      offerTime: row.offerTime,
      completionTime: row.completionTime,
    };
    return accumulator;
  }, {});
}

function formatDateTime(value) {
  if (!value) return "-";
  const [date, time = ""] = String(value).split("T");
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year} ${time}`.trim();
}

export default function EditRakeTimingPage() {
  const [rows, setRows] = useState(initialRows);
  const [savedRows, setSavedRows] = useState(() => toSavedSnapshot(initialRows));
  const [draftDate, setDraftDate] = useState("2026-03-19");
  const [appliedDate, setAppliedDate] = useState("2026-03-19");

  const filteredRows = useMemo(() => {
    if (!appliedDate) return rows;
    return rows.filter((row) => row.completionDate === appliedDate);
  }, [rows, appliedDate]);

  function handleSearch(event) {
    event.preventDefault();
    setAppliedDate(draftDate);
  }

  function handleTimingChange(rowId, field, value) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, [field]: value };
      }),
    );
  }

  function isRowDirty(row) {
    const saved = savedRows[row.id];
    if (!saved) return false;
    return saved.offerTime !== row.offerTime || saved.completionTime !== row.completionTime;
  }

  function saveRow(rowId) {
    const target = rows.find((row) => row.id === rowId);
    if (!target) return;

    setSavedRows((prev) => ({
      ...prev,
      [rowId]: {
        offerTime: target.offerTime,
        completionTime: target.completionTime,
      },
    }));
  }

  return (
    <div className={pageShellClass}>
      <div>
        <h2 className={pageTitleClass}>Update Rake Timing</h2>
        <p className={pageSubtitleClass}>Search completion date and update offer/completion timing row-wise.</p>
      </div>

      <UniformSectionCard title="Search Datewise" subtitle="Filter records before updating timing values.">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,320px)_max-content] sm:items-end">
          <UniformFormField label="Completion Date">
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
          <table className="w-full min-w-[1000px]" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Sl No</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Rake Number</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden lg:table-cell">Customer</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 hidden lg:table-cell">Destination</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Offer Time</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Completion Time</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => {
                  const dirty = isRowDirty(row);

                  return (
                    <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">{row.id}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                        <p>{row.rakeNumber}</p>
                        <p className="text-[11px] font-medium text-slate-500">Date: {formatDateTime(`${row.completionDate}T00:00`).split(" ")[0]}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden lg:table-cell">{row.customer}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700 hidden lg:table-cell">{row.destination}</td>
                      <td className="px-5 py-3.5">
                        <input
                          type="datetime-local"
                          value={row.offerTime}
                          onChange={(event) => handleTimingChange(row.id, "offerTime", event.target.value)}
                          className={`${uniformInputClass} h-9 text-[12px]`}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <input
                          type="datetime-local"
                          value={row.completionTime}
                          onChange={(event) => handleTimingChange(row.id, "completionTime", event.target.value)}
                          className={`${uniformInputClass} h-9 text-[12px]`}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {dirty ? (
                          <button
                            type="button"
                            onClick={() => saveRow(row.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white transition-colors hover:bg-blue-700"
                            aria-label={`Save row ${row.id}`}
                            title="Save row"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">Saved</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[14px] text-slate-500">
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
