import { fetchReport } from "../../../services/reportService";

const FILTER_PARAMS = {
  fromDate: "from_date",
  toDate: "to_date",
  siding: "siding",
  customer: "customer",
  destination: "destination",
  oreType: "ore_type",
  category: "category",
  salesType: "sales_type",
  threshold: "threshold",
};

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

export function toReportRequest(filterValues = {}) {
  const request = { time_zone: browserTimeZone() };
  Object.entries(FILTER_PARAMS).forEach(([filterId, param]) => {
    const value = String(filterValues[filterId] ?? "").trim();
    if (!value) return;
    if (param === "threshold") {
      const threshold = Number(value);
      if (Number.isFinite(threshold) && threshold >= 0) request.threshold = threshold;
      return;
    }
    request[param] = value;
  });
  if (request.from_date && request.to_date && request.from_date > request.to_date) {
    delete request.to_date;
  }
  return request;
}

export function applyFilterOptions(filters = [], filterOptions = {}) {
  return filters.map((filter) => {
    const options = filterOptions[filter.id];
    if (filter.type !== "select" || !Array.isArray(options)) return filter;
    return { ...filter, options };
  });
}

export async function loadReportDataset(reportId, baseConfig, request = {}) {
  const response = await fetchReport(reportId, request);
  return {
    rows: Array.isArray(response?.rows) ? response.rows : [],
    filters: applyFilterOptions(baseConfig.filters ?? [], response?.filter_options),
  };
}
