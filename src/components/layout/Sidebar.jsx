import { useState } from "react";
import { sidebarSections, signOutItem } from "../../data/navigation";
import { useRouter } from "../../context/RouterContext";
import { iconMap, ChevronDownIcon, CloseIcon } from "../icons";

export default function Sidebar({ isOpen, onClose }) {
  const { currentRoute, navigate } = useRouter();
  const [expandedItems, setExpandedItems] = useState(["master-data"]);

  function toggleExpand(id) {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleItemClick(item) {
    if (item.subItems) {
      toggleExpand(item.id);
    } else {
      navigate(item.id);
      onClose();
    }
  }

  function handleSignOut() {
    navigate("login");
    onClose();
  }

  // Determine active state — master data sub-items
  const masterDataSubIds = [
    "wagon-types",
    "rail-sidings",
    "ore-categories",
    "customer-master",
    "destinations",
    "route-mapping",
    "stockpile-logs",
  ];
  const isMasterDataActive =
    masterDataSubIds.includes(currentRoute) || currentRoute === "master-data";

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 flex h-full w-[272px] 3xl:w-[320px] 5xl:w-[400px]
        flex-col border-r border-border-subtle bg-card
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 px-5 py-5 3xl:px-7 3xl:py-7 5xl:px-10 5xl:py-10 border-b border-border-subtle">
        <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 5xl:h-16 5xl:w-16 items-center justify-center rounded-lg bg-brand-600 text-white flex-shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="3xl:w-6 3xl:h-6 5xl:w-8 5xl:h-8"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] 3xl:text-[18px] 5xl:text-[24px] font-bold text-brand-900 leading-tight truncate">
            Iron Ore Dispatch
          </h1>
          <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
            Enterprise System
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
      <nav className="flex-1 overflow-y-auto px-3 py-3 3xl:px-4 3xl:py-4 5xl:px-6 5xl:py-6 space-y-1">
        {sidebarSections.map((section) => (
          <div key={section.id}>
            {section.title && (
              <p className="px-3 pt-5 pb-2 3xl:pt-6 3xl:pb-3 text-[10px] 3xl:text-[12px] 5xl:text-[15px] font-bold tracking-[0.08em] text-slate-400 uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive =
                currentRoute === item.id ||
                (item.id === "master-data" && isMasterDataActive);
              const isExpanded = expandedItems.includes(item.id);

              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                      3xl:px-4 3xl:py-3 5xl:px-5 5xl:py-4
                      text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-medium transition-all duration-150
                      ${
                        isActive && !item.subItems
                          ? "bg-sidebar-active text-brand-600 shadow-sm"
                          : isActive && item.subItems
                            ? "text-brand-600"
                            : "text-slate-600 hover:bg-sidebar-hover hover:text-slate-800"
                      }
                    `}
                  >
                    {IconComponent && (
                      <IconComponent
                        size={20}
                        className={`flex-shrink-0 ${
                          isActive
                            ? "text-brand-600"
                            : "text-slate-400 group-hover:text-slate-500"
                        }`}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                    {(item.hasDropdown || item.subItems) && (
                      <ChevronDownIcon
                        size={16}
                        className={`ml-auto flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {item.subItems && isExpanded && (
                    <div className="ml-5 3xl:ml-6 5xl:ml-8 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-4 3xl:pl-5 5xl:pl-6">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            navigate(sub.id);
                            onClose();
                          }}
                          className={`
                            block w-full text-left rounded-md px-3 py-1.5
                            3xl:px-4 3xl:py-2 5xl:px-5 5xl:py-3
                            text-[13px] 3xl:text-[15px] 5xl:text-[18px] transition-colors duration-150
                            ${
                              currentRoute === sub.id
                                ? "font-medium text-brand-600 bg-brand-50 rounded-md"
                                : "text-slate-500 hover:text-slate-700"
                            }
                          `}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-border-subtle px-3 py-3 3xl:px-4 3xl:py-4 5xl:px-6 5xl:py-5">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 3xl:px-4 3xl:py-3 5xl:px-5 5xl:py-4 text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          {(() => {
            const Icon = iconMap[signOutItem.icon];
            return Icon ? <Icon size={20} className="flex-shrink-0" /> : null;
          })()}
          <span>{signOutItem.label}</span>
        </button>
      </div>
    </aside>
  );
}
