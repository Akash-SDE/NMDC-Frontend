import ReportTablePage from "./ReportTablePage";
import { sickWagonReportConfig } from "./reportConfigs";

export default function SickWagonReportPage() {
  return <ReportTablePage {...sickWagonReportConfig} />;
}
