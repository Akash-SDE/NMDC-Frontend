import {
  createReportConfig,
  WIDE_TABLE_MIN_WIDTH,
  SELECT_PLACEHOLDER,
} from "./reportDefaults";
import { formatDateTimeForTable } from "../../../utils/dateUtils";

function toDateStamp(value) {
  if (!value) return null;
  const parsed = Date.parse(String(value).slice(0, 10));
  return Number.isNaN(parsed) ? null : parsed;
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  return formatDateTimeForTable(value) || "-";
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "-";
}

function formatPercent(value) {
  const formatted = formatNumber(value, 1);
  return formatted === "-" ? formatted : `${formatted}%`;
}

function rowDate(row) {
  return row.date || row.fNoteDate || row.completionDate || row.offerDate || row.completedOn;
}

const dateFromFilter = {
  id: "fromDate",
  label: "From Date",
  type: "date",
  matcher: (row, value, allFilters) => {
    const fromStamp = toDateStamp(value);
    const rowStamp = toDateStamp(rowDate(row));
    if (!fromStamp || !rowStamp) return true;

    const toStamp = toDateStamp(allFilters.toDate);
    if (toStamp && rowStamp > toStamp) return false;

    return rowStamp >= fromStamp;
  },
};

const dateToFilter = {
  id: "toDate",
  label: "To Date",
  type: "date",
  matcher: (row, value, allFilters) => {
    const toStamp = toDateStamp(value);
    const rowStamp = toDateStamp(rowDate(row));
    if (!toStamp || !rowStamp) return true;

    const fromStamp = toDateStamp(allFilters.fromDate);
    if (fromStamp && rowStamp < fromStamp) return false;

    return rowStamp <= toStamp;
  },
};

export const standardDateRangeFilters = [dateFromFilter, dateToFilter];

function selectFilter(id, label, filterKey = id) {
  return { id, label, type: "select", filterKey, placeholder: SELECT_PLACEHOLDER, options: [] };
}

const sidingFilter = selectFilter("siding", "Siding");
const customerFilter = selectFilter("customer", "Customer");
const oreTypeFilter = selectFilter("oreType", "Ore Type");

export const transactionReportConfig = createReportConfig({
  title: "Transaction Report",
  subtitle: "Track rake-wise movement with route, customer, stockpile and completion details.",
  filters: [...standardDateRangeFilters, sidingFilter, customerFilter, oreTypeFilter],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Wagon Type", field: "wagonType" },
    { label: "Siding", field: "siding" },
    { label: "Route No", field: "routeNo", className: "hidden lg:table-cell" },
    { label: "Ore Type", field: "oreType" },
    { label: "F/Note Date", field: "fNoteDate", render: (value) => formatDate(value), className: "hidden xl:table-cell" },
    { label: "Customer", field: "customer" },
    { label: "Destination", field: "destination", className: "hidden xl:table-cell" },
    { label: "Stockpile", field: "stockpile", className: "hidden 2xl:table-cell" },
    { label: "Tonnage", field: "tonnage", render: (value) => formatNumber(value), className: "hidden 2xl:table-cell" },
    { label: "Status", field: "status" },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const demurrageReportConfig = createReportConfig({
  title: "Demurrage Report",
  subtitle: "Monitor rakes that exceed configured demurrage thresholds.",
  filters: [
    ...standardDateRangeFilters,
    {
      id: "threshold",
      label: "Demurrage More Than (Hrs)",
      type: "number",
      placeholder: "5.0",
      matcher: (row, value) => {
        const threshold = Number(value);
        if (Number.isNaN(threshold)) return true;
        return Number(row.demurrageHours) >= threshold;
      },
    },
    sidingFilter,
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Siding", field: "siding", className: "hidden lg:table-cell" },
    { label: "Completion Date", field: "completionDate", render: (value) => formatDate(value) },
    { label: "Demurrage Hours", field: "demurrageHours", render: (value) => formatNumber(value) },
    { label: "Threshold", field: "thresholdHours", className: "hidden lg:table-cell" },
    { label: "Alert", field: "alertLevel", className: "hidden xl:table-cell" },
    { label: "Reason", field: "reason" },
  ],
});

export const dailyReportConfig = createReportConfig({
  title: "Daily Report",
  subtitle: "Daily operational snapshot with rakes, tonnage and demurrage coverage.",
  filters: [
    ...standardDateRangeFilters,
    sidingFilter,
    {
      id: "includeReason",
      label: "Remarks",
      type: "checkbox",
      checkboxLabel: "Include remarks column",
      defaultValue: true,
    },
  ],
  columns: [
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "Total Rakes", field: "totalRakes" },
    { label: "Total Tonnage", field: "totalTonnage", render: (value) => formatNumber(value) },
    { label: "Demurrage Rakes", field: "demurrageRakes", className: "hidden lg:table-cell" },
    { label: "Demurrage Hours", field: "demurrageHours", render: (value) => formatNumber(value), className: "hidden lg:table-cell" },
    { label: "Delay Logs", field: "delayLogs", className: "hidden xl:table-cell" },
    { label: "Remarks", field: "remarks", requiresFilter: "includeReason" },
  ],
});

export const sidingPerformanceReportConfig = createReportConfig({
  title: "Siding Performance Report",
  subtitle: "Analyze siding utilization, demurrage impact and GLH trend.",
  filters: [...standardDateRangeFilters, sidingFilter],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Siding", field: "siding" },
    { label: "No of Rakes Loaded", field: "noOfRakesLoaded" },
    { label: "No of Demurrage Rakes", field: "noOfDemurrageRakes" },
    { label: "Demurrage Hours", field: "demurrageHours", render: (value) => formatNumber(value) },
    { label: "% of Demurrage Rakes", field: "demurragePercent", render: (value) => formatPercent(value), className: "hidden lg:table-cell" },
    { label: "Avg GLH", field: "avgGlh", render: (value) => formatNumber(value), className: "hidden xl:table-cell" },
  ],
});

