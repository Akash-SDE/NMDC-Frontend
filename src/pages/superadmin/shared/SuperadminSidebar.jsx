import { useRouter } from "./../../../context/RouterContext";

const navSections = [
  {
    title: "MANAGEMENT",
    items: [
      {
        id: "sa-roles",
        label: "Role Management",
        icon: "shield",
        children: ["sa-add-role"],
      },
      {
        id: "sa-users",
        label: "User Management",
        icon: "users",
        children: ["sa-add-user"],
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

  function handleNavClick(routeId) {
    navigate(routeId);
    onClose();
  }

  function isActive(item) {
    return (
      currentRoute === item.id ||
      (item.children && item.children.includes(currentRoute))
    );
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 flex h-full w-64 3xl:w-80 5xl:w-96
        flex-col bg-white border-r border-slate-200
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 3xl:px-7 3xl:py-7 border-b border-slate-200">
        <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex-shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="3xl:w-6 3xl:h-6"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] 3xl:text-[18px] font-bold text-slate-900 leading-tight truncate">
            Super Admin
          </h1>
          <p className="text-[10px] 3xl:text-[12px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
            System Control
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 3xl:px-4 3xl:py-5 space-y-1">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pt-4 pb-2 text-[10px] 3xl:text-[12px] font-bold tracking-[0.08em] text-slate-400 uppercase">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = isActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                    3xl:px-4 3xl:py-3 5xl:px-5 5xl:py-4
                    text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-medium transition-all duration-150
                    ${
                      active
                        ? "bg-purple-50 text-purple-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }
                  `}
                >
                  <NavIcon
                    type={item.icon}
                    className={`flex-shrink-0 ${
                      active
                        ? "text-purple-600"
                        : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-200 px-3 py-3 3xl:px-4 3xl:py-4 space-y-1">
        {/* Switch to Admin */}
        <button
          onClick={() => navigate("dashboard")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 3xl:px-4 3xl:py-3 text-[14px] 3xl:text-[16px] font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="flex-shrink-0"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Admin Dashboard</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 3xl:px-4 3xl:py-3 text-[14px] 3xl:text-[16px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="flex-shrink-0"
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
