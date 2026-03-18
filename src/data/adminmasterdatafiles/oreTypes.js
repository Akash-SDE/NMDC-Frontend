export const oreTypesData = [
  {
    code: "FE-62-H",
    name: "High Grade Hematite",
    grade: "62.5%",
    description: "Premium grade hematite ore with low al...",
    status: "active",
  },
  {
    code: "FE-58-M",
    name: "Medium Grade Magnetite",
    grade: "58.2%",
    description: "Standard magnetite ore suitable for ble...",
    status: "active",
  },
  {
    code: "FE-52-L",
    name: "Low Grade Limonite",
    grade: "52.0%",
    description: "Lower grade silty ore, requires addition...",
    status: "inactive",
  },
  {
    code: "FE-65-P",
    name: "Pellet Feed Grade",
    grade: "65.8%",
    description: "Fine-grained ore intended for pellet pla...",
    status: "active",
  },
  {
    code: "FE-S-FIN",
    name: "Sinter Fines",
    grade: "60.1%",
    description: "Fine iron ore for sinter plant utilization.",
    status: "active",
  },
];

export const oreTypesStats = [
  {
    label: "TOTAL ORE TYPES",
    value: "12",
    icon: "mountain",
    color: "blue",
  },
  {
    label: "ACTIVE GRADES",
    value: "10",
    icon: "check",
    color: "green",
  },
  {
    label: "AVG. GRADE FE %",
    value: "59.7%",
    icon: "trend",
    color: "red",
  },
];

export const oreTypesMeta = {
  title: "Ore Type Master",
  subtitle:
    "Configure and manage various grades and types of iron ore for dispatching.",
  addLabel: "Add New Ore Type",
  searchPlaceholder: "Search Ore Type by code or name...",
  totalCount: 12,
  pageSize: 5,
};
