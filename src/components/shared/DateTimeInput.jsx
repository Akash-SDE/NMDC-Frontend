import { useEffect, useState } from "react";
import {
  DATETIME_PLACEHOLDER,
  formatDateTimeForTable,
  parseDisplayDateTimeToDatetimeLocal,
} from "../../utils/dateUtils";
import DateTimePickerBridge from "./DateTimePickerBridge";

const withPickerPadding = (className) =>
  `${className} ${/\bpr-/.test(className) ? "" : "pr-8"}`.trim();

/**
 * Text input for datetimes: value is `YYYY-MM-DDTHH:mm` (datetime-local); display is 24h dd/mm/yyyy.
 */
export default function DateTimeInput({
  value = "",
  onChange,
  className = "",
  disabled = false,
  readOnly = false,
  placeholder = DATETIME_PLACEHOLDER,
  title,
  showCalendar = true,
}) {
  const formatted = value ? formatDateTimeForTable(value) : "";
  const [draft, setDraft] = useState(formatted);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(formatted);
    }
  }, [formatted, focused]);

  function applyStoredValue(nextValue) {
    onChange?.(nextValue);
    setDraft(nextValue ? formatDateTimeForTable(nextValue) : "");
    setFocused(false);
  }

  const pickerEnabled = showCalendar && !disabled && !readOnly;

  return (
    <div className="relative min-w-0 w-full">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={focused || !value ? draft : formatted}
        placeholder={placeholder}
        title={title ?? placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onFocus={() => {
          if (disabled || readOnly) return;
          setFocused(true);
          setDraft(formatted);
        }}
        onChange={(event) => {
          if (disabled || readOnly) return;
          setDraft(event.target.value);
        }}
        onBlur={() => {
          if (disabled || readOnly) return;
          setFocused(false);
          const parsed = parseDisplayDateTimeToDatetimeLocal(draft);
          if (parsed === "") {
            onChange?.("");
            setDraft("");
            return;
          }
          if (parsed) {
            onChange?.(parsed);
            setDraft(formatDateTimeForTable(parsed));
            return;
          }
          setDraft(formatted);
        }}
        className={pickerEnabled ? withPickerPadding(className) : className}
      />
      {pickerEnabled ? (
        <DateTimePickerBridge value={value} onChange={applyStoredValue} title="Choose date and time (24-hour)" />
      ) : null}
    </div>
  );
}