import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AppBreadcrumb from "./AppBreadcrumb";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#f3f5f8]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main content area */}
      <div
        className={`flex flex-1 min-w-0 flex-col transition-[padding] duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-61.5"
        }`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="px-4 pt-3 sm:px-5 lg:px-6">
          <AppBreadcrumb />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
