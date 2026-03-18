export const sidebarSections = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "dashboard",
        active: true,
      },
    ],
  },
  //   {
  //     id: "dispatch-ops",
  //     title: "DISPATCH OPS",
  //     items: [
  //       {
  //         id: "rake-management",
  //         label: "Rake Management",
  //         icon: "rake",
  //         hasDropdown: true,
  //       },
  //       {
  //         id: "loading-management",
  //         label: "Loading Management",
  //         icon: "loading",
  //       },
  //       {
  //         id: "delay-management",
  //         label: "Delay Management",
  //         icon: "delay",
  //       },
  //     ],
  //   },
  //   {
  //     id: "logistics",
  //     title: "LOGISTICS & COMPLIANCE",
  //     items: [
  //       {
  //         id: "load-adjustment",
  //         label: "Load Adjustment",
  //         icon: "loadAdjust",
  //       },
  //       {
  //         id: "demand-management",
  //         label: "Demand Management",
  //         icon: "demand",
  //       },
  //       {
  //         id: "permit-management",
  //         label: "Permit Management",
  //         icon: "permit",
  //       },
  //     ],
  //   },
  {
    id: "configuration",
    title: "CONFIGURATION",
    items: [
      {
        id: "master-data",
        label: "Master Data",
        icon: "masterData",
        expanded: true,
        subItems: [
          { id: "wagon-types", label: "Wagon Types" },
          { id: "rail-sidings", label: "Rail Sidings" },
          { id: "ore-categories", label: "Ore Categories" },
          { id: "customer-master", label: "Customer Master" },
          { id: "destinations", label: "Destinations" },
          { id: "route-mapping", label: "Route Mapping" },
          { id: "stockpile-logs", label: "Stockpile Logs" },
        ],
      },
      //   {
      //     id: "user-management",
      //     label: "User Management",
      //     icon: "users",
      //   },
      //   { id: "reports", label: "Reports", icon: "reports" },
      //   {
      //     id: "system-config",
      //     label: "System Config",
      //     icon: "config",
      //   },
    ],
  },
];

export const signOutItem = {
  id: "sign-out",
  label: "Sign Out",
  icon: "signOut",
};
