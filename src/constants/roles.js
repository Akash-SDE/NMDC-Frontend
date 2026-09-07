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

export const DEFAULT_ROUTE_BY_ROLE = {
  [USER_ROLES.SUPERADMIN]: "/admin/dashboard",
  [USER_ROLES.OPERATOR]: "/operator",
  [USER_ROLES.ADMIN]: "/admin/dashboard",
  [USER_ROLES.STATION_MASTER]: "/railway/approvals?dept=operations",
  [USER_ROLES.COMMERCIAL]: "/railway/approvals?dept=commercial",
  [USER_ROLES.CW_INSPECTOR]: "/railway/approvals?dept=cw",
};
