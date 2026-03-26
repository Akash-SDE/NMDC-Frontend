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
        id: "rake-management",
        label: "Rake Management",
        icon: "rake",
      },
      {
        id: "loading-management",
        label: "Loading",
        icon: "loading",
      },
      {
        id: "delay-management",
        label: "Delays",
        icon: "delay",
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
        id: "admin-users",
        label: "Manage Users",
        icon: "users",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "reports",
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        icon: "config",
      },
    ],
  },
];

const operatorSidebarSections = [
  {
    id: "operations",
    title: "RAKE OPERATIONS",
    items: [
      {
        id: "operator-operations",
        label: "Operations Hub",
        icon: "rake",
      },
    ],
  },
];

export function getSidebarSections(userRole) {
  if (userRole === "operator") {
    return operatorSidebarSections;
  }
  return adminSidebarSections;
}

export const signOutItem = {
  id: "sign-out",
  label: "Sign Out",
  icon: "signOut",
};
