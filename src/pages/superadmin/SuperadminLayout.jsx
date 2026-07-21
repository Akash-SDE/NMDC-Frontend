import { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperadminSidebar from "./shared/SuperadminSidebar";
import { useRouter } from "./../../context/RouterContext";
import Breadcrumb from "./shared/Breadcrumb";

function SuperadminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user } = useRouter();
  const initials = (user?.name || "Super Admin")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const roleLabel = (user?.role || "superadmin")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(" ");

  const normalizedUsername = (user?.username || "superadmin")
    .toLowerCase()
    .replace(/\s+/g, ".");
  const email = user?.email || `${normalizedUsername}@nmdc.local`;

  return (
    <div className="flex min-h-screen w-full bg-[#f3f5f8]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <SuperadminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-100 shadow-lg bg-[#F3F5F8] py-2">
          <div className="flex h-15.5 items-center justify-between rounded-xl px-3 sm:px-4 lg:px-5">
          {/* Left Side - Mobile Menu + Breadcrumbs */}
          <div className="flex items-center gap-4 pr-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-600 3xl:w-7 3xl:h-7"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[18px] font-extrabold leading-none text-[#1f4ec9] sm:text-[26px]">
              RAKE DISPATCH MANAGEMENT SYSTEM
            </h2>
            <p className="mt-1 truncate text-[14px] font-bold leading-none text-black sm:text-[22px]">
              BIOM Bacheli Complex, Dantewada(C.G.)
            </p>
          </div>
          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-trigger flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-linear-to-br from-[#164ba5] to-[#0f2f67] text-[12px] font-bold text-white"
              >
                {initials}
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="profile-dropdown absolute right-0 top-12 z-40 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg animate-slideDown">
                  <div className="border-b border-slate-100 pb-2">
                    <p className="text-xs font-semibold text-slate-800">{user?.name || "Super Admin"}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{roleLabel}</p>
                  </div>
                  <p className="pt-2 text-xs text-slate-500">{email}</p>
                </div>
              )}
            </div>
          </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 text-slate-900">
          <Breadcrumb />
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default SuperadminLayout;
