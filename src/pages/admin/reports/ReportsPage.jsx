import { useRouter } from "../../../context/RouterContext";
import DailyReportPage from "./DailyReportPage";
import DemurrageReportPage from "./DemurrageReportPage";
import LoadAdjustmentReportPage from "./LoadAdjustmentReportPage";
import RTReportPage from "./RTReportPage";
import RakeIncentiveReportPage from "./RakeIncentiveReportPage";
import SickWagonReportPage from "./SickWagonReportPage";
import SidingPerformanceReportPage from "./SidingPerformanceReportPage";
import TransactionReportPage from "./TransactionReportPage";

export default function ReportsPage() {
  const { currentRoute } = useRouter();

  switch (currentRoute) {
    case "reports-demurrage":
      return <DemurrageReportPage />;
    case "reports-daily":
      return <DailyReportPage />;
    case "reports-siding-performance":
      return <SidingPerformanceReportPage />;
    case "reports-load-adjustment":
      return <LoadAdjustmentReportPage />;
    case "reports-sick-wagon":
      return <SickWagonReportPage />;
    case "reports-rt":
      return <RTReportPage />;
    case "reports-rake-incentive":
      return <RakeIncentiveReportPage />;
    case "reports":
    case "reports-transaction":
    default:
      return <TransactionReportPage />;
  }
}
