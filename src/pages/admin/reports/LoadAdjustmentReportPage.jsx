import ReportTablePage from "./ReportTablePage";
import { loadAdjustmentReportConfig } from "./reportConfigs";

export default function LoadAdjustmentReportPage() {
  return <ReportTablePage {...loadAdjustmentReportConfig} />;
}
