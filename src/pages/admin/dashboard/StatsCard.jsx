import React from "react";
import {
  TrendUpIcon,
  TrendDownIcon,
  ActiveRakesStatIcon,
  DispatchStatIcon,
  PermitStatIcon,
  DelayStatIcon,
} from "../../../components/icons/index";

const iconComponents = {
  "active-rakes": ActiveRakesStatIcon,
  "total-dispatch": DispatchStatIcon,
  "pending-permits": PermitStatIcon,
  "avg-loading-delay": DelayStatIcon,
};

const colorConfig = {
  blue: {
    iconBg: "bg-stat-blue-bg",
    iconFg: "text-stat-blue-fg",
  },
  orange: {
    iconBg: "bg-stat-orange-bg",
    iconFg: "text-stat-orange-fg",
  },
  green: {
    iconBg: "bg-stat-green-bg",
    iconFg: "text-stat-green-fg",
  },
  red: {
    iconBg: "bg-stat-red-bg",
    iconFg: "text-stat-red-fg",
  },
};

export default function StatsCard({ stat }) {
  const { id, label, value, unit, trend, trendValue, colorScheme } = stat;
  const colors = colorConfig[colorScheme];
  const IconComponent = iconComponents[id];
  const isUp = trend === "up";

  // For "down" trend on permits, color is red. For "up" trend on delay, color is red.
  // Otherwise: up = green, down = red
  const trendIsPositive =
    id === "pending-permits"
      ? trend === "down"
      : id === "avg-loading-delay"
        ? false
        : trend === "up";

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-10 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className={`flex h-11 w-11 3xl:h-14 3xl:w-14 5xl:h-18 5xl:w-18 items-center justify-center rounded-xl ${colors.iconBg}`}
        >
          {IconComponent && (
            <IconComponent
              className={`${colors.iconFg} 3xl:scale-125 5xl:scale-150`}
            />
          )}
        </div>

        {/* Trend badge */}
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 3xl:px-3 3xl:py-1 text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-semibold ${
            trendIsPositive ? "text-trend-up" : "text-trend-down"
          }`}
        >
          {isUp ? (
            <TrendUpIcon className="3xl:w-4 3xl:h-4 5xl:w-5 5xl:h-5" />
          ) : (
            <TrendDownIcon className="3xl:w-4 3xl:h-4 5xl:w-5 5xl:h-5" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-4 3xl:mt-5 5xl:mt-7 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-medium text-slate-500">
        {label}
      </p>

      {/* Value + Unit */}
      <div className="mt-1 flex items-baseline gap-1.5 3xl:gap-2">
        <span className="text-[28px] sm:text-[32px] 3xl:text-[40px] 5xl:text-[52px] font-bold text-brand-900 leading-none tracking-tight">
          {value}
        </span>
        <span className="text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-medium text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}
