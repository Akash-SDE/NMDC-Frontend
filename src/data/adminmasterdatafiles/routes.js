export const routesData = [
  {
    code: "RT-001",
    name: "Main Haul Road A",
    sourceSiding: "North Mine Yard",
    destination: "Crusher Unit 1",
    distance: "12.5",
    status: "active",
  },
  {
    code: "RT-002",
    name: "East Link B-7",
    sourceSiding: "East Gate Siding",
    destination: "Port Terminal",
    distance: "45.0",
    status: "active",
  },
  {
    code: "RT-003",
    name: "South Express",
    sourceSiding: "South Quarry",
    destination: "Stockpile Hub",
    distance: "8.2",
    status: "maintenance",
  },
  {
    code: "RT-004",
    name: "Internal Siding Connection",
    sourceSiding: "Rail Siding 4",
    destination: "Dispatch Yard",
    distance: "2.4",
    status: "active",
  },
  {
    code: "RT-005",
    name: "Secondary Port Route",
    sourceSiding: "North Mine Yard",
    destination: "Old Jetty",
    distance: "31.7",
    status: "inactive",
  },
];

export const routesStats = [
  {
    label: "TOTAL ROUTE COVERAGE",
    value: "214.8 KM",
    description: "Combined distance of active routes",
    icon: "route",
    color: "blue",
  },
  {
    label: "OPERATIONAL",
    value: "18 Routes",
    description: "Ready for dispatch assignments",
    icon: "check",
    color: "green",
  },
  {
    label: "UNDER MAINTENANCE",
    value: "2 Routes",
    description: "South Express and Quarry Link X",
    icon: "warning",
    color: "yellow",
  },
];

export const routesMeta = {
  title: "Route Master",
  subtitle:
    "Manage and configure transport routes for iron ore dispatch operations.",
  addLabel: "Add New Route",
  searchPlaceholder: "Search by Route Code or Name...",
  totalCount: 24,
  pageSize: 5,
};
