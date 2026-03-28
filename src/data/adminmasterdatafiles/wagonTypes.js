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

export const WAGON_TYPES_STORAGE_KEY = "nmdc_master_wagon_types";

export function getWagonTypesMasterData() {
  if (typeof window === "undefined") return [...wagonTypesData];

  try {
    const raw = window.localStorage.getItem(WAGON_TYPES_STORAGE_KEY);
    if (!raw) return [...wagonTypesData];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...wagonTypesData];

    return parsed;
  } catch {
    return [...wagonTypesData];
  }
}

export function saveWagonTypesMasterData(data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WAGON_TYPES_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}
