import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function ThemedSelect({
  value,
  onChange,
  children,
  className = "",
  disabled = false,
  id,
  name,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = useMemo(() => {
    return Children.toArray(children)
      .filter((child) => isValidElement(child) && child.type === "option")
      .map((child, index) => {
        const optionValue = child.props.value ?? "";
        const optionLabel =
          typeof child.props.children === "string"
            ? child.props.children
            : String(child.props.children ?? optionValue ?? "");

        return {
          key: child.key ?? `${optionValue}-${index}`,
          value: optionValue,
          label: optionLabel,
          disabled: Boolean(child.props.disabled),
        };
      });
  }, [children]);

  const selected = options.find(
    (option) => String(option.value) === String(value ?? ""),
  );

  const fallbackLabel =
    placeholder || options.find((option) => String(option.value) === "")?.label || "Select";

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextValue) {
    onChange?.({
      target: {
        value: nextValue,
        name,
        id,
      },
    });
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${className} flex items-center justify-between text-left ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected?.label || fallbackLabel}</span>
        <ChevronDown
          size={16}
          className={`ml-2 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute z-100 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value ?? "");

              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-sm last:border-b-0 ${
                    option.disabled
                      ? "cursor-not-allowed text-slate-300"
                      : isSelected
                        ? "bg-slate-100 font-semibold text-slate-800"
                        : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? <Check size={15} className="text-blue-600" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
