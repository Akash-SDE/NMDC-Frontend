import { useMemo, useState } from "react";
import {
  UniformFormField,
  UniformPageShell,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";

const categories = [
  "Mechanical",
  "Railway Delay",
  "Power Failure",
  "Labor Delay",
  "Weather",
  "Operational Issue",
];

const initialLogs = [
  {
    id: 1,
    category: "Mechanical",
    startTime: "2026-03-19T04:50",
    endTime: "2026-03-19T06:20",
    reason: "Wagon brake failure",
    isDisabled: false,
  },
  {
    id: 2,
    category: "Railway Delay",
    startTime: "2026-03-19T10:10",
    endTime: "2026-03-19T10:55",
    reason: "Late rake handover",
    isDisabled: false,
  },
];

const delayTabs = [
  { id: "form", label: "Delay Form" },
  { id: "table", label: "Delay Table" },
];

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
      className="h-4 w-4"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DisableIcon() {
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
      className="h-4 w-4"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <line x1="12" y1="11" x2="12" y2="7" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EnableIcon() {
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
      className="h-4 w-4"
    >
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <polyline points="8 16 11 19 16 14" />
    </svg>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationMinutes(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  const diff = endDate.getTime() - startDate.getTime();
  if (diff < 0) return null;
  return Math.floor(diff / 60000);
}

function toDurationLabel(minutes) {
  if (minutes === null) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function DelayManagementPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [activeTab, setActiveTab] = useState("form");
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingLogId, setEditingLogId] = useState(null);
  const [form, setForm] = useState({
    category: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [statusConfirmLogId, setStatusConfirmLogId] = useState(null);

  const previewDuration = useMemo(
    () => toDurationLabel(getDurationMinutes(form.startTime, form.endTime)),
    [form.startTime, form.endTime],
  );

  const statusConfirmLog = useMemo(
    () => logs.find((item) => item.id === statusConfirmLogId),
    [logs, statusConfirmLogId],
  );

  const summary = useMemo(() => {
    const total = logs.reduce((acc, item) => {
      const minutes = getDurationMinutes(item.startTime, item.endTime);
      return acc + (minutes || 0);
    }, 0);
    return {
      entries: logs.length,
      totalMinutes: total,
      totalLabel: toDurationLabel(total),
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!tableSearch.trim()) return logs;

    const q = tableSearch.toLowerCase();
    return logs.filter((row) =>
      [row.category, row.reason, row.startTime, row.endTime]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [logs, tableSearch]);

  const sortedLogs = useMemo(() => {
    const getComparableValue = (row, field) => {
      if (field === "duration") return getDurationMinutes(row.startTime, row.endTime) ?? -1;
      if (field === "status") return row.isDisabled ? "disabled" : "enabled";
      return String(row[field] ?? "").toLowerCase();
    };

    return [...filteredLogs].sort((a, b) => {
      const aValue = getComparableValue(a, sortBy);
      const bValue = getComparableValue(b, sortBy);
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredLogs, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  }

  function handleEditLog(log) {
    setEditingLogId(log.id);
    setForm({
      category: log.category,
      startTime: log.startTime,
      endTime: log.endTime,
      reason: log.reason,
    });
    setMessage("");
    setActiveTab("form");
  }

  function toggleLogStatus(logId) {
    setLogs((prev) =>
      prev.map((item) =>
        item.id === logId
          ? { ...item, isDisabled: !item.isDisabled }
          : item,
      ),
    );
  }

  function requestLogStatusToggle(logId) {
    setStatusConfirmLogId(logId);
  }

  function closeLogStatusDialog() {
    setStatusConfirmLogId(null);
  }

  function confirmLogStatusToggle() {
    if (statusConfirmLogId === null) return;
    toggleLogStatus(statusConfirmLogId);
    setStatusConfirmLogId(null);
  }

  function handleAdd(event) {
    event.preventDefault();

    if (!form.category || !form.startTime || !form.endTime || !form.reason.trim()) {
      setMessage("Please fill all delay fields before saving.");
      return;
    }

    const minutes = getDurationMinutes(form.startTime, form.endTime);
    if (minutes === null) {
      setMessage("End time must be greater than start time.");
      return;
    }

    if (editingLogId) {
      setLogs((prev) =>
        prev.map((item) =>
          item.id === editingLogId
            ? {
                ...item,
                category: form.category,
                startTime: form.startTime,
                endTime: form.endTime,
                reason: form.reason,
              }
            : item,
        ),
      );
      setMessage("Delay log updated successfully.");
    } else {
      const next = {
        id: logs.length + 1,
        category: form.category,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason,
        isDisabled: false,
      };
      setLogs((prev) => [next, ...prev]);
      setMessage("Delay log added successfully.");
    }

    setEditingLogId(null);
    setForm({ category: "", startTime: "", endTime: "", reason: "" });
    setActiveTab("table");
  }

  const inputClass = uniformInputClass;

  return (
    <UniformPageShell
      title="Delay Management"
      subtitle="Step 4 from workflow: capture delay category, start/end time, duration, and operational reason."
      tabs={delayTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-4">
        {activeTab === "form" ? (
          <>
            <UniformSectionCard
              title="Delay Snapshot"
              subtitle="Live summary of recorded delays and current draft entry."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Logs</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">{summary.entries}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Delay</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">{summary.totalLabel}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Entry Duration</p>
                  <p className="mt-1 text-xl font-bold text-blue-700">{previewDuration}</p>
                </div>
              </div>
            </UniformSectionCard>

            <UniformSectionCard
              title="Update Reason for Delay"
              subtitle="Create a structured delay log with mandatory timestamps and reason."
            >
              {message ? (
                <p className="mb-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                  {message}
                </p>
              ) : null}

              <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <UniformFormField label="Delay Category">
                  <ThemedSelect
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </ThemedSelect>
                </UniformFormField>

                <UniformFormField label="Start Time">
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(event) => updateField("startTime", event.target.value)}
                    className={inputClass}
                  />
                </UniformFormField>

                <UniformFormField label="End Time">
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(event) => updateField("endTime", event.target.value)}
                    className={inputClass}
                  />
                </UniformFormField>

                <UniformFormField label="Duration">
                  <input type="text" value={previewDuration} readOnly className={inputClass} />
                </UniformFormField>

                <div className="sm:col-span-2 xl:col-span-3">
                  <UniformFormField label="Reason">
                    <input
                      type="text"
                      value={form.reason}
                      onChange={(event) => updateField("reason", event.target.value)}
                      className={inputClass}
                      placeholder="Enter delay reason"
                    />
                  </UniformFormField>
                </div>

                <div className="self-end sm:col-span-2 xl:col-span-1 xl:flex xl:justify-end">
                  <button type="submit" className={uniformPrimaryButtonClass}>
                    {editingLogId ? "Update Delay Log" : "Save Delay Log"}
                  </button>
                </div>
              </form>
            </UniformSectionCard>
          </>
        ) : null}

        {activeTab === "table" ? (
          <UniformSectionCard title="Delay Records" subtitle="Recent delay logs with calculated duration.">
            <SearchBar
              placeholder="Search category, reason, or time"
              value={tableSearch}
              onChange={setTableSearch}
              showFilter={false}
            />

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-175">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Category" field="category" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Start Time" field="startTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="End Time" field="endTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Duration" field="duration" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Reason" field="reason" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((row, index) => {
                    const duration = toDurationLabel(
                      getDurationMinutes(row.startTime, row.endTime),
                    );

                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-slate-200 text-sm text-slate-700 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } ${row.isDisabled ? "opacity-60" : ""}`}
                      >
                        <td className="px-3 py-2.5">
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">{formatDate(row.startTime)}</td>
                        <td className="px-3 py-2.5">{formatDate(row.endTime)}</td>
                        <td className="px-3 py-2.5 font-semibold text-blue-700">{duration}</td>
                        <td className="px-3 py-2.5">{row.reason}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              row.isDisabled
                                ? "bg-slate-200 text-slate-600"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {row.isDisabled ? "Disabled" : "Enabled"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditLog(row)}
                              disabled={row.isDisabled}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled
                                  ? "cursor-not-allowed text-slate-300"
                                  : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                              title={row.isDisabled ? "Enable to edit" : "Edit"}
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() => requestLogStatusToggle(row.id)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                row.isDisabled
                                  ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                                  : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              }`}
                              title={row.isDisabled ? "Enable" : "Disable"}
                            >
                              {row.isDisabled ? <EnableIcon /> : <DisableIcon />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                        No delay logs found for this search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </UniformSectionCard>
        ) : null}

        <ConfirmDialog
          isOpen={Boolean(statusConfirmLog)}
          onClose={closeLogStatusDialog}
          onConfirm={confirmLogStatusToggle}
          title={statusConfirmLog?.isDisabled ? "Enable Delay Log" : "Disable Delay Log"}
          message={
            statusConfirmLog?.isDisabled
              ? "Are you sure you want to enable this delay log?"
              : "Are you sure you want to disable this delay log?"
          }
          itemName={statusConfirmLog ? `${statusConfirmLog.category} - ${statusConfirmLog.id}` : ""}
          confirmLabel={statusConfirmLog?.isDisabled ? "Enable" : "Disable"}
          variant={statusConfirmLog?.isDisabled ? "warning" : "danger"}
        />
      </div>
    </UniformPageShell>
  );
}

