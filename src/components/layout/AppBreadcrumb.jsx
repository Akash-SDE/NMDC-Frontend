import { useMemo } from "react";
import { useRouter, USER_ROLES } from "../../context/RouterContext";
import { getSidebarSections } from "../../data/navigation";

function toTitleCaseFromRoute(route) {
  return String(route || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AppBreadcrumb() {
  const { currentRoute, navigate, userRole } = useRouter();

  const crumbs = useMemo(() => {
    const homeRoute =
      userRole === USER_ROLES.OPERATOR ? "operator-operations" : "dashboard";

    const labelByRoute = new Map();
    const parentByRoute = new Map();

    const sections = getSidebarSections(userRole);
    sections.forEach((section) => {
      section.items.forEach((item) => {
        labelByRoute.set(item.id, item.label);

        if (Array.isArray(item.children)) {
          item.children.forEach((child) => {
            labelByRoute.set(child.id, child.label);
            parentByRoute.set(child.id, {
              route: item.id,
              label: item.label,
            });
          });
        }
      });
    });

    labelByRoute.set("operator-operations", "Operations Hub");

    if (!labelByRoute.has(currentRoute)) {
      labelByRoute.set(currentRoute, toTitleCaseFromRoute(currentRoute));
    }

    const result = [{ label: "Home", route: homeRoute }];
    const parent = parentByRoute.get(currentRoute);

    if (parent && parent.route !== homeRoute) {
      result.push(parent);
    }

    const currentLabel = labelByRoute.get(currentRoute);
    const lastRoute = result[result.length - 1]?.route;

    if (currentLabel && currentRoute !== lastRoute) {
      result.push({ label: currentLabel, route: currentRoute });
    }

    return result;
  }, [currentRoute, userRole]);

  return (
    <nav className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-slate-600 sm:text-[13px]">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={`${crumb.route}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : null}

            {isLast ? (
              <span className="font-bold text-slate-800">{crumb.label}</span>
            ) : (
              <button
                type="button"
                onClick={() => navigate(crumb.route)}
                className="text-blue-700 transition-colors hover:text-blue-800"
              >
                {crumb.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}