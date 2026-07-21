import { Routes, Route } from "react-router-dom";
import RailwayApprovalsPage from "../pages/RailwayApprovalsPage";

export default function RailwayRoutes() {
  return (
    <Routes>
      <Route index element={<RailwayApprovalsPage />} />
      <Route path="approvals" element={<RailwayApprovalsPage />} />
    </Routes>
  );
}
