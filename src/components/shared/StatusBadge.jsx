import React from "react";

const statusConfig = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    label: "Active",
  },
  inactive: {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400",
    label: "Inactive",
  },
  maintenance: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    label: "Maintenance",
  },
};

export default function StatusBadge({ status, showDot = true }) {
  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 3xl:px-3 3xl:py-1.5 5xl:px-4 5xl:py-2 text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 3xl:h-2 3xl:w-2 rounded-full ${config.dot}`}
        />
      )}
      {config.label}
    </span>
  );
}
