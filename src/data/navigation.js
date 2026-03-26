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
  label: "Log Out",
  icon: "signOut",
};
