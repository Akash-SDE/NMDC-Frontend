import { useEffect, useState } from "react";
import {
  DATE_PLACEHOLDER,
  formatTableDateOnly,
  parseDisplayDateOnlyToIso,
} from "../../utils/dateUtils";
import NativeDatePickerBridge from "./NativeDatePickerBridge";

const withPickerPadding = (className) =>
  `${className} ${/\bpr-/.test(className) ? "" : "pr-8"}`.trim();

/** Value is `YYYY-MM-DD`; user sees and types dd/mm/yyyy. */
export default function DateOnlyInput({
  value = "",
  onChange,
  className = "",
  disabled = false,
  readOnly = false,
  placeholder = DATE_PLACEHOLDER,
  title,
  showCalendar = true,
}) {
  const formatted = value ? formatTableDateOnly(value) : "";
  const [draft, setDraft] = useState(formatted);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(formatted);
    }
  }, [formatted, focused]);

  function applyStoredValue(nextValue) {
    onChange?.(nextValue);
    setDraft(nextValue ? formatTableDateOnly(nextValue) : "");
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
          const parsed = parseDisplayDateOnlyToIso(draft);
          if (parsed === "") {
            onChange?.("");
            setDraft("");
            return;
          }
          if (parsed) {
            onChange?.(parsed);
            setDraft(formatTableDateOnly(parsed));
            return;
          }
          setDraft(formatted);
        }}
        className={pickerEnabled ? withPickerPadding(className) : className}
      />
      {pickerEnabled ? (
        <NativeDatePickerBridge
          pickerType="date"
          value={value}
          onChange={applyStoredValue}
          title="Choose date"
        />
      ) : null}
    </div>
  );
}