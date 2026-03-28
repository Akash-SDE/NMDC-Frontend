import ReportTablePage from "./ReportTablePage";
import { transactionReportConfig } from "./reportConfigs";

export default function TransactionReportPage() {
  return <ReportTablePage {...transactionReportConfig} />;
}
