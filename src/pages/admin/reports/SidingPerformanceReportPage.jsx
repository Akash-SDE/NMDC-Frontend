import ReportTablePage from "./ReportTablePage";
import { sidingPerformanceReportConfig } from "./reportConfigs";

export default function SidingPerformanceReportPage() {
  return <ReportTablePage {...sidingPerformanceReportConfig} />;
}
