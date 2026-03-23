import React from "react";
import { currentUser } from "../../data/user";
import { BellIcon, MenuIcon } from "../icons";

export default function Header({ onMenuClick }) {
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
        <div className="flex flex-col text-blue-700">
          <h1 className="truncate text-[13px] sm:text-[15px] lg:text-[17px] 3xl:text-[22px] 5xl:text-[28px] font-bold tracking-[0.04em] uppercase">
            RAKE DISPATCH MANAGEMENT SYSTEM
          </h1>
          <small className="text-black font-bold">
            BIOM Bacheli Complex, Dantewada(C.G.)
          </small>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4 3xl:gap-6 5xl:gap-8 flex-shrink-0">
        <div className="relative flex-shrink-0 group">
          <div className="h-10 w-10 3xl:h-12 3xl:w-12 5xl:h-16 5xl:w-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <defs>
                <linearGradient id="avGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

          <div className="pointer-events-none absolute right-0 top-full mt-3 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-lg opacity-0 invisible translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-xs font-bold text-amber-800">
                  {currentUser.firstName[0]}
                  {currentUser.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentUser.fullName}
                  </p>
                  <p className="text-xs text-slate-500">Admin</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <p className="text-xs text-slate-600">
                  <span className="font-medium">Email:</span> admin@nmdc.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
