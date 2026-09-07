/** Canonical URL paths for the application. */
export const ROUTES = {
  LOGIN: "/login",
  OPERATOR: "/operator",
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    EDEMAND: "/admin/e-demand",
    EDEMAND_MANAGE: "/admin/e-demand/manage",
    EDEMAND_MANAGE_ADD: "/admin/e-demand/manage/add",
    EDEMAND_PERMIT: "/admin/e-demand/permit",
    RAKE: "/admin/rake",
    RAKE_UPCOMING: "/admin/rake/upcoming",
    RAKE_OFFERING: "/admin/rake/offering",
    RAKE_ADJUSTMENT: "/admin/rake/adjustment",
    LOADING: "/admin/loading",
    DELAY: "/admin/delay",
    USERS: "/admin/users",
    USERS_ADD: "/admin/users/add",
    USERS_EDIT: "/admin/users/:userId/edit",
    REPORTS: "/admin/reports",
    REPORTS_TRANSACTION: "/admin/reports/transaction",
    REPORTS_DEMURRAGE: "/admin/reports/demurrage",
    REPORTS_DAILY: "/admin/reports/daily",
    REPORTS_SIDING: "/admin/reports/siding-performance",
    REPORTS_LOAD_ADJUSTMENT: "/admin/reports/load-adjustment",
    REPORTS_SICK_WAGON: "/admin/reports/sick-wagon",
    REPORTS_RT: "/admin/reports/rt",
    REPORTS_RAKE_INCENTIVE: "/admin/reports/rake-incentive",
    REPORTS_DELAY_ANALYSIS: "/admin/reports/delay-analysis",
    REPORTS_RAILWAY_APPROVAL_AUDIT: "/admin/reports/railway-approval-audit",
    REPORTS_EDEMAND_SUMMARY: "/admin/reports/e-demand-summary",
    MASTER_DATA: "/admin/master-data",
    RAIL_SIDINGS: "/admin/master-data/rail-sidings",
    RAIL_SIDINGS_ADD: "/admin/master-data/rail-sidings/add",
    RAIL_SIDINGS_EDIT: "/admin/master-data/rail-sidings/:id/edit",
    WAGON_TYPES: "/admin/master-data/wagon-types",
    WAGON_TYPES_ADD: "/admin/master-data/wagon-types/add",
    WAGON_TYPES_EDIT: "/admin/master-data/wagon-types/:id/edit",
    ORE_CATEGORIES: "/admin/master-data/ore-categories",
    ORE_CATEGORIES_ADD: "/admin/master-data/ore-categories/add",
    ORE_CATEGORIES_EDIT: "/admin/master-data/ore-categories/:id/edit",
    CUSTOMERS: "/admin/master-data/customers",
    CUSTOMERS_ADD: "/admin/master-data/customers/add",
    CUSTOMERS_EDIT: "/admin/master-data/customers/:id/edit",
    DESTINATIONS: "/admin/master-data/destinations",
    DESTINATIONS_ADD: "/admin/master-data/destinations/add",
    DESTINATIONS_EDIT: "/admin/master-data/destinations/:id/edit",
    ROUTES: "/admin/master-data/routes",
    ROUTES_ADD: "/admin/master-data/routes/add",
    ROUTES_EDIT: "/admin/master-data/routes/:id/edit",
    STOCKPILES: "/admin/master-data/stockpiles",
    STOCKPILES_ADD: "/admin/master-data/stockpiles/add",
    STOCKPILES_EDIT: "/admin/master-data/stockpiles/:id/edit",
    DELAY_CATEGORIES: "/admin/master-data/delay-categories",
    DELAY_CATEGORIES_ADD: "/admin/master-data/delay-categories/add",
    DELAY_CATEGORIES_EDIT: "/admin/master-data/delay-categories/:id/edit",
    TOOLS_DELETE_RAKES: "/admin/tools/delete-offered-rakes",
    TOOLS_EDIT_TIMING: "/admin/tools/edit-rake-timing",
    RAILWAY_APPROVALS: "/admin/railway/approvals",
    EXTRACTION: "/admin/extraction",
    USER_MANAGEMENT: "/admin/user-management",
    ROLE_MANAGEMENT: "/admin/role-management",
  },
  SUPERADMIN: {
    ROOT: "/superadmin",
    ROLES: "/superadmin/roles",
    ROLES_ADD: "/superadmin/roles/add",
    ROLES_EDIT: "/superadmin/roles/:roleId/edit",
    USERS: "/superadmin/users",
    USERS_ADD: "/superadmin/users/add",
    USERS_EDIT: "/superadmin/users/:userId/edit",
  },
  RAILWAY: {
    ROOT: "/railway",
    APPROVALS: "/railway/approvals",
  },
};

