import { useEffect, useMemo, useState } from "react";
import {
  uniformInputClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import { PlusIcon } from "../../../components/icons";
import { useRouter } from "../../../context/RouterContext";

const categories = [
  "Mechanical",
  "Railway Delay",
  "Power Failure",
  "Labor Delay",
  "Weather",
  "Operational Issue",
];

const initialRows = [
  {
    id: 1,
    rakeNumber: "R-2026-001",
    category: "Mechanical",
    startTime: "2026-03-19T04:50",
    endTime: "2026-03-19T06:20",
    reason: "Wagon brake failure",
    reportedBy: "Shift A",
    isDisabled: false,
  },
  {
    id: 2,
    rakeNumber: "R-2026-002",
    category: "Railway Delay",
    startTime: "2026-03-19T10:10",
    endTime: "2026-03-19T10:55",
    reason: "Late rake handover",
    reportedBy: "Shift B",
    isDisabled: false,
  },
  {
    id: 3,
    rakeNumber: "R-2026-003",
    category: "Weather",
    startTime: "2026-03-19T13:30",
    endTime: "2026-03-19T16:05",
    reason: "High winds and visibility drop",
    reportedBy: "Control Room",
    isDisabled: false,
  },
];

const initialInlineForm = {
  rakeNumber: "",
  category: "",
  startTime: "",
  endTime: "",
  reason: "",
  reportedBy: "",
};

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

function ClearIcon() {
  return (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function parseDateTimeToTimestamp(value) {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function formatDateTimeForTable(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const start = parseDateTimeToTimestamp(startTime);
  const end = parseDateTimeToTimestamp(endTime);
  if (!start || !end || end < start) return null;
  return Math.floor((end - start) / 60000);
}

function formatDuration(minutes) {
  if (minutes === null || Number.isNaN(minutes)) return "-";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function getStatusMeta(row) {
  if (row.isDisabled) {
    return {
      label: "Inactive",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
      dotClass: "bg-slate-400",
    };
  }

  const duration = getDurationMinutes(row.startTime, row.endTime) ?? 0;
  if (duration >= 120) {
    return {
      label: "Critical",
      badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
      dotClass: "bg-rose-500",
    };
  }

  return {
    label: "Logged",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  };
}

export default function DelayManagementPage() {
  const { routeParams } = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [inlineForm, setInlineForm] = useState(initialInlineForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineLogId, setActiveInlineLogId] = useState(null);
  const [statusConfirmLogId, setStatusConfirmLogId] = useState(null);
  const [message, setMessage] = useState("");

  const compactInputClass = `${uniformInputClass} h-8 px-2 text-[11px]`;

  useEffect(() => {
    const prefill = routeParams?.delayPrefill;
    if (!prefill?.rakeNumber) return;

    setInlineForm({
      ...initialInlineForm,
      rakeNumber: prefill.rakeNumber,
    });
    setInlineActionMode("add");
    setActiveInlineLogId(null);
    setTableSearch(prefill.rakeNumber);
  }, [routeParams]);

  const currentInlineDuration = useMemo(
    () => formatDuration(getDurationMinutes(inlineForm.startTime, inlineForm.endTime)),
    [inlineForm.startTime, inlineForm.endTime],
  );

  const statusConfirmLog = useMemo(
    () => rows.find((item) => item.id === statusConfirmLogId),
    [rows, statusConfirmLogId],
  );

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows;

    const q = tableSearch.toLowerCase();
    return rows.filter((row) => {
      const durationLabel = formatDuration(
        getDurationMinutes(row.startTime, row.endTime),
      );
      const status = getStatusMeta(row).label;

      return [
        row.rakeNumber,
        row.category,
        row.startTime,
        row.endTime,
        row.reason,
        row.reportedBy,
        durationLabel,
        status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, tableSearch]);

  const sortedRows = useMemo(() => {
    const getComparableValue = (row, field) => {
      if (field === "startTime" || field === "endTime") {
        return parseDateTimeToTimestamp(row[field]);
      }

      if (field === "duration") {
        return getDurationMinutes(row.startTime, row.endTime) ?? -1;
      }

      if (field === "status") {
        return getStatusMeta(row).label.toLowerCase();
      }

      if (field === "id") {
        return Number(row.id) || 0;
      }

      return String(row[field] ?? "").toLowerCase();
    };

    return [...filteredRows].sort((a, b) => {
      const aValue = getComparableValue(a, sortBy);
      const bValue = getComparableValue(b, sortBy);
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function updateInline(field, value) {
    setInlineForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  }

  function clearInlineForm() {
    setInlineForm(initialInlineForm);
    setInlineActionMode("add");
    setActiveInlineLogId(null);
    setMessage("");
  }

  function validateInlineForm() {
    const requiredFields = [
      inlineForm.rakeNumber,
      inlineForm.category,
      inlineForm.startTime,
      inlineForm.endTime,
      inlineForm.reason,
      inlineForm.reportedBy,
    ];

    if (requiredFields.some((field) => !String(field || "").trim())) {
      return "Please fill all delay fields before saving.";
    }

    const duration = getDurationMinutes(inlineForm.startTime, inlineForm.endTime);
    if (duration === null) {
      return "End time must be greater than start time.";
    }

    return "";
  }

  function handleInlineSave() {
    const validationMessage = validateInlineForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    const normalized = {
      rakeNumber: inlineForm.rakeNumber.trim(),
      category: inlineForm.category,
      startTime: inlineForm.startTime,
      endTime: inlineForm.endTime,
      reason: inlineForm.reason.trim(),
      reportedBy: inlineForm.reportedBy.trim(),
    };

    if (inlineActionMode === "edit" && activeInlineLogId !== null) {
      setRows((prev) =>
        prev.map((item) =>
          item.id === activeInlineLogId
            ? {
                ...item,
                ...normalized,
              }
            : item,
        ),
      );
      setMessage("Delay log updated successfully.");
    } else {
      const nextId = rows.length > 0 ? Math.max(...rows.map((item) => item.id)) + 1 : 1;

      setRows((prev) => [
        {
          id: nextId,
          ...normalized,
          isDisabled: false,
        },
        ...prev,
      ]);
      setMessage("Delay log added successfully.");
    }

    setInlineForm(initialInlineForm);
    setInlineActionMode("add");
    setActiveInlineLogId(null);
  }

  function handleEditRow(row) {
    if (row.isDisabled) {
      setMessage("Enable this delay log before editing.");
      return;
    }

    setInlineForm({
      rakeNumber: row.rakeNumber,
      category: row.category,
      startTime: row.startTime,
      endTime: row.endTime,
      reason: row.reason,
      reportedBy: row.reportedBy,
    });
    setInlineActionMode("edit");
    setActiveInlineLogId(row.id);
    setMessage("");
  }

  function requestLogStatusToggle(logId) {
    setStatusConfirmLogId(logId);
  }

  function closeLogStatusDialog() {
    setStatusConfirmLogId(null);
  }

  function confirmLogStatusToggle() {
    if (statusConfirmLogId === null) return;

    setRows((prev) =>
      prev.map((item) =>
        item.id === statusConfirmLogId
          ? { ...item, isDisabled: !item.isDisabled }
          : item,
      ),
    );
    setStatusConfirmLogId(null);
  }

  const inlineSaveDisabled =
    !inlineForm.rakeNumber.trim() ||
    !inlineForm.category ||
    !inlineForm.startTime ||
    !inlineForm.endTime ||
    !inlineForm.reason.trim() ||
    !inlineForm.reportedBy.trim();

  const inlineSaveLabel = inlineActionMode === "edit" ? "Save Edit" : "Add Delay";
  const inlineStatusLabel = inlineActionMode === "edit" ? "Editing" : "Draft";

  return (
    <>
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Delay Management
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Record and manage delays in an inline worksheet similar to Rake Management.
          </p>
        </div>

        {message ? (
          <p className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            {message}
          </p>
        ) : null}

        <SearchBar
          placeholder="Search by rake number, delay category, reason, or status..."
          value={tableSearch}
          onChange={setTableSearch}
          showFilter={false}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-425 whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Actions
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Log ID" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake Number" field="rakeNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Category" field="category" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Start Time" field="startTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="End Time" field="endTime" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Duration" field="duration" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Reason" field="reason" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Reported By" field="reportedBy" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-blue-50/50 align-top [&>td]:py-4">
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-center gap-2">
                      {inlineActionMode === "edit" ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                          Editing #{activeInlineLogId}
                        </span>
                      ) : null}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleInlineSave}
                          disabled={inlineSaveDisabled}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors ${
                            inlineSaveDisabled
                              ? "cursor-not-allowed bg-slate-300"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          aria-label={inlineSaveLabel}
                          title={inlineSaveLabel}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={clearInlineForm}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100"
                          aria-label="Clear form"
                          title="Clear form"
                        >
                          <ClearIcon />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={activeInlineLogId ?? "New"}
                      className={compactInputClass}
                      readOnly
                      disabled
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.rakeNumber}
                      onChange={(event) => updateInline("rakeNumber", event.target.value)}
                      placeholder="Rake Number"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <ThemedSelect
                      value={inlineForm.category}
                      onChange={(event) => updateInline("category", event.target.value)}
                      className={compactInputClass}
                    >
                      <option value="">Category</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </ThemedSelect>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.startTime}
                      onChange={(event) => updateInline("startTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="datetime-local"
                      value={inlineForm.endTime}
                      onChange={(event) => updateInline("endTime", event.target.value)}
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={currentInlineDuration}
                      className={compactInputClass}
                      readOnly
                      disabled
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.reason}
                      onChange={(event) => updateInline("reason", event.target.value)}
                      placeholder="Reason"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={inlineForm.reportedBy}
                      onChange={(event) => updateInline("reportedBy", event.target.value)}
                      placeholder="Reported By"
                      className={compactInputClass}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      {inlineStatusLabel}
                    </span>
                  </td>
                </tr>

                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          className="mb-2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <p className="text-[15px] font-semibold text-slate-400">
                          No delay logs found
                        </p>
                        <p className="text-[13px] text-slate-400">
                          Try adjusting your search keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => {
                    const duration = formatDuration(
                      getDurationMinutes(row.startTime, row.endTime),
                    );
                    const statusMeta = getStatusMeta(row);

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/60 transition-colors group [&>td]:py-5 ${
                          row.id === activeInlineLogId ? "bg-amber-50/60" : ""
                        } ${row.isDisabled ? "opacity-70" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEditRow(row)}
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
                        <td className="px-5 py-4 text-[13px] font-semibold text-blue-600">#{row.id}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.rakeNumber}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.startTime)}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{formatDateTimeForTable(row.endTime)}</td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-blue-700">{duration}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.reason}</td>
                        <td className="px-5 py-4 text-[13px] text-slate-700">{row.reportedBy}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${statusMeta.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                            {statusMeta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-[13px] text-slate-500">
            <p>
              Showing <span className="font-semibold text-slate-700">{sortedRows.length}</span> record(s)
            </p>
          </div>
        </div>
      </div>

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
        itemName={
          statusConfirmLog
            ? `${statusConfirmLog.rakeNumber} - ${statusConfirmLog.category}`
            : ""
        }
        confirmLabel={statusConfirmLog?.isDisabled ? "Enable" : "Disable"}
        variant={statusConfirmLog?.isDisabled ? "warning" : "danger"}
      />
    </>
  );
}