export const stockpilesData = [
  {
    code: "SP-NY-001",
    name: "North Yard Terminal",
    oreType: "Lump Ore",
    capacity: "150,000",
    status: "active",
  },
  {
    code: "SP-SY-002",
    name: "South Yard Depot",
    oreType: "Fines",
    capacity: "225,000",
    status: "active",
  },
  {
    code: "SP-ET-003",
    name: "East Terminal Annex",
    oreType: "Pellets",
    capacity: "85,000",
    status: "maintenance",
  },
  {
    code: "SP-WS-004",
    name: "West Storage Area B",
    oreType: "Sinter Feed",
    capacity: "120,000",
    status: "active",
  },
  {
    code: "SP-CY-005",
    name: "Central Yard Overspill",
    oreType: "Mixed Ore",
    capacity: "45,000",
    status: "inactive",
  },
];

export const stockpilesMeta = {
  title: "Stockpile Master",
  subtitle:
    "Manage and monitor stockpile inventory across all storage locations.",
  addLabel: "Add Stockpile",
  searchPlaceholder: "Search Stockpile by name or code...",
  totalCount: 24,
  pageSize: 5,
};
