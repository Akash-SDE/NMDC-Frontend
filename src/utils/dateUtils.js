/**
 * Shared Date/Time Utility Functions
 */

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

export function formatDateTimeForTable(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
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
