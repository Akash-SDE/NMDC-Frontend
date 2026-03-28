import ReportTablePage from "./ReportTablePage";
import { demurrageReportConfig } from "./reportConfigs";

export default function DemurrageReportPage() {
  return <ReportTablePage {...demurrageReportConfig} />;
}
