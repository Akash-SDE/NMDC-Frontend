import {
  formatWagonSupply,
  fromRakeApiPayload,
  parseWagonSupply,
  toDisplayDateTime,
  toInputDateTime,
} from "../../../types/transforms";

/** Map canonical rake entity → UI table row shape (preserves existing UI). */
export function canonicalToUiRow(rake) {
  if (!rake) return null;
  return {
    sno: rake.sno,
    rakeId: rake.id,
    rakeNumber: rake.rakeNumber,
    wagonSupply: rake.wagonCount,
    wagonType: rake.wagonType,
    siding: rake.siding,
    route: rake.route,
    oreType: rake.oreType,
    customer: rake.customer,
    oreTypeCustomer: rake.oreTypeCustomer,
    destination: rake.destination,
    fNote: rake.fNote || "-",
    placementTime: rake.placementTime ? toDisplayDateTime(rake.placementTime) : "",
    offerTime: rake.offerTime ? toDisplayDateTime(rake.offerTime) : "",
    adjustOfferFor: rake.adjustOfferFor || "-",
    adjustedOfferTime: rake.adjustedOfferTime
      ? toDisplayDateTime(rake.adjustedOfferTime)
      : "-",
    isDisabled: rake.isDisabled,
  };
}

/** Map UI table/form payload → canonical rake for repository/Redux. */
export function uiToCanonicalRake(uiRow) {
  const wagonType = uiRow.wagonType || parseWagonSupply(uiRow.wagonSupply).wagonType;
  const wagonCount =
    uiRow.wagonCount ??
    (typeof uiRow.wagonSupply === "number"
      ? uiRow.wagonSupply
      : parseWagonSupply(String(uiRow.wagonSupply ?? "")).wagonCount);

  return fromRakeApiPayload({
    id: uiRow.rakeId ?? uiRow.id,
    sno: uiRow.sno,
    rakeNumber: uiRow.rakeNumber,
    wagonType,
    wagonCount,
    siding: uiRow.siding,
    route: uiRow.route,
    oreType: uiRow.oreType,
    customer: uiRow.customer,
    oreTypeCustomer:
      uiRow.oreTypeCustomer ||
      `${uiRow.oreType || ""} / ${uiRow.customer || ""}`.trim(),
    destination: uiRow.destination,
    f_note: uiRow.fNote,
    fNote: uiRow.fNote,
    offerTime: uiRow.offerTime,
    placementTime: uiRow.placementTime,
    adjustOfferFor: uiRow.adjustOfferFor,
    adjustedOfferTime: uiRow.adjustedOfferTime,
    isDisabled: uiRow.isDisabled,
  });
}

export function uiRowsFromCanonicalList(rakes = []) {
  return rakes.map(canonicalToUiRow);
}

export function parseWagonSupplyField(value) {
  if (typeof value === "number") {
    return { wagonType: "", noOfWagons: String(value) };
  }
  if (!value || typeof value !== "string") {
    return { wagonType: "", noOfWagons: "" };
  }
  if (value.includes("/")) {
    const [wagonType = "", count = ""] = value.split("/");
    return { wagonType: wagonType.trim(), noOfWagons: count.trim() };
  }
  return { wagonType: "", noOfWagons: value.trim() };
}

export function buildOfferingFormFromUiRow(row) {
  if (!row) return null;
  const [legacyOreType = "", legacyCustomer = ""] = String(row.oreTypeCustomer || "")
    .split("/")
    .map((value) => value.trim());
  const { wagonType: parsedWagonType, noOfWagons: parsedNoOfWagons } =
    parseWagonSupplyField(row.wagonSupply);

  return {
    rakeId: row.rakeId || "",
    rakeNumber: row.rakeNumber || "",
    wagonType: row.wagonType || parsedWagonType,
    noOfWagons:
      row.wagonSupply !== undefined && row.wagonSupply !== null
        ? String(row.wagonSupply)
        : parsedNoOfWagons,
    siding: row.siding || "",
    route: row.route || "",
    oreType: row.oreType || legacyOreType,
    fNote: row.fNote || "",
    customer: row.customer || legacyCustomer,
    destination: row.destination || "",
    placementTime: row.placementTime ? toInputDateTime(row.placementTime) : "",
    offerTime: row.offerTime ? toInputDateTime(row.offerTime) : "",
  };
}

export { formatWagonSupply, toDisplayDateTime, toInputDateTime };
