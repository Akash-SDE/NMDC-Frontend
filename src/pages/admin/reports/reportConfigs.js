import {
  createReportConfig,
  DEFAULT_TABLE_MIN_WIDTH,
  WIDE_TABLE_MIN_WIDTH,
  SELECT_PLACEHOLDER,
} from "./reportDefaults";

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

const commonCustomerOptions = [
  { value: "NMDC STEEL LIMITED", label: "NMDC STEEL LIMITED" },
  { value: "VANDANA GLOBAL LTD", label: "VANDANA GLOBAL LTD" },
  { value: "JSW STEEL LIMITED", label: "JSW STEEL LIMITED" },
  { value: "RINL", label: "RINL" },
];

const commonSidingOptions = [
  { value: "DSLF", label: "DSLF" },
  { value: "DSLF-1", label: "DSLF-1" },
  { value: "D19/11A", label: "D19/11A" },
  { value: "R4", label: "R4" },
  { value: "R3 D10 F", label: "R3 D10 F" },
];

const transactionRows = [
  {
    id: 1,
    rakeNumber: "NK153",
    wagonType: "NSS8",
    siding: "DSLF",
    routeNo: 1,
    oreType: "FINES",
    fNoteDate: "2026-03-19",
    customer: "NMDC STEEL LIMITED",
    destination: "NMAG",
    stockpile: "D9/FINE",
    tonnage: 4551.85,
    offerDate: "2026-03-19",
    completionDate: "2026-03-19",
    glh: 4.2,
    status: "Completed",
  },
  {
    id: 2,
    rakeNumber: "JC31",
    wagonType: "NH-L59",
    siding: "DSLF-1",
    routeNo: 1,
    oreType: "CLO",
    fNoteDate: "2026-03-19",
    customer: "VANDANA GLOBAL LTD",
    destination: "BDXX",
    stockpile: "D9/CLO",
    tonnage: 4530.4,
    offerDate: "2026-03-19",
    completionDate: "2026-03-19",
    glh: 3.5,
    status: "Completed",
  },
  {
    id: 3,
    rakeNumber: "NK154",
    wagonType: "NSS8",
    siding: "D19/11A",
    routeNo: 2,
    oreType: "FINES",
    fNoteDate: "2026-03-19",
    customer: "NMDC STEEL LIMITED",
    destination: "NMAG",
    stockpile: "D10/FINE",
    tonnage: 4560.8,
    offerDate: "2026-03-19",
    completionDate: "2026-03-19",
    glh: 4.55,
    status: "Completed",
  },
  {
    id: 4,
    rakeNumber: "NK01",
    wagonType: "NH-L87",
    siding: "R4",
    routeNo: 1,
    oreType: "FINES",
    fNoteDate: "2026-03-18",
    customer: "JSW STEEL LIMITED",
    destination: "VPTG",
    stockpile: "FOD DEPS",
    tonnage: 4230.19,
    offerDate: "2026-03-18",
    completionDate: "2026-03-18",
    glh: 4.3,
    status: "Completed",
  },
  {
    id: 5,
    rakeNumber: "NK202",
    wagonType: "NSS8",
    siding: "D19/11A",
    routeNo: 1,
    oreType: "FINES",
    fNoteDate: "2026-03-18",
    customer: "RINL",
    destination: "VSPS",
    stockpile: "D10/FINE",
    tonnage: 4428.1,
    offerDate: "2026-03-18",
    completionDate: "2026-03-18",
    glh: 4.1,
    status: "In Progress",
  },
];

const demurrageRows = [
  {
    id: 1,
    rakeNumber: "DMR-110",
    completionDate: "2026-03-09",
    demurrageHours: 8.2,
    thresholdHours: 5,
    alertLevel: "High",
    reason: "Late siding availability",
  },
  {
    id: 2,
    rakeNumber: "DMR-111",
    completionDate: "2026-03-11",
    demurrageHours: 6.4,
    thresholdHours: 5,
    alertLevel: "Medium",
    reason: "Wagon inspection hold",
  },
  {
    id: 3,
    rakeNumber: "DMR-113",
    completionDate: "2026-03-15",
    demurrageHours: 4.1,
    thresholdHours: 5,
    alertLevel: "Low",
    reason: "Minor route re-sequencing",
  },
];

const dailyRows = [
  {
    id: 1,
    date: "2026-03-19",
    totalRakes: 12,
    totalTonnage: 53224.59,
    demurrageRakes: 4,
    demurrageHours: 16,
    remarks: "Normal operation with targeted dispatch",
  },
  {
    id: 2,
    date: "2026-03-18",
    totalRakes: 10,
    totalTonnage: 46015.2,
    demurrageRakes: 3,
    demurrageHours: 11,
    remarks: "Delay due to weather",
  },
  {
    id: 3,
    date: "2026-03-17",
    totalRakes: 9,
    totalTonnage: 41887.0,
    demurrageRakes: 2,
    demurrageHours: 7,
    remarks: "Steady output",
  },
];

