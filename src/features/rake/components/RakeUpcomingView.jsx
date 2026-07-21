import { CalendarIcon, ClearIcon, DeleteIcon, PlusIcon } from "../../../components/icons";
import {
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import {
  customerOptions,
  destinationOptions,
  isUpcomingRowReady,
  oreTypeOptions,
  routeOptions,
  sidingOptions,
  wagonTypeOptions,
} from "../constants/rakeConstants";

export default function RakeUpcomingView({
  onNavigateBack,
  upcomingRows,
  upcomingMessage,
  upcomingMessageTone = "info",
  upcomingStats,
  updateUpcomingRow,
  onAddUpcomingRow,
  onRemoveUpcomingRow,
  onSaveUpcomingRakes,
  onClearUpcomingRakes,
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
            Drafts auto-save locally. Only rows marked ready will move to offered rakes.
          </p>
          <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={onAddUpcomingRow}
              className={`${toolbarButtonClass} border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100`}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add row
            </button>
            <button
              type="button"
              onClick={onClearUpcomingRakes}
              className={`${toolbarButtonClass} border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100`}
            >
              <ClearIcon />
              Clear all
            </button>
            <button
              type="button"
              onClick={onSaveUpcomingRakes}
              disabled={upcomingStats.readyCount === 0}
              className={`${uniformPrimaryButtonClass} ${toolbarButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Move {upcomingStats.readyCount > 0 ? upcomingStats.readyCount : ""} to Offered List
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
                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
                      <ThemedSelect
                        value={row.oreType}
                        onChange={(event) => updateUpcomingRow(row.id, "oreType", event.target.value)}
                        className={compactInputClass}
                      >
                        <option value="">Select ore</option>
                        {oreTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </ThemedSelect>
                    </td>
                    <td className="px-4 py-3">
                      <ThemedSelect
                        value={row.siding}
                        onChange={(event) => updateUpcomingRow(row.id, "siding", event.target.value)}
                        className={compactInputClass}
                      >
                        <option value="">Select siding</option>
                        {sidingOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </ThemedSelect>
                    </td>
                    <td className="px-4 py-3">
                      <ThemedSelect
                        value={row.destination}
                        onChange={(event) =>
                          updateUpcomingRow(row.id, "destination", event.target.value)
                        }
                        className={compactInputClass}
                      >
                        <option value="">Select destination</option>
                        {destinationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </ThemedSelect>
                    </td>
                    <td className="px-4 py-3">
                      <ThemedSelect
                        value={row.wagonType}
                        onChange={(event) =>
                          updateUpcomingRow(row.id, "wagonType", event.target.value)
                        }
                        className={compactInputClass}
                      >
                        <option value="">Select type</option>
                        {wagonTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </ThemedSelect>
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
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ThemedSelect
                        value={row.route}
                        onChange={(event) => updateUpcomingRow(row.id, "route", event.target.value)}
                        className={compactInputClass}
                      >
                        <option value="">Select route</option>
                        {routeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </ThemedSelect>
                    </td>
                    <td className="px-4 py-3">
                      <ThemedSelect
                        value={row.customer}
                        onChange={(event) =>
                          updateUpcomingRow(row.id, "customer", event.target.value)
                        }
                        className={compactInputClass}
                      >
                        <option value="">Select customer</option>
                        {customerOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </ThemedSelect>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        value={row.placementTime}
                        onChange={(event) =>
                          updateUpcomingRow(row.id, "placementTime", event.target.value)
                        }
                        className={compactInputClass}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-4 py-3 text-[12px] text-slate-500">
          Tip: complete all fields to mark a row as ready, then use{" "}
          <span className="font-semibold text-slate-700">Move to Offered List</span> to create
          offered rakes with generated rake IDs.
        </div>
      </div>
    </div>
  );
}
