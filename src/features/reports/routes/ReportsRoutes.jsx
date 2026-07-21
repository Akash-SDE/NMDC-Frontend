import { Routes, Route } from "react-router-dom";
import ReportsPage from "../../../pages/admin/reports/ReportsPage";

export default function ReportsRoutes() {
  return (
    <Routes>
      <Route index element={<ReportsPage />} />
      <Route path="transaction" element={<ReportsPage />} />
      <Route path="demurrage" element={<ReportsPage />} />
      <Route path="daily" element={<ReportsPage />} />
      <Route path="siding-performance" element={<ReportsPage />} />
      <Route path="load-adjustment" element={<ReportsPage />} />
      <Route path="sick-wagon" element={<ReportsPage />} />
      <Route path="rt" element={<ReportsPage />} />
      <Route path="rake-incentive" element={<ReportsPage />} />
      <Route path="delay-analysis" element={<ReportsPage />} />
      <Route path="railway-approval-audit" element={<ReportsPage />} />
      <Route path="e-demand-summary" element={<ReportsPage />} />
    </Routes>
  );
}