/** Legacy in-memory route IDs mapped to URL paths (sidebar / breadcrumb compatibility). */
export const LEGACY_ROUTE_TO_PATH = {
  login: ROUTES.LOGIN,
  dashboard: ROUTES.ADMIN.DASHBOARD,
  "e-demand": ROUTES.ADMIN.EDEMAND,
  "manage-e-demand": ROUTES.ADMIN.EDEMAND_MANAGE,
  "manage-e-demand-add": ROUTES.ADMIN.EDEMAND_MANAGE_ADD,
  "manage-e-permit": ROUTES.ADMIN.EDEMAND_PERMIT,
  "rake-management": ROUTES.ADMIN.RAKE,
  "rake-upcoming": ROUTES.ADMIN.RAKE_UPCOMING,
  "rake-offering": ROUTES.ADMIN.RAKE_OFFERING,
  "rake-adjustment": ROUTES.ADMIN.RAKE_ADJUSTMENT,
  loading: ROUTES.ADMIN.LOADING,
  "loading-management": ROUTES.ADMIN.LOADING,
  delay: ROUTES.ADMIN.DELAY,
  "delay-management": ROUTES.ADMIN.DELAY,
  "admin-users": ROUTES.ADMIN.USERS,
  "admin-users-add": ROUTES.ADMIN.USERS_ADD,
  "admin-users-edit": ROUTES.ADMIN.USERS_EDIT,
  reports: ROUTES.ADMIN.REPORTS,
  "reports-transaction": ROUTES.ADMIN.REPORTS_TRANSACTION,
  "reports-demurrage": ROUTES.ADMIN.REPORTS_DEMURRAGE,
  "reports-daily": ROUTES.ADMIN.REPORTS_DAILY,
  "reports-siding-performance": ROUTES.ADMIN.REPORTS_SIDING,
  "reports-load-adjustment": ROUTES.ADMIN.REPORTS_LOAD_ADJUSTMENT,
  "reports-sick-wagon": ROUTES.ADMIN.REPORTS_SICK_WAGON,
  "reports-rt": ROUTES.ADMIN.REPORTS_RT,
  "reports-rake-incentive": ROUTES.ADMIN.REPORTS_RAKE_INCENTIVE,
  "reports-delay-analysis": ROUTES.ADMIN.REPORTS_DELAY_ANALYSIS,
  "reports-railway-approval-audit": ROUTES.ADMIN.REPORTS_RAILWAY_APPROVAL_AUDIT,
  "reports-e-demand-summary": ROUTES.ADMIN.REPORTS_EDEMAND_SUMMARY,
  "master-data": ROUTES.ADMIN.MASTER_DATA,
  "rail-sidings": ROUTES.ADMIN.RAIL_SIDINGS,
  "rail-sidings-add": ROUTES.ADMIN.RAIL_SIDINGS_ADD,
  "rail-sidings-edit": ROUTES.ADMIN.RAIL_SIDINGS_EDIT,
  "wagon-types": ROUTES.ADMIN.WAGON_TYPES,
  "wagon-types-add": ROUTES.ADMIN.WAGON_TYPES_ADD,
  "wagon-types-edit": ROUTES.ADMIN.WAGON_TYPES_EDIT,
  "ore-categories": ROUTES.ADMIN.ORE_CATEGORIES,
  "ore-categories-add": ROUTES.ADMIN.ORE_CATEGORIES_ADD,
  "ore-categories-edit": ROUTES.ADMIN.ORE_CATEGORIES_EDIT,
  "customer-master": ROUTES.ADMIN.CUSTOMERS,
  "customer-master-add": ROUTES.ADMIN.CUSTOMERS_ADD,
  "customer-master-edit": ROUTES.ADMIN.CUSTOMERS_EDIT,
  destinations: ROUTES.ADMIN.DESTINATIONS,
  "destinations-add": ROUTES.ADMIN.DESTINATIONS_ADD,
  "destinations-edit": ROUTES.ADMIN.DESTINATIONS_EDIT,
  "route-mapping": ROUTES.ADMIN.ROUTES,
  "route-mapping-add": ROUTES.ADMIN.ROUTES_ADD,
  "route-mapping-edit": ROUTES.ADMIN.ROUTES_EDIT,
  "stockpile-logs": ROUTES.ADMIN.STOCKPILES,
  "stockpile-logs-add": ROUTES.ADMIN.STOCKPILES_ADD,
  "stockpile-logs-edit": ROUTES.ADMIN.STOCKPILES_EDIT,
  "delay-categories": ROUTES.ADMIN.DELAY_CATEGORIES,
  "delay-categories-add": ROUTES.ADMIN.DELAY_CATEGORIES_ADD,
  "delay-categories-edit": ROUTES.ADMIN.DELAY_CATEGORIES_EDIT,
  "operator-operations": ROUTES.OPERATOR,
  "sa-roles": ROUTES.SUPERADMIN.ROLES,
  "sa-add-role": ROUTES.SUPERADMIN.ROLES_ADD,
  "sa-users": ROUTES.SUPERADMIN.USERS,
  "sa-add-user": ROUTES.SUPERADMIN.USERS_ADD,
  "sa-edit-user": ROUTES.SUPERADMIN.USERS_EDIT,
  "admin-edit-rake-timing": ROUTES.ADMIN.TOOLS_EDIT_TIMING,
  "railway-approvals": ROUTES.ADMIN.RAILWAY_APPROVALS,
  extraction: ROUTES.ADMIN.EXTRACTION,
  "user-management": ROUTES.ADMIN.USER_MANAGEMENT,
  "role-management": ROUTES.ADMIN.ROLE_MANAGEMENT,
};

