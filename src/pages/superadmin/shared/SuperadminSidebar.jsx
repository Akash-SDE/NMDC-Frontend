import { useRouter } from "./../../../context/RouterContext";
import { Logo } from "./../../../components/icons";

const navSections = [
  {
    id: "management",
    title: "MANAGEMENT",
    items: [
      {
        id: "sa-roles",
        label: "Role Management",
        icon: "shield",
        matchRoutes: ["sa-roles", "sa-add-role"],
      },
      {
        id: "sa-users",
        label: "User Management",
        icon: "users",
        matchRoutes: ["sa-users", "sa-add-user", "sa-edit-user"],
      },
    ],
  },
];

function NavIcon({ type, className = "" }) {
  const icons = {
    shield: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    users: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  };
  return icons[type] || null;
}

export default function SuperadminSidebar({ isOpen, onClose }) {
  const { currentRoute, navigate, logout } = useRouter();

  function isItemActive(item) {
    return (item.matchRoutes || [item.id]).includes(currentRoute);
  }

  function handleItemClick(item) {
    navigate(item.id);
    onClose?.();
  }

  function handleSignOut() {
    logout();
    onClose?.();
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 flex h-full w-64
        flex-col bg-[#eef1f5] border-r border-slate-200 shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 3xl:px-7 3xl:py-7 border-b border-slate-200 bg-[#eef1f5]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm">
          <Logo size={34} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] 3xl:text-[18px] font-bold text-slate-800 leading-tight truncate">
            NMDC
          </h1>
          <p className="text-[10px] 3xl:text-[12px] font-semibold tracking-widest text-slate-500 uppercase">
            Super Admin Panel
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="
          flex-1 overflow-x-visible overflow-y-auto px-3 py-3
          [&::-webkit-scrollbar]:w-0.75
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-300/60
          [&::-webkit-scrollbar-track]:bg-transparent
        "
      >
        {navSections.map((section) => (
          <div key={section.id} className="space-y-0.5">
            <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = isItemActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    relative flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5
                    text-[13px] font-medium transition-all duration-200 ease-out
                    ${
                      active
                        ? "border-blue-600 bg-white text-blue-700 shadow-sm"
                        : "border-transparent text-slate-700 hover:bg-white"
                    }
                  `}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <NavIcon
                      type={item.icon}
                      className={active ? "text-blue-600" : "text-slate-500"}
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 space-y-0.5 border-t border-slate-200 bg-[#e8ecf2] px-3 py-3">
        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors duration-150 hover:bg-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="shrink-0"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
