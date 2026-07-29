import { useCallback, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AppBreadcrumb from "./AppBreadcrumb";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleToggleCollapse = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    [],
  );

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f3f5f8]">
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
        className={`flex flex-1 min-w-0 flex-col transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-61.5"
        }`}
      >
        <Header onMenuClick={handleOpenSidebar} />
        <div className="px-3 pt-3 sm:px-5 lg:px-6">
          <AppBreadcrumb />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
