import { ROUTE_LABELS } from "./superadminData";
import { useRouter } from "../../../context/RouterContext";

const Breadcrumb = () => {
  const { currentRoute, navigate } = useRouter();

  // Generate breadcrumb from current route
  const crumbs = [{ label: "Home", route: "sa-roles" }];
  const label = ROUTE_LABELS[currentRoute];
  if (label) {
    crumbs.push({ label, route: currentRoute });
  }

  return (
    <nav className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-slate-600 sm:text-[13px]">
      {crumbs.map((crumb, index) => (
        <div
          key={`${index}-${crumb.route}`}
          className="flex items-center gap-2"
        >
          {index > 0 && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-400"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          {index === 0 ? (
            <button
              onClick={() => navigate(crumb.route)}
              className="text-blue-700 transition-colors hover:text-blue-800"
            >
              {crumb.label}
            </button>
          ) : index === crumbs.length - 1 ? (
            <span className="font-bold text-slate-800">{crumb.label}</span>
          ) : (
            <button
              onClick={() => navigate(crumb.route)}
              className="text-blue-700 transition-colors hover:text-blue-800"
            >
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
