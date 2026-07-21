import {
  formatDateTimeForTable,
  formatTableDateTimeForInput,
  parseDateTimeToTimestamp,
} from "../utils/dateUtils";
import { LOADING_STATUS } from "../constants/approval";

/** Build canonical wagonSupply display string: TYPE/COUNT */
export function formatWagonSupply(wagonType, wagonCount) {
  if (!wagonType && (wagonCount === null || wagonCount === undefined)) return "";
  if (!wagonType) return String(wagonCount ?? "");
  if (wagonCount === null || wagonCount === undefined || wagonCount === "") {
    return wagonType;
  }
  return `${wagonType}/${wagonCount}`;
}

/** Parse wagonSupply string into { wagonType, wagonCount } */
export function parseWagonSupply(value) {
  if (!value) return { wagonType: "", wagonCount: 0 };
  const str = String(value);
  if (!str.includes("/")) {
    const parsed = Number(str);
    return {
      wagonType: "",
      wagonCount: Number.isNaN(parsed) ? 0 : parsed,
    };
  }
  const [wagonType, countPart] = str.split("/");
  const wagonCount = Number(countPart);
  return {
    wagonType: wagonType || "",
    wagonCount: Number.isNaN(wagonCount) ? 0 : wagonCount,
  };
}

/** Normalize any datetime input to ISO string (for storage/API). */
export function toIsoDateTime(value) {
  if (!value) return null;
  if (String(value).includes("T")) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  const timestamp = parseDateTimeToTimestamp(value);
  if (!timestamp) return null;
  return new Date(timestamp).toISOString();
}

/** Format ISO datetime for table display (DD/MM/YYYY HH:mm). */
export function toDisplayDateTime(isoValue) {
  if (!isoValue) return "";
  return formatDateTimeForTable(isoValue);
}

/** Format any datetime for datetime-local input. */
export function toInputDateTime(value) {
  if (!value) return "";
  return formatTableDateTimeForInput(value);
}

/** @param {import('./operational').Rake} rake */
export function toRakeApiPayload(rake) {
  return {
    id: rake.id,
    rake_number: rake.rakeNumber,
    wagon_type: rake.wagonType,
    wagon_count: rake.wagonCount,
    siding: rake.siding,
    route: rake.route,
    ore_type: rake.oreType,
    customer: rake.customer,
    destination: rake.destination,
    f_note: rake.fNote,
    offer_time: rake.offerTime,
    placement_time: rake.placementTime,
    adjust_offer_for: rake.adjustOfferFor,
    adjusted_offer_time: rake.adjustedOfferTime,
    is_disabled: rake.isDisabled,
    sno: rake.sno,
  };
}

/** @returns {import('./operational').Rake} */
export function fromRakeApiPayload(dto) {
  const wagonType = dto.wagon_type ?? dto.wagonType ?? "";
  const wagonCount = dto.wagon_count ?? dto.wagonCount ?? dto.wagonSupply ?? 0;
  const parsedCount =
    typeof wagonCount === "number"
      ? wagonCount
      : parseWagonSupply(String(wagonCount)).wagonCount;

  return {
    id: dto.id ?? dto.rakeId ?? "",
    sno: dto.sno ?? 0,
    rakeNumber: dto.rake_number ?? dto.rakeNumber ?? "",
    wagonType,
    wagonCount: parsedCount,
    wagonSupply: formatWagonSupply(wagonType, parsedCount),
    siding: dto.siding ?? "",
    route: dto.route ?? "",
    oreType: dto.ore_type ?? dto.oreType ?? "",
    customer: dto.customer ?? "",
    oreTypeCustomer:
      dto.ore_type_customer ??
      dto.oreTypeCustomer ??
      `${dto.ore_type ?? dto.oreType ?? ""} / ${dto.customer ?? ""}`.trim(),
    destination: dto.destination ?? "",
    fNote: dto.f_note ?? dto.fNote ?? "",
    offerTime: toIsoDateTime(dto.offer_time ?? dto.offerTime),
    placementTime: toIsoDateTime(dto.placement_time ?? dto.placementTime),
    adjustOfferFor: dto.adjust_offer_for ?? dto.adjustOfferFor ?? null,
    adjustedOfferTime: toIsoDateTime(
      dto.adjusted_offer_time ?? dto.adjustedOfferTime,
    ),
    isDisabled: Boolean(dto.is_disabled ?? dto.isDisabled),
  };
}

