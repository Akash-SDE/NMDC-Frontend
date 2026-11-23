/**
 * Shared Date/Time Utility Functions
 */

export const DATE_PLACEHOLDER = "dd/mm/yyyy";
export const DATETIME_PLACEHOLDER = "dd/mm/yyyy, hh:mm";

export function parseDateTimeToTimestamp(value) {
  if (!value) return 0;

  // Handles DD/MM/YYYY HH:mm format
  const [datePart = "", timePart = ""] = String(value).split(" ");
  const [day = "", month = "", year = ""] = datePart.split("/");
  const [hours = "0", minutes = "0"] = timePart.split(":");

  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes)
  );

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

/** Date-only display: dd/mm/yyyy (tables, reports, master data). */
export function formatTableDateOnly(value) {
  if (!value) return "";

  const text = String(value).trim();
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const [datePart = ""] = text.split(" ");
    const slashParts = datePart.split("/");
    if (slashParts.length === 3) return datePart;
    return "";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Alias used across admin screens for date-only columns. */
export const formatDateForTable = formatTableDateOnly;

/** Maps API date (ISO or YYYY-MM-DD) to datetime-local input value (local midnight). */
export function apiDateToDateTimeLocal(value) {
  if (!value) return "";
  const text = String(value).trim();
  const dateOnly = text.length >= 10 ? text.slice(0, 10) : text;
  const parsed = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return getLocalDateTimeValue(parsed);
}

/** Datetime display: dd/mm/yyyy HH:mm (24-hour). */
export function formatDateTimeForTable(value) {
  if (!value) return "";

  const text = String(value).trim();
  if (/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/.test(text)) {
    const [datePart, timePart = "00:00"] = text.split(/[,\s]+/).filter(Boolean);
    const time = timePart.includes(":") ? timePart : "00:00";
    return `${datePart} ${time}`;
  }

  const localMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  if (localMatch) {
    return `${localMatch[3]}/${localMatch[2]}/${localMatch[1]} ${localMatch[4]}:${localMatch[5]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/** Parse user-entered dd/mm/yyyy[, ]hh:mm → `YYYY-MM-DDTHH:mm` (datetime-local value). */
export function parseDisplayDateTimeToDatetimeLocal(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2}))?$/,
  );
  if (!match) return null;
  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year = match[3];
  const hours = (match[4] ?? "0").padStart(2, "0");
  const minutes = (match[5] ?? "00").padStart(2, "0");
  const hourNum = Number(hours);
  const minuteNum = Number(minutes);
  if (hourNum > 23 || minuteNum > 59) return null;
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** Parse `dd/mm/yyyy` → `YYYY-MM-DD` for APIs / date fields. */
export function parseDisplayDateOnlyToIso(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year = match[3];
  return `${year}-${month}-${day}`;
}

/** Normalize stored date (`YYYY-MM-DD` or ISO) to display dd/mm/yyyy. */
export function formatDateOnlyForInput(value) {
  return formatTableDateOnly(value);
}

export function formatTableDateTimeForInput(value) {
  const timestamp = parseDateTimeToTimestamp(value);
  if (!timestamp) return "";

  const parsed = new Date(timestamp);
  const localValue = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60000
  );
  return localValue.toISOString().slice(0, 16);
}

export function getLocalDateTimeValue(value = new Date()) {
  const localValue = new Date(
    value.getTime() - value.getTimezoneOffset() * 60000
  );
  return localValue.toISOString().slice(0, 16);
}

export function todayIsoDateLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Split `YYYY-MM-DDTHH:mm` into parts for 24-hour picker UI. */
export function splitDatetimeLocalValue(value) {
  const match = String(value ?? "").trim().match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})/);
  if (!match) {
    return { date: "", hours: "00", minutes: "00" };
  }
  return { date: match[1], hours: match[2], minutes: match[3] };
}

export function joinDatetimeLocalValue(date, hours, minutes) {
  if (!date) return "";
  const hourText = String(hours ?? "0").padStart(2, "0");
  const minuteText = String(minutes ?? "0").padStart(2, "0");
  const hourNum = Number(hourText);
  const minuteNum = Number(minuteText);
  if (hourNum > 23 || minuteNum > 59) return "";
  return `${date}T${hourText}:${minuteText}`;
}
