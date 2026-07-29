import ReportTablePage from "./ReportTablePage";
import { dailyReportConfig } from "./reportConfigs";

export default function DailyReportPage() {
  return <ReportTablePage {...dailyReportConfig} />;
}