/** @returns {import('./operational').LoadingRecord} */
export function fromLoadingApiPayload(dto) {
  const wagonSupplyRaw = dto.wagon_supply ?? dto.wagonSupply ?? "";
  const { wagonType, wagonCount } = parseWagonSupply(wagonSupplyRaw);

  return {
    id: dto.id ?? dto.loadingId ?? `LD-${dto.rake_id ?? dto.rakeId ?? Date.now()}`,
    rakeId: dto.rake_id ?? dto.rakeId ?? "",
    rakeNumber: dto.rake_number ?? dto.rakeNumber ?? "",
    wagonSupply:
      wagonSupplyRaw ||
      formatWagonSupply(
        dto.wagon_type ?? dto.wagonType ?? wagonType,
        dto.wagon_count ?? dto.wagonCount ?? wagonCount,
      ),
    siding: dto.siding ?? "",
    route: dto.route ?? "",
    customer: dto.customer ?? "",
    destination: dto.destination ?? "",
    fNote: dto.f_note ?? dto.fNote ?? "",
    placementTime: toIsoDateTime(dto.placement_time ?? dto.placementTime),
    offerTime: toIsoDateTime(dto.offer_time ?? dto.offerTime),
    operatorFtp: dto.operator_ftp ?? dto.operatorFtp ?? "",
    wagonSick: dto.wagon_sick ?? dto.wagonSick ?? "No",
    tonnage: String(dto.tonnage ?? ""),
    stockpile: dto.stockpile ?? "",
    completionTime: toIsoDateTime(dto.completion_time ?? dto.completionTime),
    clearanceTime: toIsoDateTime(dto.clearance_time ?? dto.clearanceTime),
    overloadedWagons: Number(dto.overloaded_wagons ?? dto.overloadedWagons ?? 0),
    weightRemoved: Number(dto.weight_removed ?? dto.weightRemoved ?? 0),
    isDisabled: Boolean(dto.is_disabled ?? dto.isDisabled),
    status: dto.status ?? LOADING_STATUS.PENDING,
    isSubmitted: Boolean(dto.is_submitted ?? dto.isSubmitted),
    manualLoadingTrack: dto.manual_loading_track ?? dto.manualLoadingTrack ?? "",
  };
}

/** @returns {import('./operational').DelayRecord} */
export function fromDelayApiPayload(dto) {
  return {
    id: dto.id ?? `DL-${Date.now()}`,
    rakeId: dto.rake_id ?? dto.rakeId ?? "",
    loadingId: dto.loading_id ?? dto.loadingId ?? "",
    rakeNumber: dto.rake_number ?? dto.rakeNumber ?? "",
    category: dto.category ?? "",
    startTime: toIsoDateTime(dto.start_time ?? dto.startTime),
    endTime: toIsoDateTime(dto.end_time ?? dto.endTime),
    reason: dto.reason ?? "",
    reportedBy: dto.reported_by ?? dto.reportedBy ?? "",
    isDisabled: Boolean(dto.is_disabled ?? dto.isDisabled),
  };
}

/** Create a loading record from a canonical rake (workflow bridge). */
export function loadingRecordFromRake(rake) {
  return fromLoadingApiPayload({
    rakeId: rake.id,
    rakeNumber: rake.rakeNumber,
    wagonSupply: rake.wagonSupply,
    siding: rake.siding,
    route: rake.route,
    customer: rake.customer,
    destination: rake.destination,
    fNote: rake.fNote,
    offerTime: rake.offerTime,
    placementTime: rake.placementTime,
  });
}

/** Create a delay record seed from loading record. */
export function delayRecordFromLoading(loading) {
  return fromDelayApiPayload({
    rakeId: loading.rakeId,
    loadingId: loading.id,
    rakeNumber: loading.rakeNumber,
  });
}
