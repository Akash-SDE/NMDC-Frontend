import { getSidebarSections, signOutItem } from "../../data/navigation";
import { useRouter } from "../../context/RouterContext";
import { iconMap, CloseIcon, Logo } from "../icons";

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

export default function Sidebar({ isOpen, onClose }) {
  const { currentRoute, navigate, userRole, logout } = useRouter();
  const sidebarSections = getSidebarSections(userRole);
  const masterDataRoutes = [
    "master-data",
    "rail-sidings",
    "wagon-types",
    "ore-categories",
    "customer-master",
    "destinations",
    "route-mapping",
    "stockpile-logs",
    "delay-categories",
  ];

  function handleItemClick(item) {
    navigate(item.id);
    onClose();
  }

  function handleSignOut() {
    logout();
    onClose();
  }

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 flex h-full w-61.5 flex-col
        border-r border-slate-200 bg-[#eef1f5]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded bg-[#1d67c4] p-1.5 shadow-sm">
          <Logo size={34} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[14px] font-bold text-slate-800">Iron Forge</h1>
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Operational System
          </p>
        </div>

        <button
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          aria-label="Close sidebar"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sidebarSections.map((section) => (
          <div key={section.id}>
            {section.title && (
              <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive =
                currentRoute === item.id ||
                (item.id === "master-data" &&
                  masterDataRoutes.includes(currentRoute));

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "border-l-[3px] border-blue-600 bg-white text-blue-700 shadow-sm"
                      : "border-l-[3px] border-transparent text-slate-700 hover:bg-white"
                  }`}
                >
                  {IconComponent ? (
                    <IconComponent
                      size={16}
                      className={isActive ? "text-blue-600" : "text-slate-500"}
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          className="w-full rounded-md bg-[#1d67c4] px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm hover:bg-[#1657a8]"
        >
          New Dispatch
        </button>
      </div>

      {/* Footer actions */}
      <div className="border-t border-slate-200 bg-[#e8ecf2] px-3 py-3">
        <button
          type="button"
          className="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-white"
        >
          <CircleHelpIcon />
          <span>Help Center</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-white"
        >
          {(() => {
            const Icon = iconMap[signOutItem.icon];
            return Icon ? <Icon size={20} className="shrink-0" /> : null;
          })()}
          <span>{signOutItem.label}</span>
        </button>
      </div>
    </aside>
  );
}
