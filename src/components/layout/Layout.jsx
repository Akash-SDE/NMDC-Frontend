import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AppBreadcrumb from "./AppBreadcrumb";
import { ROUTES } from "../../constants/routes";

export default function Layout({ children }) {
  const location = useLocation();
  const isOperationsCockpit = location.pathname.startsWith(ROUTES.ADMIN.OPERATIONS_COCKPIT);
  const isDailyOverview = location.pathname === ROUTES.ADMIN.DASHBOARD;
  const isFixedViewportPage = isOperationsCockpit || isDailyOverview;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleToggleCollapse = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    [],
  );

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden bg-[#f3f5f8]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main content area */}
      <div
        className={`flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-61.5"
        }`}
      >
        <Header onMenuClick={handleOpenSidebar} />
        <div
          className={
            isFixedViewportPage
              ? "shrink-0 px-2 pt-1.5 pb-0 sm:px-3 lg:px-3"
              : "shrink-0 px-3 pt-3 sm:px-5 lg:px-6"
          }
        >
          <AppBreadcrumb compact={isFixedViewportPage} />
        </div>
        <main
          className={
            isFixedViewportPage
              ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
              : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
