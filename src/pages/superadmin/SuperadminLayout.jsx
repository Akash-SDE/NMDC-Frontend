import { useState, useEffect } from "react";
import SuperadminSidebar from "./shared/SuperadminSidebar";
import { useRouter } from "./../../context/RouterContext";

// Route-to-breadcrumb label map
const routeLabels = {
  "sa-roles": "Role Management",
  "sa-add-role": "Add Role",
  "sa-users": "User Management",
  "sa-add-user": "Add User",
};

function SuperadminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { currentRoute, navigate, user, logout } = useRouter();

  const handleLogout = () => {
    logout();
  };

  // Generate breadcrumb from current route
  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Home", route: "sa-roles" }];
    const label = routeLabels[currentRoute];
    if (label) {
      crumbs.push({ label, route: currentRoute });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

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

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 3xl:gap-3 text-[13px] 3xl:text-[16px] 5xl:text-[20px]">
              {breadcrumbs.map((crumb, index) => (
                <div
                  key={`${index}-${crumb.route}`}
                  className="flex items-center gap-2 3xl:gap-3"
                >
                  {index > 0 && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-400 3xl:w-5 3xl:h-5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  {index === 0 ? (
                    <button
                      onClick={() => navigate(crumb.route)}
                      className="text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="3xl:w-5 3xl:h-5"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </button>
                  ) : index === breadcrumbs.length - 1 ? (
                    <span className="text-slate-900 font-medium">
                      {crumb.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(crumb.route)}
                      className="text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      {crumb.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>
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
                  <div className="py-1">
                    <button className="w-full px-4 py-2 3xl:px-5 3xl:py-3 text-left text-[13px] 3xl:text-[15px] 5xl:text-[20px] text-slate-700 hover:bg-slate-100 flex items-center gap-3">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="3xl:w-5 3xl:h-5"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                      </svg>
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-200 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 3xl:px-5 3xl:py-3 text-left text-[13px] 3xl:text-[15px] 5xl:text-[20px] text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="3xl:w-5 3xl:h-5"
                      >
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content — replaces <Outlet /> */}
        <main className="p-4 sm:p-6 lg:p-8 3xl:p-12 5xl:p-16 text-slate-900">{children}</main>
      </div>
    </div>
  );
}

export default SuperadminLayout;
