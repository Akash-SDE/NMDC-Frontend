import { getLocalDateTimeValue } from "../../../utils/dateUtils";

export const wagonTypeOptions = ["BOXN", "BOXNHL", "BOBRN", "BCN"];
export const sidingOptions = ["Siding-A", "Siding-B", "Siding-C", "Siding-D"];
export const routeOptions = ["R-14", "R-22", "R-05", "R-09"];
export const oreTypeOptions = ["LUMP", "FINES", "PELLET", "SINTER"];
export const customerOptions = ["JSW Steel", "Tata Steel", "SAIL", "NMDC"];
export const destinationOptions = ["Visakhapatnam", "Bhilai", "Raipur", "Nagpur"];
export const adjustmentReasonOptions = [
  "Customer Priority",
  "Wagon Shortage",
  "Route Congestion",
  "Loading Delay",
];
export const upcomingDraftRowCount = 1;

export const upcomingRequiredFields = [
  "oreType",
  "siding",
  "destination",
  "placementTime",
  "wagonType",
  "route",
  "customer",
  "wagonCount",
];

export function isUpcomingRowReady(row) {
  return upcomingRequiredFields.every((field) => String(row?.[field] ?? "").trim());
}

export function countReadyUpcomingRows(rows = []) {
  return rows.filter(isUpcomingRowReady).length;
}

export const initialOfferingForm = {
  rakeId: "",
  rakeNumber: "",
  wagonType: "",
  noOfWagons: "",
  siding: "",
  route: "",
  oreType: "",
  fNote: "",
  customer: "",
  destination: "",
  placementTime: "",
  offerTime: "",
};

export function createUpcomingRow(index = 0) {
  return {
    id: `upcoming-${Date.now()}-${index}`,
    oreType: "",
    siding: "",
    destination: "",
    placementTime: getLocalDateTimeValue(),
    wagonType: wagonTypeOptions[0] ?? "",
    route: routeOptions[0] ?? "",
    customer: customerOptions[0] ?? "",
    wagonCount: "58",
  };
}

export function createInitialUpcomingRows(count = upcomingDraftRowCount) {
  return Array.from({ length: count }, (_, index) => createUpcomingRow(index));
}
