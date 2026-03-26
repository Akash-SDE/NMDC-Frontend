export const wagonTypesData = [
  {
    code: "WG-BOXN",
    name: "BOXN Open Wagon",
    capacity: "58.0",
    length: "10.7",
    status: "active",
  },
  {
    code: "WG-BOBR",
    name: "BOBR Bogie Open",
    capacity: "61.5",
    length: "11.2",
    status: "active",
  },
  {
    code: "WG-BOBRN",
    name: "BOBRN High Sided",
    capacity: "64.0",
    length: "11.2",
    status: "active",
  },
  {
    code: "WG-BOXNHL",
    name: "BOXNHL Higher Load",
    capacity: "68.0",
    length: "10.7",
    status: "maintenance",
  },
  {
    code: "WG-BOST",
    name: "BOST Stainless Steel",
    capacity: "60.0",
    length: "10.8",
    status: "inactive",
  },
];

export const wagonTypesMeta = {
  title: "Wagon Type Master",
  subtitle: "Configure and manage all wagon types used in dispatch operations.",
  addLabel: "Add Wagon Type",
  searchPlaceholder: "Search Wagon Type by code or name...",
  totalCount: 18,
  pageSize: 5,
};
