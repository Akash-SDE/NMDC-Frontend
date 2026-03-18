import React from "react";
import { currentUser } from "../../data/user";
import { useRouter } from "../../context/RouterContext";
import { BellIcon, MenuIcon, ChevronDownIcon } from "../icons";

const routeTitles = {
  dashboard: { title: "Admin Dashboard", subtitle: "Operations Overview" },
  "master-data": { title: "Master Data", subtitle: "Configuration Management" },
  "wagon-types": { title: "Master Data", subtitle: "Wagon Types" },
  "rail-sidings": { title: "Master Data", subtitle: "Siding Master" },
  "ore-categories": { title: "Master Data", subtitle: "Ore Type Master" },
  "customer-master": { title: "Master Data", subtitle: "Customer Master" },
  destinations: { title: "Master Data", subtitle: "Destination Master" },
  "route-mapping": { title: "Master Data", subtitle: "Route Master" },
  "stockpile-logs": { title: "Master Data", subtitle: "Stockpile Master" },
  "delay-categories": {
    title: "Master Data",
    subtitle: "Delay Category Master",
  },
};

export default function Header({ onMenuClick }) {
  const { currentRoute } = useRouter();
  const routeInfo = routeTitles[currentRoute] || routeTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 flex h-[64px] 3xl:h-[80px] 5xl:h-[100px] items-center justify-between border-b border-border-subtle bg-card px-4 sm:px-6 lg:px-8 3xl:px-12 5xl:px-16">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <h2 className="text-[20px] 3xl:text-[24px] 5xl:text-[32px] font-bold text-brand-900 whitespace-nowrap">
            {routeInfo.title}
          </h2>
          <div className="h-6 3xl:h-7 5xl:h-9 w-px bg-slate-300" />
          <span className="text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500 whitespace-nowrap">
            {routeInfo.subtitle}
          </span>
        </div>

        <h2 className="sm:hidden text-[16px] font-bold text-brand-900 truncate">
          {routeInfo.title}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4 3xl:gap-6 5xl:gap-8 flex-shrink-0">
        {/* System Online badge */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 3xl:px-4 3xl:py-1.5">
          <span className="h-2 w-2 3xl:h-2.5 3xl:w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[12px] 3xl:text-[14px] font-semibold text-emerald-700">
            System Online
          </span>
        </div>

        <button
          className="relative flex h-10 w-10 3xl:h-12 3xl:w-12 5xl:h-14 5xl:w-14 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Notifications"
        >
          <BellIcon className="3xl:w-6 3xl:h-6 5xl:w-8 5xl:h-8" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 3xl:gap-4 5xl:gap-5">
          <div className="hidden md:block text-right">
            <p className="text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-brand-900 leading-tight">
              {currentUser.fullName}
            </p>
            <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400 leading-tight">
              {currentUser.role}
            </p>
          </div>

          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 3xl:h-12 3xl:w-12 5xl:h-16 5xl:w-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="avGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" fill="url(#avGrad)" />
                <circle cx="20" cy="14" r="5.5" fill="#fde68a" />
                <ellipse cx="20" cy="32" rx="10" ry="8" fill="#fde68a" />
              </svg>
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>

          <button className="hidden sm:flex h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-600">
            <ChevronDownIcon size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
