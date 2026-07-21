function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DATE_RANGE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "last7", label: "Last 7 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
];

export function buildDatePresetValues(presetId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (presetId === "today") {
    const value = formatDateInput(today);
    return { fromDate: value, toDate: value, date: value };
  }

  if (presetId === "last7") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return {
      fromDate: formatDateInput(start),
      toDate: formatDateInput(today),
      date: formatDateInput(today),
    };
  }

  if (presetId === "thisMonth") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      fromDate: formatDateInput(start),
      toDate: formatDateInput(today),
      date: formatDateInput(today),
    };
  }

  if (presetId === "lastMonth") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return {
      fromDate: formatDateInput(start),
      toDate: formatDateInput(end),
      date: formatDateInput(end),
    };
  }

  return {};
}

export function reportSupportsDatePresets(filters = []) {
  const ids = filters.map((filter) => filter.id);
  return ids.includes("fromDate") || ids.includes("date");
}
