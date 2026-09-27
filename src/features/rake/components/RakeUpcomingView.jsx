import { CalendarIcon, ClearIcon, DeleteIcon, PlusIcon } from "../../../components/icons";
import {
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { isUpcomingRowReady } from "../constants/rakeConstants";

export default function RakeUpcomingView({
  onNavigateBack,
  upcomingRows,
  upcomingOfferedRows = [],
  upcomingMessage,
  upcomingMessageTone = "info",
  upcomingStats,
  moving = false,
  updateUpcomingRow,
  onAddUpcomingRow,
  onRemoveUpcomingRow,
  onSaveUpcomingRakes,
  onClearUpcomingRakes,
  lookupOptions = {
    sidings: [],
    routes: [],
    oreTypes: [],
    customers: [],
    destinations: [],
    wagonTypes: [],
  },
}) {
  const inputClass = uniformInputClass;
  const compactInputClass = `${inputClass} h-9 px-2 text-[12px]`;
  const toolbarButtonClass =
    "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[12px] font-semibold";

  const messageClass =
    upcomingMessageTone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : upcomingMessageTone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-blue-200 bg-blue-50 text-blue-800";

  const renderSelect = (row, field, placeholder, options) => (
    <select
      value={row[field]}
      onChange={(event) => updateUpcomingRow(row.id, field, event.target.value)}
      className={compactInputClass}
      disabled={moving}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">
            <CalendarIcon className="h-3.5 w-3.5" />
            Planning workspace
          </div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">Upcoming Rakes</h2>
          <p className="mt-1 max-w-2xl text-[14px] text-slate-500">
            Stage planned rakes with full route and wagon details, then move ready rows into the
            offered list when placement is confirmed.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateBack}
          className={`${uniformSecondaryButtonClass} ${toolbarButtonClass} self-end sm:self-start sm:shrink-0`}
        >
          Back to Offered Rakes
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Draft rows</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{upcomingStats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/70">
            Ready to offer
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{upcomingStats.readyCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/70">
            Needs details
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{upcomingStats.incompleteCount}</p>
        </div>
      </div>

      {upcomingMessage ? (
        <p className={`rounded-lg border px-3 py-2 text-sm font-medium ${messageClass}`}>
          {upcomingMessage}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/40 px-4 py-4">
          <h3 className="text-[15px] font-bold text-slate-800">Upcoming rake planner</h3>
          <p className="mt-0.5 text-[12px] text-slate-600">
            Drafts stay editable here until you move a ready row into offered rakes.
          </p>
          <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={onAddUpcomingRow}
              disabled={moving}
              className={`${toolbarButtonClass} border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add row
            </button>
            <button
              type="button"
              onClick={onClearUpcomingRakes}
              disabled={moving || upcomingRows.length === 0}
              className={`${toolbarButtonClass} border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <ClearIcon />
              Clear all
            </button>
            <button
              type="button"
              onClick={onSaveUpcomingRakes}
              disabled={moving || upcomingStats.readyCount === 0}
              className={`${uniformPrimaryButtonClass} ${toolbarButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {moving
                ? "Moving…"
                : `Move ${upcomingStats.readyCount > 0 ? upcomingStats.readyCount : ""} to Offered List`}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Actions
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  SNo
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Ore Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Siding
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Wagon Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Wagons
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  Placement Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-[13px] text-slate-500">
                    No draft rakes yet. Use Add row to plan one.
                  </td>
                </tr>
              ) : null}
              {upcomingRows.map((row, index) => {
                const ready = isUpcomingRowReady(row);

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${ready ? "bg-white" : "bg-amber-50/20"}`}
                  >
                    <td className="sticky left-0 z-10 border-r border-slate-100 bg-inherit px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onRemoveUpcomingRow(row.id)}
                        disabled={moving}
                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Remove row"
                        aria-label="Remove row"
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          ready
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {ready ? "Ready" : "Incomplete"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderSelect(row, "oreType", "Select ore", lookupOptions.oreTypes)}
                    </td>
                    <td className="px-4 py-3">
                      {renderSelect(row, "siding", "Select siding", lookupOptions.sidings)}
                    </td>
                    <td className="px-4 py-3">
                      {renderSelect(row, "destination", "Select destination", lookupOptions.destinations)}
                    </td>
                    <td className="px-4 py-3">
                      {renderSelect(row, "wagonType", "Select type", lookupOptions.wagonTypes)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={row.wagonCount}
                        onChange={(event) =>
                          updateUpcomingRow(row.id, "wagonCount", event.target.value)
                        }
                        className={`${compactInputClass} w-20`}
                        disabled={moving}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {renderSelect(row, "route", "Select route", lookupOptions.routes)}
                    </td>
                    <td className="px-4 py-3">
                      {renderSelect(row, "customer", "Select customer", lookupOptions.customers)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        value={row.placementTime}
                        onChange={(event) =>
                          updateUpcomingRow(row.id, "placementTime", event.target.value)
                        }
                        className={compactInputClass}
                        disabled={moving}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {upcomingOfferedRows.length > 0 ? (
          <div className="border-t border-slate-200 bg-slate-50/40">
            <div className="border-b border-slate-100 px-4 py-4">
              <h3 className="text-[15px] font-bold text-slate-800">Upcoming Offered Rakes</h3>
              <p className="mt-0.5 text-[12px] text-slate-600">
                Rakes already offered with a future offer time.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-white">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      SNo
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Rake Number
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Ore Type
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Siding
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Wagon Type
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Wagons
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Route
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                      Offer Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcomingOfferedRows.map((row, index) => (
                    <tr key={row.rakeId} className="bg-white">
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">
                        {row.rakeNumber || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                          {row.statusDescription || row.status || "Offered"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">{row.oreType || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">{row.siding || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">{row.destination || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">{row.wagonType || "-"}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">
                        {row.noOfWagons ?? row.wagonSupply ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">{row.route || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">{row.customer || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">
                        {formatDateTimeForTable(row.offerTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-100 px-4 py-3 text-[12px] text-slate-500">
          Tip: complete all fields to mark a row as ready, then use{" "}
          <span className="font-semibold text-slate-700">Move to Offered List</span> to create
          offered rakes with generated rake numbers.
        </div>
      </div>
    </div>
  );
}
