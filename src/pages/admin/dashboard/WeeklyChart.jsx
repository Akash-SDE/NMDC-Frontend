import { useState } from "react";
import { weeklyChartData, chartMeta } from "../../../data/chart";
import { ChevronDownIcon } from "./../../../components/icons/index";

function BarGroup({ dayData, maxValue, index }) {
  const s01Height = (dayData.siding01 / maxValue) * 100;
  const s02Height = (dayData.siding02 / maxValue) * 100;

  return (
    <div className="flex flex-col items-center gap-2 3xl:gap-3 5xl:gap-4 flex-1 min-w-0">
      {/* Bars container */}
      <div className="relative flex items-end justify-center gap-1.5 3xl:gap-2 5xl:gap-3 w-full h-[180px] sm:h-[200px] lg:h-[220px] 3xl:h-[280px] 5xl:h-[380px]">
        {/* Siding 01 bar */}
        <div
          className="w-5 sm:w-6 lg:w-7 3xl:w-9 5xl:w-12 rounded-t-md bg-brand-600 transition-all duration-500 ease-out hover:bg-brand-700 cursor-pointer"
          style={{
            height: `${s01Height}%`,
          }}
          title={`Siding 01: ${dayData.siding01} Tons`}
        />
        {/* Siding 02 bar */}
        <div
          className="w-5 sm:w-6 lg:w-7 3xl:w-9 5xl:w-12 rounded-t-md bg-brand-200 transition-all duration-500 ease-out hover:bg-brand-500 cursor-pointer"
          style={{
            height: `${s02Height}%`,
          }}
          title={`Siding 02: ${dayData.siding02} Tons`}
        />
      </div>

      {/* Day label */}
      <span className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-medium text-slate-500">
        {dayData.day}
      </span>
    </div>
  );
}

export default function WeeklyChart() {
  const [filter] = useState(chartMeta.filterLabel);
  const maxValue = Math.max(
    ...weeklyChartData.flatMap((d) => [d.siding01, d.siding02]),
  );

  return (
    <div className="rounded-xl border border-border-subtle bg-card p-5 sm:p-6 3xl:p-8 5xl:p-12 shadow-sm h-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 3xl:mb-8 5xl:mb-12">
        <div>
          <h3 className="text-[18px] sm:text-[20px] 3xl:text-[24px] 5xl:text-[32px] font-bold text-brand-900">
            {chartMeta.title}
          </h3>
          <p className="mt-0.5 text-[13px] 3xl:text-[15px] 5xl:text-[20px] text-slate-500">
            {chartMeta.subtitle}
          </p>
        </div>

        {/* Filter dropdown */}
        <button className="flex items-center gap-1.5 3xl:gap-2 rounded-lg border border-border-subtle px-3 py-1.5 3xl:px-4 3xl:py-2 5xl:px-6 5xl:py-3 text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:shadow-md self-start">
          <span>{filter}</span>
          <ChevronDownIcon
            size={14}
            className="text-slate-400 3xl:w-4 3xl:h-4 5xl:w-5 5xl:h-5"
          />
        </button>
      </div>

      {/* Y-axis labels + Chart area */}
      <div className="flex gap-3 3xl:gap-4 5xl:gap-6">
        {/* Y-axis */}
        <div className="flex flex-col justify-between h-[180px] sm:h-[200px] lg:h-[220px] 3xl:h-[280px] 5xl:h-[380px] text-[10px] 3xl:text-[12px] 5xl:text-[16px] text-slate-400 font-medium pr-1">
          {[100, 75, 50, 25, 0].map((tick) => (
            <span key={tick} className="leading-none">
              {tick}
            </span>
          ))}
        </div>

        {/* Bars area */}
        <div className="flex-1 flex flex-col">
          {/* Grid lines + bars */}
          <div className="relative flex-1">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full border-b border-dashed border-slate-100"
                />
              ))}
            </div>

            {/* Bar groups */}
            <div className="relative flex items-end justify-between gap-1 sm:gap-2 3xl:gap-3 5xl:gap-5 h-[180px] sm:h-[200px] lg:h-[220px] 3xl:h-[280px] 5xl:h-[380px] px-1">
              {weeklyChartData.map((dayData, index) => (
                <BarGroup
                  key={dayData.day}
                  dayData={dayData}
                  maxValue={maxValue}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 3xl:gap-8 5xl:gap-12 mt-5 3xl:mt-7 5xl:mt-10 pt-4 3xl:pt-5 5xl:pt-7 border-t border-slate-100">
        {chartMeta.legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2 3xl:gap-3">
            <div
              className="h-3 w-3 3xl:h-4 3xl:w-4 5xl:h-5 5xl:w-5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-medium text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
