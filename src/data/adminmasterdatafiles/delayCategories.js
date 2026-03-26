export const delayCategoriesData = [
  {
    code: "D-MC-001",
    name: "Mechanical Failure",
    description: "Unscheduled maintenance and equipment bre...",
    status: "active",
  },
  {
    code: "D-WE-002",
    name: "Weather Conditions",
    description: "Delays due to heavy rain, lightning, or low visib...",
    status: "active",
  },
  {
    code: "D-OP-003",
    name: "Operator Shift Change",
    description: "Standard period for operator handover and pr...",
    status: "inactive",
  },
  {
    code: "D-PW-004",
    name: "Power Outage",
    description: "Grid failure or site-wide electrical maintenance ...",
    status: "active",
  },
  {
    code: "D-BL-005",
    name: "Blasting Delay",
    description: "Planned blasting schedule requiring zone evac...",
    status: "active",
  },
];

export const delayCategoriesMeta = {
  title: "Delay Category Master",
  subtitle:
    "Manage and categorize all delay types for dispatch operations tracking.",
  addLabel: "Add Delay Category",
  searchPlaceholder: "Search Delay Category...",
  totalCount: 24,
  pageSize: 5,
};
