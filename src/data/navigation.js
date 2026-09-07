const adminSidebarSections = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "dashboard",
        active: true,
      },
      {
        id: "e-demand",
        label: "E-Demand",
        icon: "demand",
        children: [
          {
            id: "manage-e-demand",
            label: "Manage E-Demand",
          },
          {
            id: "manage-e-permit",
            label: "Manage E-Permit",
          },
        ],
      },
      {
        id: "rake-management",
        label: "Rake Management",
        icon: "rake",
      },
      {
        id: "loading-management",
        label: "Load Management",
        icon: "loading",
      },
      {
        id: "delay-management",
        label: "Delay Management",
        icon: "delay",
      },
      {
        id: "railway-approvals",
        label: "Railway Approvals",
        icon: "rake",
      },
      {
        id: "extraction",
        label: "Extraction",
        icon: "extraction",
      },
      {
        id: "user-management",
        label: "User Management",
        icon: "users",
      },
      {
        id: "role-management",
        label: "Role Management",
        icon: "roles",
      },
      {
        id: "master-data",
        label: "Master Data",
        icon: "masterData",
        children: [
          {
            id: "rail-sidings",
            label: "Rail Sidings",
          },
          {
            id: "wagon-types",
            label: "Wagon Types",
          },
          {
            id: "ore-categories",
            label: "Ore Categories",
          },
          {
            id: "customer-master",
            label: "Customers",
          },
          {
            id: "destinations",
            label: "Destinations",
          },
          {
            id: "route-mapping",
            label: "Routes",
          },
          {
            id: "stockpile-logs",
            label: "Stockpiles",
          },
          {
            id: "delay-categories",
            label: "Delay Categories",
          },
        ],
      },
      {
        id: "reports",
        label: "Reports",
        icon: "reports",
        children: [
          {
            id: "reports-transaction",
            label: "Transaction Report",
          },
          {
            id: "reports-demurrage",
            label: "Demurrage Report",
          },
          {
            id: "reports-daily",
            label: "Daily Report",
          },
          {
            id: "reports-siding-performance",
            label: "Siding Performance Report",
          },
          {
            id: "reports-load-adjustment",
            label: "Load Adjustment Report",
          },
          {
            id: "reports-sick-wagon",
            label: "Sick Wagon Report",
          },
          {
            id: "reports-rt",
            label: "RT Report",
          },
          {
            id: "reports-rake-incentive",
            label: "Rake Incentive Report",
          },
          {
            id: "reports-delay-analysis",
            label: "Delay Analysis",
          },
          {
            id: "reports-railway-approval-audit",
            label: "Railway Approval Audit",
          },
          {
            id: "reports-e-demand-summary",
            label: "E-Demand Summary",
          },
        ],
      },
    ],
  },
];

const railwaySidebarSections = [
  {
    id: "main",
    items: [
      {
        id: "railway-approvals",
        label: "Railway Approvals",
        icon: "rake",
        active: true,
      },
    ],
  },
];

export function getSidebarSections(userRole) {
  if (userRole === "station_master" || userRole === "commercial" || userRole === "cw_inspector") {
    return railwaySidebarSections;
  }

  // admin and superadmin both get the full admin sidebar
  return adminSidebarSections;
}

export const signOutItem = {
  id: "sign-out",
  label: "Sign Out",
  icon: "signOut",
};
