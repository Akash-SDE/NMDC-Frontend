import {
  transactionReportConfig,
  demurrageReportConfig,
  dailyReportConfig,
  sidingPerformanceReportConfig,
  loadAdjustmentReportConfig,
  sickWagonReportConfig,
  rtReportConfig,
  rakeIncentiveReportConfig,
  delayAnalysisReportConfig,
  railwayApprovalAuditReportConfig,
  eDemandSummaryReportConfig,
} from "./reportConfigs";

export const REPORT_CATEGORIES = [
  { id: "all", label: "All Reports" },
  { id: "operations", label: "Operations" },
  { id: "performance", label: "Performance" },
  { id: "compliance", label: "Compliance" },
];

export const REPORTS = [
  {
    id: "transaction",
    legacyRouteId: "reports-transaction",
    path: "transaction",
    category: "operations",
    dataSource: "live",
    shortLabel: "Transaction",
    config: transactionReportConfig,
  },
  {
    id: "rt",
    legacyRouteId: "reports-rt",
    path: "rt",
    category: "operations",
    dataSource: "live",
    shortLabel: "RT",
    config: rtReportConfig,
  },
  {
    id: "e-demand-summary",
    legacyRouteId: "reports-e-demand-summary",
    path: "e-demand-summary",
    category: "operations",
    dataSource: "live",
    shortLabel: "E-Demand",
    config: eDemandSummaryReportConfig,
  },
  {
    id: "daily",
    legacyRouteId: "reports-daily",
    path: "daily",
    category: "performance",
    dataSource: "aggregated",
    shortLabel: "Daily",
    config: dailyReportConfig,
  },
  {
    id: "siding-performance",
    legacyRouteId: "reports-siding-performance",
    path: "siding-performance",
    category: "performance",
    dataSource: "aggregated",
    shortLabel: "Siding",
    config: sidingPerformanceReportConfig,
  },
  {
    id: "rake-incentive",
    legacyRouteId: "reports-rake-incentive",
    path: "rake-incentive",
    category: "performance",
    dataSource: "aggregated",
    shortLabel: "Incentive",
    config: rakeIncentiveReportConfig,
  },
  {
    id: "demurrage",
    legacyRouteId: "reports-demurrage",
    path: "demurrage",
    category: "compliance",
    dataSource: "live",
    shortLabel: "Demurrage",
    config: demurrageReportConfig,
  },
  {
    id: "sick-wagon",
    legacyRouteId: "reports-sick-wagon",
    path: "sick-wagon",
    category: "compliance",
    dataSource: "live",
    shortLabel: "Sick Wagon",
    config: sickWagonReportConfig,
  },
  {
    id: "load-adjustment",
    legacyRouteId: "reports-load-adjustment",
    path: "load-adjustment",
    category: "compliance",
    dataSource: "live",
    shortLabel: "Load Adjustment",
    config: loadAdjustmentReportConfig,
  },
  {
    id: "delay-analysis",
    legacyRouteId: "reports-delay-analysis",
    path: "delay-analysis",
    category: "compliance",
    dataSource: "live",
    shortLabel: "Delay Analysis",
    config: delayAnalysisReportConfig,
  },
  {
    id: "railway-approval-audit",
    legacyRouteId: "reports-railway-approval-audit",
    path: "railway-approval-audit",
    category: "compliance",
    dataSource: "live",
    shortLabel: "Approval Audit",
    config: railwayApprovalAuditReportConfig,
  },
];

export function getReportById(reportId) {
  return REPORTS.find((report) => report.id === reportId) ?? null;
}

export function getReportByLegacyRoute(legacyRouteId) {
  return REPORTS.find((report) => report.legacyRouteId === legacyRouteId) ?? null;
}

export function getCategoryLabel(categoryId) {
  return REPORT_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export function getDataSourceLabel(source) {
  if (source === "live") return "Live data";
  if (source === "aggregated") return "Aggregated";
  return "Static";
}
