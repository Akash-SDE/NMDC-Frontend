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

  return <ReportDetailView report={report} />;
}

function ReportDetailView({ report }) {
  const { rows, filters, loading, source } = useReportData(report.id);

  return (
    <ReportTablePage
      {...report.config}
      reportId={report.id}
      rows={rows}
      filters={filters}
      loading={loading}
      dataSource={source}
      dataSourceType={report.dataSource}
    />
  );
}