export function legacyRouteToPath(legacyId) {
  return LEGACY_ROUTE_TO_PATH[legacyId] ?? ROUTES.ADMIN.DASHBOARD;
}

export function pathToLegacyRoute(pathname) {
  const entries = Object.entries(LEGACY_ROUTE_TO_PATH);
  const exact = entries.find(([, path]) => path === pathname);
  if (exact) return exact[0];

  const reportMatch = pathname.match(/^\/admin\/reports\/([^/]+)$/);
  if (reportMatch) {
    if (reportMatch[1] === "transaction") return "reports-transaction";
    return `reports-${reportMatch[1]}`;
  }

  if (pathname.startsWith("/admin/rake/upcoming")) return "rake-upcoming";
  if (pathname.startsWith("/admin/rake/offering")) return "rake-offering";
  if (pathname.startsWith("/admin/rake/adjustment")) return "rake-adjustment";
  if (pathname.startsWith("/admin/rake")) return "rake-management";

  const masterSegmentMap = {
    "rail-sidings": "rail-sidings",
    "wagon-types": "wagon-types",
    "ore-categories": "ore-categories",
    customers: "customer-master",
    destinations: "destinations",
    routes: "route-mapping",
    stockpiles: "stockpile-logs",
    "delay-categories": "delay-categories",
  };

  const masterMatch = pathname.match(/^\/admin\/master-data\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (masterMatch) {
    const [, segment, second, third] = masterMatch;
    const legacyBase = masterSegmentMap[segment] ?? "master-data";
    if (second === "add") return `${legacyBase}-add`;
    if (third === "edit") return `${legacyBase}-edit`;
    if (second && third === "edit") return `${legacyBase}-edit`;
    return legacyBase;
  }

  if (pathname.startsWith("/admin/e-demand/permit")) return "manage-e-permit";
  if (pathname.startsWith("/admin/railway/approvals")) return "railway-approvals";
  if (pathname.startsWith("/admin/railway")) return "railway-approvals";
  if (pathname.startsWith("/railway/approvals")) return "railway-approvals";
  if (pathname.startsWith("/railway")) return "railway-approvals";
  if (pathname.startsWith("/admin/extraction")) return "extraction";
  if (pathname.startsWith("/admin/user-management")) return "user-management";
  if (pathname.startsWith("/admin/role-management")) return "role-management";
  if (pathname.startsWith("/admin/e-demand/manage/add")) return "manage-e-demand-add";
  if (pathname.startsWith("/admin/e-demand/manage")) return "manage-e-demand";
  if (pathname.startsWith("/admin/e-demand")) return "e-demand";

  if (pathname.startsWith("/admin/users/add")) return "admin-users-add";
  if (pathname.includes("/admin/users/") && pathname.endsWith("/edit")) {
    return "admin-users-edit";
  }
  if (pathname.startsWith("/admin/users")) return "admin-users";

  if (pathname.startsWith("/superadmin/roles/add")) return "sa-add-role";
  if (pathname.startsWith("/superadmin/roles")) return "sa-roles";
  if (pathname.startsWith("/superadmin/users/add")) return "sa-add-user";
  if (pathname.startsWith("/superadmin/users") && pathname.includes("/edit")) {
    return "sa-edit-user";
  }
  if (pathname.startsWith("/superadmin/users")) return "sa-users";

  const partial = entries
    .filter(([, path]) => pathname.startsWith(path.replace(/:\w+/g, "")))
    .sort((a, b) => b[1].length - a[1].length)[0];
  return partial?.[0] ?? "dashboard";
}

export function buildPath(template, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
    template,
  );
}

export function loadingPathForRake(rakeId) {
  return `${ROUTES.ADMIN.LOADING}?rakeId=${encodeURIComponent(rakeId)}`;
}

export function loadingPathForLoading(loadingId) {
  return `${ROUTES.ADMIN.LOADING}?loadingId=${encodeURIComponent(loadingId)}`;
}

export function delayPathForRake(rakeId) {
  return `${ROUTES.ADMIN.DELAY}?rakeId=${encodeURIComponent(rakeId)}`;
}

export function delayPathForLoading(loadingId) {
  return `${ROUTES.ADMIN.DELAY}?loadingId=${encodeURIComponent(loadingId)}`;
}
