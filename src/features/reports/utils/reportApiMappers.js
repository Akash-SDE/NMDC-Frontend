export const REPORT_PAGE_SIZE = 1000;

const MANUAL_LOADING_TRACK_LABELS = { 5: "R3", 10: "R4" };

function wagonSupplyLabel(wagonType, wagonCount) {
  const type = wagonType || "";
  const count = wagonCount == null || wagonCount === "" ? "" : String(wagonCount);
  if (type && count) return `${type}/${count}`;
  return type || count;
}

export function asResults(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

export function mapReportRake(dto) {
  return {
    id: dto.id,
    rakeNumber: dto.rake_number || "",
    wagonType: dto.wagontype_name || "",
    wagonCount: dto.wagoncount ?? "",
    oreType: dto.oretype_name || "",
    offerTime: dto.offertime || null,
  };
}

export function mapReportLoading(dto) {
  return {
    id: dto.id,
    rakeId: dto.rake,
    rakeNumber: dto.rake_number || "",
    wagonSupply: wagonSupplyLabel(dto.wagontype_name, dto.wagoncount),
    siding: dto.siding_name || "",
    route: dto.route_name || "",
    customer: dto.customer_name || "",
    destination: dto.destination_name || "",
    stockpile: dto.stockpile_name || "",
    fNote: dto.fnote || "",
    tonnage: dto.tonnage ?? 0,
    offerTime: dto.offertime || null,
    placementTime: dto.placement_time || null,
    completionTime: dto.completion_time || null,
    clearanceTime: dto.clearance_time || null,
    operatorFtp: dto.operator_ftp || "",
    wagonSick: dto.wagon_sick_name || "No",
    manualLoadingTrack: MANUAL_LOADING_TRACK_LABELS[dto.manual_loading_track] || "",
    overloadedWagons: dto.overloaded_wagons ?? 0,
    weightRemoved: Number(dto.weight_removed) || 0,
    status: dto.status_description || "",
    isDisabled: Boolean(dto.is_disabled),
  };
}

export function mapReportDelay(dto, rakeIdByNumber = {}) {
  return {
    id: dto.id,
    rakeId: rakeIdByNumber[dto.rake] ?? null,
    loadingId: null,
    rakeNumber: dto.rake || "",
    category: dto.category_name || "",
    startTime: dto.delay_start_time || null,
    endTime: dto.delay_end_time || null,
    reason: dto.reason || "",
    reportedBy: dto.reported_by ?? "",
    isDisabled: false,
  };
}
