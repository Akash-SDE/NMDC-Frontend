import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSidebarSections, signOutItem } from "../../data/navigation";
import { useRouter } from "../../context/RouterContext";
import { iconMap, ChevronDownIcon, CloseIcon, Logo } from "../icons";

function CircleHelpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CollapseLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="4" x2="18" y2="20" />
      <polyline points="14 8 8 12 14 16" />
    </svg>
  );
}

function CollapseRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="4" x2="6" y2="20" />
      <polyline points="10 8 16 12 10 16" />
    </svg>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) {
  const { currentRoute, navigate, userRole, logout } = useRouter();
  const sidebarSections = getSidebarSections(userRole);

  const [openSubmenus, setOpenSubmenus] = useState({
    "master-data": true,
  });
  const [floatingSubmenu, setFloatingSubmenu] = useState(null);
  const floatingCloseTimerRef = useRef(null);

  const masterDataRoutes = useMemo(() => {
    const allItems = sidebarSections.flatMap((section) => section.items);
    const masterDataItem = allItems.find((item) => item.id === "master-data");
    return (masterDataItem?.children || []).map((child) => child.id);
  }, [sidebarSections]);

  useEffect(() => {
    if (masterDataRoutes.includes(currentRoute)) {
      setOpenSubmenus((prev) => ({ ...prev, "master-data": true }));
    }
  }, [currentRoute, masterDataRoutes]);

  useEffect(() => {
    return () => {
      if (floatingCloseTimerRef.current) {
        window.clearTimeout(floatingCloseTimerRef.current);
      }
    };
  }, []);

  function clearFloatingCloseTimer() {
    if (floatingCloseTimerRef.current) {
      window.clearTimeout(floatingCloseTimerRef.current);
      floatingCloseTimerRef.current = null;
    }
  }

  function scheduleCloseFloatingSubmenu() {
    clearFloatingCloseTimer();
    floatingCloseTimerRef.current = window.setTimeout(() => {
      setFloatingSubmenu(null);
    }, 140);
  }

  function openFloatingSubmenu(item, event) {
    if (!isCollapsed || !Array.isArray(item.children) || item.children.length === 0) {
      return;
    }

    clearFloatingCloseTimer();
    const itemRect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = Math.min(360, item.children.length * 38 + 56);
    const viewportHeight = window.innerHeight;
    const top = Math.min(
      Math.max(12, itemRect.top),
      Math.max(12, viewportHeight - estimatedHeight - 12),
    );

    setFloatingSubmenu({
      id: item.id,
      label: item.label,
      children: item.children,
      top,
      left: itemRect.right + 10,
    });
  }

  function isItemActive(item) {
    const childRoutes = (item.children || []).map((child) => child.id);
    return currentRoute === item.id || childRoutes.includes(currentRoute);
  }

  function handleItemClick(item, isChild = false) {
    if (item.children && !isChild) {
      if (!isCollapsed) {
        setOpenSubmenus((prev) => ({
          ...prev,
          [item.id]: !prev[item.id],
        }));
      }
      navigate(item.id);
      return;
    }

    navigate(item.id);
    onClose();
  }

  function handleSignOut() {
    logout();
    onClose();
  }

  return (
    <>
      <aside
      className={`
        fixed left-0 top-0 z-50 flex h-full w-61.5 overflow-hidden flex-col
        ${isCollapsed ? "lg:w-20" : "lg:w-61.5"}
        border-r border-slate-200 bg-[#eef1f5] shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div
        className={`relative flex items-center gap-3 border-b border-slate-200 px-4 py-4 ${
          isCollapsed ? "lg:justify-center lg:px-2 lg:py-3" : ""
        }`}
      >
        <div
          className={`flex items-center justify-center rounded p-1.5 shadow-sm ${
            isCollapsed ? "h-10 w-10" : "h-11 w-11"
          }`}
        >
          <Logo size={34} className="h-full w-full object-contain" />
        </div>

        <div className={`min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
          <h1 className="truncate text-[14px] font-bold text-slate-800">NMDC</h1>
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Admin Panel
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </div>

      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 z-80 hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition-all hover:scale-105 hover:bg-slate-50 hover:text-slate-800 lg:flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <CollapseRightIcon /> : <CollapseLeftIcon />}
      </button>

      <nav
        className={`flex-1 space-y-1 overflow-x-visible overflow-y-auto px-3 py-4 ${
          isCollapsed ? "lg:px-2" : ""
        }`}
      >
        {sidebarSections.map((section) => (
          <div key={section.id}>
            {section.title && (
              <p
                className={`px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
              >
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive = isItemActive(item);
              const hasChildren = Array.isArray(item.children) && item.children.length > 0;
              const isSubmenuOpen = !!openSubmenus[item.id];
              const baseExpandedClass = isActive
                ? "border-l-[3px] border-blue-600 bg-white text-blue-700 shadow-sm"
                : "border-l-[3px] border-transparent text-slate-700 hover:bg-white";
              const baseCollapsedClass = isActive
                ? "mx-auto h-11 w-11 justify-center rounded-xl border border-blue-200 bg-white text-blue-700 shadow-sm"
                : "mx-auto h-11 w-11 justify-center rounded-xl border border-transparent text-slate-500 hover:bg-white";

              return (
                <div
                  key={item.id}
                  className="group relative"
                  onMouseEnter={(event) => openFloatingSubmenu(item, event)}
                  onMouseLeave={() => {
                    if (isCollapsed && hasChildren) {
                      scheduleCloseFloatingSubmenu();
                    }
                  }}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`group flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      isCollapsed ? baseCollapsedClass : `rounded-md ${baseExpandedClass}`
                    }`}
                  >
                    {IconComponent ? (
                      <IconComponent
                        size={16}
                        className={isActive ? "text-blue-600" : "text-slate-500"}
                      />
                    ) : null}
                    <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                      {item.label}
                    </span>
                    {hasChildren ? (
                      <ChevronDownIcon
                        className={`ml-auto shrink-0 text-slate-400 transition-transform ${
                          isSubmenuOpen ? "rotate-180" : ""
                        } ${isCollapsed ? "lg:hidden" : ""}`}
                      />
                    ) : null}
                  </button>

                  {hasChildren && (
                    <div
                      className={`overflow-hidden pl-6 pr-1 transition-all duration-200 ${
                        isSubmenuOpen ? "mt-1 max-h-96 opacity-100" : "max-h-0 opacity-0"
                      } ${isCollapsed ? "lg:hidden" : ""}`}
                    >
                      <div className="space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = currentRoute === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleItemClick(child, true)}
                              className={`w-full rounded-md px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                                isChildActive
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-600 hover:bg-white"
                              }`}
                            >
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isCollapsed && !hasChildren ? (
                    <div className="pointer-events-none invisible absolute left-[calc(100%+10px)] top-1/2 z-70 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 opacity-0 shadow-lg transition-all duration-150 lg:group-hover:visible lg:group-hover:opacity-100">
                      {item.label}
                    </div>
                  ) : null}

                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-200 bg-[#e8ecf2] px-3 py-3">
        <div className="group relative">
          <button
            onClick={handleSignOut}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-white ${
              isCollapsed ? "mx-auto h-10 w-10 justify-center px-0" : ""
            }`}
          >
            {(() => {
              const Icon = iconMap[signOutItem.icon];
              return Icon ? <Icon size={20} className="shrink-0" /> : null;
            })()}
            <span className={isCollapsed ? "lg:hidden" : ""}>{signOutItem.label}</span>
          </button>
          {isCollapsed ? (
            <div className="pointer-events-none invisible absolute left-[calc(100%+10px)] top-1/2 z-70 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 opacity-0 shadow-lg transition-all duration-150 lg:group-hover:visible lg:group-hover:opacity-100">
              {signOutItem.label}
            </div>
          ) : null}
        </div>
      </div>
      </aside>

      {isCollapsed && floatingSubmenu && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-200 w-56 rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm"
              style={{ top: floatingSubmenu.top, left: floatingSubmenu.left }}
              onMouseEnter={() => clearFloatingCloseTimer()}
              onMouseLeave={() => scheduleCloseFloatingSubmenu()}
            >
              <div className="border-b border-slate-100 px-3 py-2 text-[12px] font-bold text-slate-800">
                {floatingSubmenu.label}
              </div>
              <div className="space-y-1 p-2">
                {floatingSubmenu.children.map((child) => {
                  const isChildActive = currentRoute === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        handleItemClick(child, true);
                        setFloatingSubmenu(null);
                      }}
                      className={`w-full rounded-md px-2.5 py-2 text-left text-[12px] font-medium transition-colors ${
                        isChildActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {child.label}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}