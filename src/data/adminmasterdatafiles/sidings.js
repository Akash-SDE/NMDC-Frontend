export const sidingsData = [
  {
    code: "SID-KO-001",
    name: "Kolkata Port Trust Siding",
    subName: "Terminal Loading Bay A",
    location: "West Bengal, India",
    railwayZone: "Eastern Railway (ER)",
    status: "active",
  },
  {
    code: "SID-JA-042",
    name: "Jamshedpur Yard Siding",
    subName: "Section 4 (Ore Processing)",
    location: "Jharkhand, India",
    railwayZone: "South Eastern Railway (SER)",
    status: "active",
  },
  {
    code: "SID-PA-009",
    name: "Paradip Port Hub Siding",
    subName: "Export Siding - Dock 1",
    location: "Odisha, India",
    railwayZone: "East Coast Railway (ECoR)",
    status: "maintenance",
  },
  {
    code: "SID-VI-112",
    name: "Vizag Steel Plant Siding",
    subName: "Input Feeders Line 2",
    location: "Andhra Pradesh, India",
    railwayZone: "South Coast Railway (SCoR)",
    status: "inactive",
  },
];

export const sidingsStats = [
  {
    label: "OPERATIONAL CAPACITY",
    value: "84%",
    icon: "chart",
    color: "blue",
  },
  {
    label: "REGIONAL DISTRIBUTION",
    value: "12 Zones",
    icon: "flag",
    color: "blue",
  },
  {
    label: "WEEKLY ACTIVITY",
    value: "+12%",
    icon: "trend",
    color: "green",
  },
];

export const sidingsMeta = {
  title: "Siding Master",
  subtitle:
    "Manage and monitor all railway siding assets across the regional infrastructure.",
  addLabel: "Add New Siding",
  searchPlaceholder: "Search by code, name or location...",
  totalCount: 28,
  pageSize: 4,
};