const sidingPerformanceRows = [
  {
    id: 1,
    siding: "DSLF",
    noOfRakesLoaded: 93,
    noOfDemurrageRakes: 41,
    demurrageHours: 106,
    demurragePercent: "44.09%",
    avgGlh: 5.71,
    date: "2026-03-19",
  },
  {
    id: 2,
    siding: "DSLF-1",
    noOfRakesLoaded: 96,
    noOfDemurrageRakes: 54,
    demurrageHours: 195,
    demurragePercent: "56.1%",
    avgGlh: 6.33,
    date: "2026-03-19",
  },
  {
    id: 3,
    siding: "D19/11A",
    noOfRakesLoaded: 94,
    noOfDemurrageRakes: 59,
    demurrageHours: 168,
    demurragePercent: "62.7%",
    avgGlh: 6.47,
    date: "2026-03-18",
  },
  {
    id: 4,
    siding: "R4",
    noOfRakesLoaded: 31,
    noOfDemurrageRakes: 17,
    demurrageHours: 71,
    demurragePercent: "54.8%",
    avgGlh: 6.82,
    date: "2026-03-18",
  },
];

const loadAdjustmentRows = [
  {
    id: 1,
    rackNumber: "NK-04",
    stockpile: "DSFINE",
    completedOn: "2026-03-03",
    ePermitNumber: "EPM-240301",
    railwayTransitPass: "RTP-90301",
    updatedBy: "OPS01",
  },
  {
    id: 2,
    rackNumber: "CK-04",
    stockpile: "DSFINE",
    completedOn: "2026-03-04",
    ePermitNumber: "EPM-240302",
    railwayTransitPass: "RTP-90302",
    updatedBy: "OPS02",
  },
  {
    id: 3,
    rackNumber: "NK-09",
    stockpile: "DSCLO",
    completedOn: "2026-03-04",
    ePermitNumber: "EPM-240303",
    railwayTransitPass: "RTP-90303",
    updatedBy: "OPS03",
  },
];

const sickWagonRows = [
  {
    id: 1,
    rakeNumber: "DK04",
    date: "2026-03-06",
    customer: "AMB RIVER COKE LTD",
    destination: "VPTG",
    noOfSickWagons: 3,
    noOfWagonsRepaired: 0,
  },
  {
    id: 2,
    rakeNumber: "PK05",
    date: "2026-03-08",
    customer: "RASHMI METALIKS",
    destination: "VSPS",
    noOfSickWagons: 5,
    noOfWagonsRepaired: 0,
  },
  {
    id: 3,
    rakeNumber: "JK29",
    date: "2026-03-11",
    customer: "SREE NAKODA ISPAT",
    destination: "NMDH",
    noOfSickWagons: 1,
    noOfWagonsRepaired: 0,
  },
  {
    id: 4,
    rakeNumber: "JK20",
    date: "2026-03-18",
    customer: "B S SPONGE",
    destination: "JCB",
    noOfSickWagons: 3,
    noOfWagonsRepaired: 0,
  },
];

const rtRows = [
  {
    id: 1,
    rakeNumber: "NK153",
    wagonType: "NSS8",
    siding: "DSLF",
    oreType: "FINES",
    fNoteDate: "2026-03-19",
    customer: "NMDC STEEL LIMITED",
    destination: "NMAG",
    tonnage: 4551.85,
    offerDate: "2026-03-19",
    completionDate: "2026-03-19",
    glh: 4.2,
  },
  {
    id: 2,
    rakeNumber: "JC31",
    wagonType: "NH-L59",
    siding: "DSLF-1",
    oreType: "CLO",
    fNoteDate: "2026-03-19",
    customer: "VANDANA GLOBAL LTD",
    destination: "BDXX",
    tonnage: 4530.4,
    offerDate: "2026-03-19",
    completionDate: "2026-03-19",
    glh: 3.5,
  },
  {
    id: 3,
    rakeNumber: "NK154",
    wagonType: "NSS8",
    siding: "D19/11A",
    oreType: "FINES",
    fNoteDate: "2026-03-19",
    customer: "NMDC STEEL LIMITED",
    destination: "NMAG",
    tonnage: 4560.8,
    offerDate: "2026-03-19",
    completionDate: "2026-03-19",
    glh: 4.55,
  },
];

