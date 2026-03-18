import { currentUser } from "../../data/user";
import { BellIcon, MenuIcon, ChevronDownIcon } from "../icons";

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-[64px] 3xl:h-[80px] 5xl:h-[100px] items-center justify-between border-b border-border-subtle bg-card px-4 sm:px-6 lg:px-8 3xl:px-12 5xl:px-16">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <h2 className="text-[20px] 3xl:text-[24px] 5xl:text-[32px] font-bold text-brand-900 whitespace-nowrap">
            Admin Dashboard
          </h2>
          <div className="h-6 3xl:h-7 5xl:h-9 w-px bg-slate-300" />
          <span className="text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500 whitespace-nowrap">
            Operations Overview
          </span>
        </div>

        {/* Mobile title */}
        <h2 className="sm:hidden text-[16px] font-bold text-brand-900 truncate">
          Admin Dashboard
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4 3xl:gap-6 5xl:gap-8 flex-shrink-0">
        {/* Notification bell */}
        <button
          className="relative flex h-10 w-10 3xl:h-12 3xl:w-12 5xl:h-14 5xl:w-14 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Notifications"
        >
          <BellIcon className="3xl:w-6 3xl:h-6 5xl:w-8 5xl:h-8" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 3xl:top-2.5 3xl:right-2.5 h-2 w-2 3xl:h-2.5 3xl:w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 3xl:gap-4 5xl:gap-5">
          {/* User info — hidden on small */}
          <div className="hidden md:block text-right">
            <p className="text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-brand-900 leading-tight">
              {currentUser.fullName}
            </p>
            <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400 leading-tight">
              {currentUser.role}
            </p>
          </div>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 3xl:h-12 3xl:w-12 5xl:h-16 5xl:w-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {/* Placeholder avatar with initials */}
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="avatarGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" fill="url(#avatarGrad)" />
                {/* Simple face silhouette */}
                <circle cx="20" cy="15" r="7" fill="#d97706" opacity="0.6" />
                <ellipse
                  cx="20"
                  cy="34"
                  rx="12"
                  ry="10"
                  fill="#d97706"
                  opacity="0.4"
                />
                <circle cx="20" cy="14" r="5.5" fill="#fde68a" />
                <ellipse cx="20" cy="32" rx="10" ry="8" fill="#fde68a" />
              </svg>
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 h-3 w-3 3xl:h-3.5 3xl:w-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>

          {/* Dropdown arrow */}
          <button className="hidden sm:flex h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-600">
            <ChevronDownIcon size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
