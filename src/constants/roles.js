export const USER_ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  SUPERADMIN: "superadmin",
  STATION_MASTER: "station_master",
  COMMERCIAL: "commercial",
  CW_INSPECTOR: "cw_inspector",
};

export const RAILWAY_ROLES = [
  USER_ROLES.STATION_MASTER,
  USER_ROLES.COMMERCIAL,
  USER_ROLES.CW_INSPECTOR,
];

export const isReadOnlyRole = (role) => RAILWAY_ROLES.includes(role);

export const RAILWAY_DEPARTMENT_BY_ROLE = {
  [USER_ROLES.STATION_MASTER]: "operations",
  [USER_ROLES.COMMERCIAL]: "commercial",
  [USER_ROLES.CW_INSPECTOR]: "cw",
};

export function resolveRoleFromProfile(profile) {
  if (!profile) return USER_ROLES.ADMIN;
  if (profile.is_superuser) return USER_ROLES.SUPERADMIN;

  const roleNames = (profile.role ?? []).map((r) => String(r?.role_name ?? r).toLowerCase());
  const has = (...keys) => roleNames.some((name) => keys.some((key) => name.includes(key)));

  if (has("superadmin")) return USER_ROLES.SUPERADMIN;
  if (has("operator")) return USER_ROLES.OPERATOR;
  if (has("station", "operation")) return USER_ROLES.STATION_MASTER;
  if (has("commercial")) return USER_ROLES.COMMERCIAL;
  if (has("cnw", "c&w", "cw", "wagon")) return USER_ROLES.CW_INSPECTOR;
  return USER_ROLES.ADMIN;
}

export const DEFAULT_ROUTE_BY_ROLE = {
  [USER_ROLES.SUPERADMIN]: "/admin/dashboard",
  [USER_ROLES.OPERATOR]: "/operator",
  [USER_ROLES.ADMIN]: "/admin/dashboard",
  [USER_ROLES.STATION_MASTER]: "/railway/approvals?dept=operations",
  [USER_ROLES.COMMERCIAL]: "/railway/approvals?dept=commercial",
  [USER_ROLES.CW_INSPECTOR]: "/railway/approvals?dept=cw",
};