const rakeIncentiveRows = [
  {
    id: 1,
    date: "2026-03-01",
    noOfRakesLoaded: 10,
    lessThan2_30: 0,
    from2_30to3_00: 0,
    from3_00to3_30: 0,
    from3_30to4_00: 1,
    from4_00to4_30: 3,
    from4_30to5_00: 2,
    greaterThan5_00: 2,
    manualR3Loading: 1,
    manualR4Loading: 1,
  },
  {
    id: 2,
    date: "2026-03-02",
    noOfRakesLoaded: 11,
    lessThan2_30: 0,
    from2_30to3_00: 1,
    from3_00to3_30: 1,
    from3_30to4_00: 2,
    from4_00to4_30: 2,
    from4_30to5_00: 4,
    greaterThan5_00: 1,
    manualR3Loading: 0,
    manualR4Loading: 1,
  },
  {
    id: 3,
    date: "2026-03-03",
    noOfRakesLoaded: 12,
    lessThan2_30: 0,
    from2_30to3_00: 0,
    from3_00to3_30: 0,
    from3_30to4_00: 1,
    from4_00to4_30: 3,
    from4_30to5_00: 5,
    greaterThan5_00: 1,
    manualR3Loading: 0,
    manualR4Loading: 2,
  },
];

const dateFromFilter = {
  id: "fromDate",
  label: "From Date",
  type: "date",
  matcher: (row, value, allFilters) => {
    const fromStamp = toDateStamp(value);
    const targetDate = row.date || row.fNoteDate || row.completionDate || row.offerDate || row.completedOn;
    const rowStamp = toDateStamp(targetDate);
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
    const targetDate = row.date || row.fNoteDate || row.completionDate || row.offerDate || row.completedOn;
    const rowStamp = toDateStamp(targetDate);
    if (!toStamp || !rowStamp) return true;

    const fromStamp = toDateStamp(allFilters.fromDate);
    if (fromStamp && rowStamp < fromStamp) return false;

    return rowStamp <= toStamp;
  },
};

export const standardDateRangeFilters = [dateFromFilter, dateToFilter];

export const transactionReportConfig = createReportConfig({
  title: "Transaction Report",
  subtitle: "Track rake-wise movement with route, customer, stockpile and completion details.",
  filters: [
    ...standardDateRangeFilters,
    {
      id: "siding",
      label: "Siding",
      type: "select",
      filterKey: "siding",
      placeholder: SELECT_PLACEHOLDER,
      options: commonSidingOptions,
    },
    {
      id: "customer",
      label: "Customer",
      type: "select",
      filterKey: "customer",
      placeholder: SELECT_PLACEHOLDER,
      options: commonCustomerOptions,
    },
  ],
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
    { label: "Tonnage", field: "tonnage", render: (value) => Number(value).toFixed(2), className: "hidden 2xl:table-cell" },
    { label: "Status", field: "status" },
  ],
  rows: transactionRows,
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
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Completion Date", field: "completionDate", render: (value) => formatDate(value) },
    { label: "Demurrage Hours", field: "demurrageHours" },
    { label: "Threshold", field: "thresholdHours", className: "hidden lg:table-cell" },
    { label: "Alert", field: "alertLevel", className: "hidden xl:table-cell" },
    { label: "Reason", field: "reason" },
  ],
  rows: demurrageRows,
});

export const dailyReportConfig = createReportConfig({
  title: "Daily Report",
  subtitle: "Daily operational snapshot with rakes, tonnage and demurrage coverage.",
  filters: [
    ...standardDateRangeFilters,
    {
      id: "includeReason",
      label: "Remarks",
      type: "checkbox",
      checkboxLabel: "Include remarks column",
    },
  ],
  columns: [
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "Total Rakes", field: "totalRakes" },
    { label: "Total Tonnage", field: "totalTonnage", render: (value) => Number(value).toFixed(2) },
    { label: "Demurrage Rakes", field: "demurrageRakes", className: "hidden lg:table-cell" },
    { label: "Demurrage Hours", field: "demurrageHours", className: "hidden lg:table-cell" },
    { label: "Remarks", field: "remarks" },
  ],
  rows: dailyRows,
});

export const sidingPerformanceReportConfig = createReportConfig({
  title: "Siding Performance Report",
  subtitle: "Analyze siding utilization, demurrage impact and GLH trend.",
  filters: [...standardDateRangeFilters],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Siding", field: "siding" },
    { label: "No of Rakes Loaded", field: "noOfRakesLoaded" },
    { label: "No of Demurrage Rakes", field: "noOfDemurrageRakes" },
    { label: "Demurrage Hours", field: "demurrageHours" },
    { label: "% of Demurrage Rakes", field: "demurragePercent", className: "hidden lg:table-cell" },
    { label: "Avg GLH", field: "avgGlh", className: "hidden xl:table-cell" },
  ],
  rows: sidingPerformanceRows,
});

