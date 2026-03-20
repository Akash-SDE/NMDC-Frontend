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
    <nav className="flex items-center mb-6 gap-2 3xl:gap-3 text-[13px] 3xl:text-[16px] 5xl:text-[20px]">
      {crumbs.map((crumb, index) => (
        <div
          key={`${index}-${crumb.route}`}
          className="flex items-center gap-2 3xl:gap-3"
        >
          {index > 0 && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-400 3xl:w-5 3xl:h-5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          {index === 0 ? (
            <button
              onClick={() => navigate(crumb.route)}
              className="text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="3xl:w-5 3xl:h-5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          ) : index === crumbs.length - 1 ? (
            <span className="text-slate-900 font-medium">{crumb.label}</span>
          ) : (
            <button
              onClick={() => navigate(crumb.route)}
              className="text-brand-600 hover:text-brand-700 transition-colors"
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