export const loadAdjustmentReportConfig = createReportConfig({
  title: "Load Adjustment Report",
  subtitle: "Track permit and RTP alignment for completed racks.",
  filters: [
    ...standardDateRangeFilters,
    customerFilter,
    {
      id: "pendingPermit",
      label: "E-Permit",
      type: "checkbox",
      checkboxLabel: "Only loads without E-Permit",
      matcher: (row) => !row.ePermitNumber,
    },
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rack Number", field: "rackNumber" },
    { label: "Customer", field: "customer", className: "hidden lg:table-cell" },
    { label: "Stockpile", field: "stockpile" },
    { label: "Quantity (T)", field: "quantity", render: (value) => formatNumber(value), className: "hidden lg:table-cell" },
    { label: "Completed On", field: "completedOn", render: (value) => formatDate(value) },
    { label: "E-Permit Number", field: "ePermitNumber", render: (value) => value || "-" },
    { label: "Railway Transit Pass", field: "railwayTransitPass", render: (value) => value || "-", className: "hidden lg:table-cell" },
    { label: "Updated By", field: "updatedBy", render: (value) => value || "-", className: "hidden xl:table-cell" },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const sickWagonReportConfig = createReportConfig({
  title: "Sick Wagon Report",
  subtitle: "Monitor sick wagons and repair completion by rake.",
  filters: [...standardDateRangeFilters, customerFilter],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "Customer", field: "customer" },
    { label: "Destination", field: "destination" },
    { label: "No of Sick Wagons", field: "noOfSickWagons" },
    { label: "No of Wagons Repaired", field: "noOfWagonsRepaired", className: "hidden lg:table-cell" },
  ],
});

export const rtReportConfig = createReportConfig({
  title: "RT Report",
  subtitle: "Cross-filter route transaction movement with customer, siding and ore type.",
  filters: [
    ...standardDateRangeFilters,
    customerFilter,
    {
      id: "destination",
      label: "Destination",
      type: "text",
      filterKey: "destination",
      placeholder: "Search destination",
    },
    sidingFilter,
    oreTypeFilter,
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Wagon Type", field: "wagonType" },
    { label: "Siding", field: "siding" },
    { label: "Ore Type", field: "oreType", className: "hidden lg:table-cell" },
    { label: "F/Note Date", field: "fNoteDate", render: (value) => formatDate(value), className: "hidden xl:table-cell" },
    { label: "Customer", field: "customer" },
    { label: "Destination", field: "destination", className: "hidden lg:table-cell" },
    { label: "Tonnage", field: "tonnage", render: (value) => formatNumber(value), className: "hidden xl:table-cell" },
    { label: "Offer Date", field: "offerDate", render: (value) => formatDate(value), className: "hidden 2xl:table-cell" },
    { label: "Completion Date", field: "completionDate", render: (value) => formatDate(value), className: "hidden 2xl:table-cell" },
    { label: "GLH", field: "glh", render: (value) => formatNumber(value) },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const rakeIncentiveReportConfig = createReportConfig({
  title: "Rake Incentive Report",
  subtitle: "Review loading-time bracket performance for incentive tracking.",
  filters: [...standardDateRangeFilters, sidingFilter],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "No of Rakes Loaded", field: "noOfRakesLoaded" },
    { label: "Less Than 2:30 Hrs", field: "lessThan2_30", className: "hidden lg:table-cell" },
    { label: "2:30 to 3:00", field: "from2_30to3_00", className: "hidden xl:table-cell" },
    { label: "3:00 to 3:30", field: "from3_00to3_30", className: "hidden xl:table-cell" },
    { label: "3:30 to 4:00", field: "from3_30to4_00", className: "hidden 2xl:table-cell" },
    { label: "4:00 to 4:30", field: "from4_00to4_30", className: "hidden 2xl:table-cell" },
    { label: "4:30 to 5:00", field: "from4_30to5_00", className: "hidden 2xl:table-cell" },
    { label: "Greater Than 5:00", field: "greaterThan5_00", className: "hidden 2xl:table-cell" },
    { label: "Manual R3", field: "manualR3Loading", className: "hidden 2xl:table-cell" },
    { label: "Manual R4", field: "manualR4Loading", className: "hidden 2xl:table-cell" },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const delayAnalysisReportConfig = createReportConfig({
  title: "Delay Analysis Report",
  subtitle: "Review delay events by rake, category, duration, and responsible operator.",
  filters: [
    ...standardDateRangeFilters,
    selectFilter("category", "Category"),
    {
      id: "rakeNumber",
      label: "Rake Number",
      type: "text",
      filterKey: "rakeNumber",
      placeholder: "Search rake",
    },
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Category", field: "category" },
    { label: "Stage", field: "processStage", className: "hidden xl:table-cell" },
    { label: "Start Time", field: "startTime", render: (value) => formatDateTime(value) },
    { label: "End Time", field: "endTime", render: (value) => formatDateTime(value) },
    { label: "Duration (Hrs)", field: "durationHours", render: (value) => formatNumber(value) },
    { label: "Reason", field: "reason" },
    { label: "Reported By", field: "reportedBy", render: (value) => value || "-", className: "hidden lg:table-cell" },
    { label: "Status", field: "status", className: "hidden xl:table-cell" },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const railwayApprovalAuditReportConfig = createReportConfig({
  title: "Railway Approval Audit",
  subtitle: "Track approval progress across Operations, Commercial, and C&W departments.",
  filters: [...standardDateRangeFilters, sidingFilter, customerFilter],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Customer", field: "customer" },
    { label: "Siding", field: "siding" },
    { label: "Completion", field: "completion", render: (value) => formatDate(value) },
    { label: "Current Step", field: "currentStep" },
    { label: "Operations", field: "operationsStatus", className: "hidden lg:table-cell" },
    { label: "Commercial", field: "commercialStatus", className: "hidden lg:table-cell" },
    { label: "C&W", field: "cwStatus", className: "hidden lg:table-cell" },
    { label: "Updated", field: "updatedAt", render: (value) => formatDate(value), className: "hidden xl:table-cell" },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const eDemandSummaryReportConfig = createReportConfig({
  title: "E-Demand Summary",
  subtitle: "Commercial demand pipeline with customer, destination, and ore classification.",
  filters: [
    ...standardDateRangeFilters,
    customerFilter,
    oreTypeFilter,
    selectFilter("salesType", "Sales Type"),
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "F/Note", field: "fNote" },
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "Customer", field: "customer" },
    { label: "Destination", field: "destination" },
    { label: "Ore Type", field: "oreType" },
    { label: "Sales Type", field: "salesType", className: "hidden lg:table-cell" },
    { label: "Rakes Offered", field: "rakesOffered", className: "hidden xl:table-cell" },
    { label: "Tonnage Loaded", field: "tonnageLoaded", render: (value) => formatNumber(value), className: "hidden xl:table-cell" },
  ],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});
