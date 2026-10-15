import { useState } from "react";
import { useRouter } from "../../../context/RouterContext";
import ReportsHubPage from "./ReportsHubPage";
import ReportTablePage from "./ReportTablePage";
import { getReportByLegacyRoute } from "./reportRegistry";
import { useReportData } from "./useReportData";

export default function ReportsPage() {
  const { currentRoute } = useRouter();

  if (currentRoute === "reports") {
    return <ReportsHubPage />;
  }

  const report = getReportByLegacyRoute(currentRoute);
  if (!report) {
    return <ReportsHubPage />;
  }

  return <ReportDetailView key={report.id} report={report} />;
}

function ReportDetailView({ report }) {
  const [filterValues, setFilterValues] = useState({});
  const { rows, filters, status, error, refreshing, reload } = useReportData(report.id, filterValues);

  return (
    <ReportTablePage
      {...report.config}
      reportId={report.id}
      rows={rows}
      filters={filters}
      loading={status === "loading"}
      refreshing={refreshing}
      error={status === "error" ? error : null}
      onRetry={reload}
      onFilterValuesChange={setFilterValues}
      dataSourceType={report.dataSource}
    />
  );
}
