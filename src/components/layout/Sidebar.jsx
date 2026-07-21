import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSidebarSections, signOutItem } from "../../data/navigation";
import { useRouter } from "../../context/RouterContext";
import { iconMap, ChevronDownIcon, CloseIcon, Logo } from "../icons";

/* ── Inline Icon Components (unchanged) ─────────────────────────── */

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

/* ── Reusable collapsed-tooltip ──────────────────────────────────── */

function CollapsedTooltip({ label, groupClass = "group-hover/item" }) {
  return (
    <div
      className={`
        pointer-events-none invisible absolute left-[calc(100%+12px)] top-1/2
        z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg border
        border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold
        text-slate-700 opacity-0 shadow-lg transition-all duration-150 ease-out
        lg:${groupClass}:visible lg:${groupClass}:opacity-100
      `}
    >
      {label}
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) {
  const { currentRoute, navigate, userRole, logout } = useRouter();
  const sidebarSections = getSidebarSections(userRole);

  const [openSubmenus, setOpenSubmenus] = useState({});
  const [floatingSubmenu, setFloatingSubmenu] = useState(null);
  const floatingCloseTimerRef = useRef(null);

  /* ── derived data ── */
  const submenuParentByRoute = useMemo(() => {
    const parentMap = {};
    sidebarSections
      .flatMap((section) => section.items)
      .forEach((item) => {
        (item.children || []).forEach((child) => {
          parentMap[child.id] = item.id;
        });
      });
    return parentMap;
  }, [sidebarSections]);

  /* ── effects ── */
  useEffect(() => {
    const parentId = submenuParentByRoute[currentRoute];
    if (!parentId) {
      setOpenSubmenus({});
      return;
    }
    setOpenSubmenus({ [parentId]: true });
  }, [currentRoute, submenuParentByRoute]);

  useEffect(() => {
    return () => {
      if (floatingCloseTimerRef.current)
        window.clearTimeout(floatingCloseTimerRef.current);
    };
  }, []);

  /* ── floating-submenu helpers ── */
  function clearFloatingCloseTimer() {
    if (floatingCloseTimerRef.current) {
      window.clearTimeout(floatingCloseTimerRef.current);
      floatingCloseTimerRef.current = null;
    }
  }

  function scheduleCloseFloatingSubmenu() {
    clearFloatingCloseTimer();
    floatingCloseTimerRef.current = window.setTimeout(
      () => setFloatingSubmenu(null),
      140,
    );
  }

  function openFloatingSubmenu(item, event) {
    if (
      !isCollapsed ||
      !Array.isArray(item.children) ||
      item.children.length === 0
    )
      return;

    clearFloatingCloseTimer();
    const rect = event.currentTarget.getBoundingClientRect();
    const estH = Math.min(360, item.children.length * 38 + 56);
    const vh = window.innerHeight;

    setFloatingSubmenu({
      id: item.id,
      label: item.label,
      children: item.children,
      top: Math.min(Math.max(12, rect.top), Math.max(12, vh - estH - 12)),
      left: rect.right + 10,
    });
  }

  /* ── navigation helpers ── */
  function isItemActive(item) {
    const childIds = (item.children || []).map((c) => c.id);
    return currentRoute === item.id || childIds.includes(currentRoute);
  }

  function handleItemClick(item, isChild = false) {
    if (item.children && !isChild) {
      if (!isCollapsed) {
        setOpenSubmenus((p) => ({ ...p, [item.id]: !p[item.id] }));
      }
      return;
    }
    navigate(item.id);
    onClose();
  }

  function handleSignOut() {
    logout();
    onClose();
  }

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <>
      {/* ── Mobile Backdrop ── */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]
          transition-opacity duration-300 ease-out lg:hidden
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Sidebar Shell ── */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-dvh flex-col
          w-64 border-r border-slate-200 bg-[#eef1f5] shadow-lg
          will-change-transform
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* ────────────────── Header ────────────────── */}
        <div
          className={`
            relative flex shrink-0 items-center border-b border-slate-200
            transition-all duration-300
            ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3.5" : ""}
            gap-3 px-5 py-4
          `}
        >
          {/* Logo */}
          <div
            className={`
              flex shrink-0 items-center justify-center rounded-lg shadow-sm
              transition-all duration-200
              ${isCollapsed ? "h-10 w-10" : "h-11 w-11"}
            `}
          >
            <Logo size={34} className="h-full w-full object-contain" />
          </div>

          {/* Brand text */}
          <div className={`min-w-0 flex-1 ${isCollapsed ? "lg:hidden" : ""}`}>
            <h1 className="truncate text-sm font-bold leading-tight text-slate-800">
              NMDC
            </h1>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Admin Panel
            </p>
          </div>

          {/* Controls */}
          <div className="flex shrink-0 items-center">
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
              aria-label="Close sidebar"
            >
              <CloseIcon size={20} />
            </button>

            {/* Desktop collapse toggle – flush on sidebar edge */}
            <button
              onClick={onToggleCollapse}
              className={`
                hidden lg:flex
                h-7 w-7 items-center justify-center
                rounded-full border border-slate-200 bg-white text-slate-500
                shadow-sm transition-all duration-200
                hover:bg-slate-50 hover:text-slate-700 hover:shadow
                ${isCollapsed ? "absolute -right-3.5 top-16 z-60 -translate-y-1/2" : ""}
              `}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <CollapseRightIcon /> : <CollapseLeftIcon />}
            </button>
          </div>
        </div>

        {/* ────────────────── Navigation ────────────────── */}
        <nav
          className={`
            flex-1 overflow-x-visible overflow-y-auto
            [&::-webkit-scrollbar]:w-[3px]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-300/60
            [&::-webkit-scrollbar-track]:bg-transparent
            transition-all duration-300
            ${isCollapsed ? "lg:px-2 lg:py-3" : "px-3 py-3"}
            px-3 py-3
          `}
        >
          {sidebarSections.map((section) => (
            <div key={section.id} className="space-y-0.5">
              {/* Section title */}
              {section.title && (
                <p
                  className={`
                    px-3 pb-2 pt-5 text-[10px] font-bold uppercase
                    tracking-[0.1em] text-slate-400
                    ${isCollapsed ? "lg:hidden" : ""}
                  `}
                >
                  {section.title}
                </p>
              )}

              {/* Items */}
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const active = isItemActive(item);
                const hasKids =
                  Array.isArray(item.children) && item.children.length > 0;
                const submenuOpen = !!openSubmenus[item.id];

                return (
                  <div
                    key={item.id}
                    className="group/item relative"
                    onMouseEnter={(e) => openFloatingSubmenu(item, e)}
                    onMouseLeave={() => {
                      if (isCollapsed && hasKids) scheduleCloseFloatingSubmenu();
                    }}
                  >
                    {/* ── Item button ── */}
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`
                        relative flex w-full items-center text-[13px] font-medium
                        transition-all duration-200 ease-out
                        ${
                          isCollapsed
                            ? /* ▸ collapsed */
                              active
                              ? "mx-auto h-11 w-11 justify-center rounded-xl border border-blue-200 bg-white text-blue-700 shadow-sm"
                              : "mx-auto h-11 w-11 justify-center rounded-xl border border-transparent text-slate-500 hover:bg-white"
                            : /* ▸ expanded */
                              active
                              ? "gap-3 rounded-lg border-l-[3px] border-blue-600 bg-white px-3 py-2.5 text-blue-700 shadow-sm"
                              : "gap-3 rounded-lg border-l-[3px] border-transparent px-3 py-2.5 text-slate-700 hover:bg-white"
                        }
                      `}
                    >
                      {/* icon wrapper – fixed 20 × 20 keeps every row aligned */}
                      {Icon && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          <Icon
                            size={16}
                            className={
                              active ? "text-blue-600" : "text-slate-500"
                            }
                          />
                        </span>
                      )}

                      <span
                        className={`
                          min-w-0 flex-1 truncate text-left
                          ${isCollapsed ? "lg:hidden" : ""}
                        `}
                      >
                        {item.label}
                      </span>

                      {hasKids && (
                        <ChevronDownIcon
                          className={`
                            ml-auto shrink-0 text-slate-400
                            transition-transform duration-200
                            ${submenuOpen ? "rotate-180" : "rotate-0"}
                            ${isCollapsed ? "lg:hidden" : ""}
                          `}
                        />
                      )}
                    </button>

                    {/* ── Submenu accordion (expanded mode) ── */}
                    {hasKids && (
                      <div
                        className={`
                          overflow-hidden transition-all duration-200 ease-out
                          ${submenuOpen ? "mt-0.5 max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
                          ${isCollapsed ? "lg:hidden" : ""}
                        `}
                      >
                        <div className="ml-[22px] space-y-0.5 border-l border-slate-200/80 py-1 pl-3">
                          {item.children.map((child) => {
                            const childActive = currentRoute === child.id;
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleItemClick(child, true)}
                                className={`
                                  w-full rounded-md px-3 py-2 text-left text-[12px]
                                  font-medium transition-colors duration-150
                                  ${
                                    childActive
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-slate-600 hover:bg-white"
                                  }
                                `}
                              >
                                {child.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Collapsed tooltip (leaf items) ── */}
                    {isCollapsed && !hasKids && (
                      <CollapsedTooltip label={item.label} groupClass="group-hover/item" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        {/* ────────────────── Footer ────────────────── */}
        <div
          className={`
            shrink-0 space-y-0.5 border-t border-slate-200 bg-[#e8ecf2]
            transition-all duration-300
            ${isCollapsed ? "lg:px-2.5 lg:py-2.5" : "px-3 py-3"}
            px-3 py-3
          `}
        >
          {/* Sign Out */}
          <div className="group/signout relative">
            <button
              onClick={handleSignOut}
              className={`
                flex w-full items-center text-[13px] font-medium text-red-600
                transition-colors duration-150 hover:bg-white
                ${
                  isCollapsed
                    ? "mx-auto h-10 w-10 justify-center rounded-xl"
                    : "gap-3 rounded-lg px-3 py-2"
                }
              `}
            >
              {(() => {
                const SignOutIcon = iconMap[signOutItem.icon];
                return SignOutIcon ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <SignOutIcon size={20} className="shrink-0" />
                  </span>
                ) : null;
              })()}
              <span className={isCollapsed ? "lg:hidden" : ""}>
                {signOutItem.label}
              </span>
            </button>
            {isCollapsed && (
              <CollapsedTooltip
                label={signOutItem.label}
                groupClass="group-hover/signout"
              />
            )}
          </div>
        </div>
      </aside>

      {/* ────────────────── Floating Submenu (portal) ────────────────── */}
      {isCollapsed &&
      floatingSubmenu &&
      typeof document !== "undefined"
        ? createPortal(
            <div
              className="
                fixed z-[200] w-52 rounded-xl border border-slate-200
                bg-white/95 shadow-xl backdrop-blur-sm
              "
              style={{ top: floatingSubmenu.top, left: floatingSubmenu.left }}
              onMouseEnter={clearFloatingCloseTimer}
              onMouseLeave={scheduleCloseFloatingSubmenu}
            >
              <div className="border-b border-slate-100 px-3.5 py-2.5 text-[12px] font-bold text-slate-800">
                {floatingSubmenu.label}
              </div>

              <div className="space-y-0.5 p-2">
                {floatingSubmenu.children.map((child) => {
                  const childActive = currentRoute === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        handleItemClick(child, true);
                        setFloatingSubmenu(null);
                      }}
                      className={`
                        w-full rounded-lg px-3 py-2 text-left text-[12px]
                        font-medium transition-colors duration-150
                        ${
                          childActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }
                      `}
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