import { useState, useEffect } from "react";
import SuperadminSidebar from "./shared/SuperadminSidebar";
import { useRouter } from "./../../context/RouterContext";

function SuperadminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user } = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <SuperadminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 3xl:lg:pl-80 5xl:lg:pl-96">
        {/* Header */}
        <header className="h-16 3xl:h-20 5xl:h-24 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 3xl:px-10 5xl:px-14 sticky top-0 z-30 transition-colors">
          {/* Left Side - Mobile Menu + Breadcrumbs */}
          <div className="flex items-center gap-4 3xl:gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
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
          <div className="flex-1 flex flex-col justify-start items-start px-4 overflow-hidden">
            <h2 className="font-extrabold text-sm sm:text-base md:text-xl lg:text-2xl text-[#1D4ED8] text-center truncate">
              RAKE DISPATCH MANAGEMENT SYSTEM
            </h2>
            <small className="text-lg text-black font-bold">
              BIOM Bacheli Complex, Dantewada(C.G.)
            </small>
          </div>
          {/* Right Side */}
          <div className="flex items-center gap-2 3xl:gap-3 5xl:gap-4">
            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-trigger flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 3xl:w-10 3xl:h-10 5xl:w-12 5xl:h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white 3xl:w-5 3xl:h-5"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="profile-dropdown absolute right-0 mt-2 w-56 3xl:w-64 5xl:w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-slideDown">
                  <div className="px-4 py-3 3xl:px-5 3xl:py-4 border-b border-slate-200">
                    <p className="text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-slate-800">
                      {user?.name || "Super Admin"}
                    </p>
                    <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-500">
                      {user?.username || "superadmin"}@system.com
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 3xl:p-12 5xl:p-16 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SuperadminLayout;
