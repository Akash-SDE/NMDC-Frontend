/** Maps report columns to where data is entered or computed in the application. */
export const REPORT_DATA_LINEAGE = {
  transaction: {
    summary: "Rake and loading records from Rake Management and Load Management.",
    inputScreen: "Load Management",
    fields: [
      { field: "rakeNumber", label: "Rake Number", source: "Rake Management", hasInput: true },
      { field: "wagonType", label: "Wagon Type", source: "Rake Management", hasInput: true },
      { field: "siding", label: "Siding", source: "Rake / Load Management", hasInput: true },
      { field: "routeNo", label: "Route No", source: "Derived from route", hasInput: false },
      { field: "customer", label: "Customer", source: "Rake Management", hasInput: true },
      { field: "tonnage", label: "Tonnage", source: "Load Management", hasInput: true },
      { field: "status", label: "Status", source: "Load Management + Railway Approvals", hasInput: true },
    ],
  },
  rt: {
    summary: "Route transaction metrics from loading completion and offer times.",
    inputScreen: "Load Management",
    fields: [
      { field: "glh", label: "GLH", source: "Computed from offer and completion times", hasInput: false },
      { field: "tonnage", label: "Tonnage", source: "Load Management", hasInput: true },
      { field: "offerDate", label: "Offer Date", source: "Rake / Load Management", hasInput: true },
      { field: "completionDate", label: "Completion Date", source: "Load Management", hasInput: true },
    ],
  },
  "e-demand-summary": {
    summary: "E-Demand register entries saved from Manage E-Demand.",
    inputScreen: "Manage E-Demand",
    fields: [
      { field: "fNote", label: "F-Note", source: "Manage E-Demand", hasInput: true },
      { field: "date", label: "Date", source: "Manage E-Demand", hasInput: true },
      { field: "customer", label: "Customer", source: "Manage E-Demand", hasInput: true },
      { field: "destination", label: "Destination", source: "Manage E-Demand", hasInput: true },
      { field: "oreType", label: "Ore Type", source: "Manage E-Demand", hasInput: true },
      { field: "salesType", label: "Sales Type", source: "Manage E-Demand", hasInput: true },
    ],
  },
  daily: {
    summary: "Daily totals aggregated from completed loading records.",
    inputScreen: "Load Management",
    fields: [
      { field: "totalRakes", label: "Total Rakes", source: "Aggregated from loading", hasInput: false },
      { field: "totalTonnage", label: "Total Tonnage", source: "Aggregated from loading", hasInput: false },
      { field: "demurrageRakes", label: "Demurrage Rakes", source: "Computed from placement/clearance times", hasInput: false },
      { field: "remarks", label: "Remarks", source: "Auto summary from delays and demurrage", hasInput: false },
    ],
  },
  "siding-performance": {
    summary: "Siding KPIs aggregated from loading records.",
    inputScreen: "Load Management",
    fields: [
      { field: "noOfRakesLoaded", label: "Rakes Loaded", source: "Aggregated from loading", hasInput: false },
      { field: "demurragePercent", label: "Demurrage %", source: "Computed", hasInput: false },
      { field: "avgGlh", label: "Avg GLH", source: "Computed from loading times", hasInput: false },
    ],
  },
  "rake-incentive": {
    summary: "GLH buckets from loading; manual R3/R4 from Load Management track field.",
    inputScreen: "Load Management",
    fields: [
      { field: "manualR3Loading", label: "Manual R3", source: "Load Management → Manual Loading Track", hasInput: true },
      { field: "manualR4Loading", label: "Manual R4", source: "Load Management → Manual Loading Track", hasInput: true },
      { field: "lessThan2_30", label: "GLH Buckets", source: "Computed from offer/completion times", hasInput: false },
    ],
  },
  demurrage: {
    summary: "Demurrage hours from loading times; reason from Delay Management.",
    inputScreen: "Delay Management",
    fields: [
      { field: "demurrageHours", label: "Demurrage Hours", source: "Computed from placement/clearance", hasInput: false },
      { field: "reason", label: "Reason", source: "Delay Management", hasInput: true },
      { field: "alertLevel", label: "Alert Level", source: "Computed from threshold", hasInput: false },
    ],
  },
  "sick-wagon": {
    summary: "Sick wagon flag from Load Management; counts from Railway Approvals inspection.",
    inputScreen: "Load Management / Railway Approvals",
    fields: [
      { field: "wagonSick", label: "Wagon Sick", source: "Load Management", hasInput: true },
      { field: "noOfSickWagons", label: "Sick Count", source: "Railway Approvals wagon manifest", hasInput: true },
      { field: "noOfWagonsRepaired", label: "Repaired Count", source: "Railway Approvals wagon manifest", hasInput: true },
    ],
  },
  "load-adjustment": {
    summary: "Completed loads synced to E-Permit register; permit numbers edited on Manage E-Permit.",
    inputScreen: "Manage E-Permit",
    fields: [
      { field: "rackNumber", label: "Rack Number", source: "Load Management (auto-sync)", hasInput: true },
      { field: "ePermitNumber", label: "E-Permit Number", source: "Manage E-Permit", hasInput: true },
      { field: "railwayTransitPass", label: "Railway Transit Pass", source: "Manage E-Permit / seed", hasInput: true },
      { field: "updatedBy", label: "Updated By", source: "Captured on E-Permit save", hasInput: true },
    ],
  },
  "delay-analysis": {
    summary: "Delay logs entered in Delay Management.",
    inputScreen: "Delay Management",
    fields: [
      { field: "category", label: "Category", source: "Delay Management", hasInput: true },
      { field: "reason", label: "Reason", source: "Delay Management", hasInput: true },
      { field: "reportedBy", label: "Reported By", source: "Delay Management", hasInput: true },
      { field: "durationHours", label: "Duration", source: "Computed from start/end times", hasInput: false },
    ],
  },
  "railway-approval-audit": {
    summary: "Approval workflow status from Railway Approvals.",
    inputScreen: "Railway Approvals",
    fields: [
      { field: "currentStep", label: "Current Step", source: "Railway Approvals workflow", hasInput: true },
      { field: "operationsStatus", label: "Operations", source: "Railway Approvals", hasInput: true },
      { field: "commercialStatus", label: "Commercial", source: "Railway Approvals", hasInput: true },
      { field: "cwStatus", label: "C&W", source: "Railway Approvals", hasInput: true },
    ],
  },
};

export function getReportLineage(reportId) {
  return REPORT_DATA_LINEAGE[reportId] ?? null;
}