export const loadAdjustmentReportConfig = createReportConfig({
  title: "Load Adjustment Report",
  subtitle: "Track permit and RTP alignment for completed racks.",
  filters: [...standardDateRangeFilters],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rack Number", field: "rackNumber" },
    { label: "Stockpile", field: "stockpile" },
    { label: "Completed On", field: "completedOn", render: (value) => formatDate(value) },
    { label: "E-Permit Number", field: "ePermitNumber" },
    { label: "Railway Transit Pass", field: "railwayTransitPass", className: "hidden lg:table-cell" },
    { label: "Updated By", field: "updatedBy", className: "hidden xl:table-cell" },
  ],
  rows: loadAdjustmentRows,
});

export const sickWagonReportConfig = createReportConfig({
  title: "Sick Wagon Report",
  subtitle: "Monitor sick wagons and repair completion by rake.",
  filters: [...standardDateRangeFilters],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "Customer", field: "customer" },
    { label: "Destination", field: "destination" },
    { label: "No of Sick Wagons", field: "noOfSickWagons" },
    { label: "No of Wagons Repaired", field: "noOfWagonsRepaired", className: "hidden lg:table-cell" },
  ],
  rows: sickWagonRows,
});

export const rtReportConfig = createReportConfig({
  title: "RT Report",
  subtitle: "Cross-filter route transaction movement with customer, siding and ore type.",
  filters: [
    ...standardDateRangeFilters,
    {
      id: "customer",
      label: "Customer",
      type: "select",
      filterKey: "customer",
      placeholder: SELECT_PLACEHOLDER,
      options: commonCustomerOptions,
    },
    {
      id: "destination",
      label: "Destination",
      type: "text",
      filterKey: "destination",
      placeholder: "Search destination",
    },
    {
      id: "siding",
      label: "Siding",
      type: "select",
      filterKey: "siding",
      placeholder: SELECT_PLACEHOLDER,
      options: commonSidingOptions,
    },
    {
      id: "oreType",
      label: "Ore Type",
      type: "select",
      filterKey: "oreType",
      placeholder: SELECT_PLACEHOLDER,
      options: [
        { value: "FINES", label: "FINES" },
        { value: "CLO", label: "CLO" },
        { value: "LUMP", label: "LUMP" },
        { value: "PELLET", label: "PELLET" },
      ],
    },
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
    { label: "Tonnage", field: "tonnage", render: (value) => Number(value).toFixed(2), className: "hidden xl:table-cell" },
    { label: "Offer Date", field: "offerDate", render: (value) => formatDate(value), className: "hidden 2xl:table-cell" },
    { label: "Completion Date", field: "completionDate", render: (value) => formatDate(value), className: "hidden 2xl:table-cell" },
    { label: "GLH", field: "glh" },
  ],
  rows: rtRows,
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const rakeIncentiveReportConfig = createReportConfig({
  title: "Rake Incentive Report",
  subtitle: "Review loading-time bracket performance for incentive tracking.",
  filters: [...standardDateRangeFilters],
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
  rows: rakeIncentiveRows,
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const delayAnalysisReportConfig = createReportConfig({
  title: "Delay Analysis Report",
  subtitle: "Review delay events by rake, category, duration, and responsible operator.",
  filters: [...standardDateRangeFilters],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "Rake Number", field: "rakeNumber" },
    { label: "Category", field: "category" },
    { label: "Start Time", field: "startTime", render: (value) => formatDate(value) },
    { label: "End Time", field: "endTime", render: (value) => formatDate(value) },
    { label: "Duration (Hrs)", field: "durationHours" },
    { label: "Reason", field: "reason" },
    { label: "Reported By", field: "reportedBy", className: "hidden lg:table-cell" },
  ],
  rows: [],
});

export const railwayApprovalAuditReportConfig = createReportConfig({
  title: "Railway Approval Audit",
  subtitle: "Track approval progress across Operations, Commercial, and C&W departments.",
  filters: [...standardDateRangeFilters],
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
  rows: [],
  tableMinWidth: WIDE_TABLE_MIN_WIDTH,
});

export const eDemandSummaryReportConfig = createReportConfig({
  title: "E-Demand Summary",
  subtitle: "Commercial demand pipeline with customer, destination, and ore classification.",
  filters: [
    ...standardDateRangeFilters,
    {
      id: "customer",
      label: "Customer",
      type: "select",
      filterKey: "customer",
      placeholder: SELECT_PLACEHOLDER,
      options: commonCustomerOptions,
    },
  ],
  columns: [
    { label: "Sl No", field: "id" },
    { label: "F/Note", field: "fNote" },
    { label: "Date", field: "date", render: (value) => formatDate(value) },
    { label: "Customer", field: "customer" },
    { label: "Destination", field: "destination" },
    { label: "Ore Type", field: "oreType" },
    { label: "Sales Type", field: "salesType", className: "hidden lg:table-cell" },
  ],
  rows: [],
});
