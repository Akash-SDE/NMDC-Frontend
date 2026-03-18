import React from "react";

const tabs = [
  { id: "rail-sidings", label: "Rail Sidings" },
  { id: "wagon-types", label: "Wagon Types" },
  { id: "ore-categories", label: "Ore Categories" },
  { id: "customer-master", label: "Customers" },
  { id: "destinations", label: "Destinations" },
  { id: "route-mapping", label: "Routes" },
  { id: "stockpile-logs", label: "Stockpiles" },
  { id: "delay-categories", label: "Delay Categories" },
];

export default function MasterDataTabs({ activeTab, onTabChange }) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative whitespace-nowrap px-4 py-3 3xl:px-6 3xl:py-4 5xl:px-8 5xl:py-5
                text-[13px] sm:text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold
                transition-all duration-200 border-b-2 flex-shrink-0
                ${
                  isActive
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }
              `}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
