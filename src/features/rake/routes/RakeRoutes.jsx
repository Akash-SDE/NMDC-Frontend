import { Routes, Route } from "react-router-dom";
import RakeManagementPage from "../pages/RakeManagementPage";

export default function RakeRoutes() {
  return (
    <Routes>
      <Route index element={<RakeManagementPage />} />
      <Route path="upcoming" element={<RakeManagementPage />} />
      <Route path="offering" element={<RakeManagementPage />} />
      <Route path="adjustment" element={<RakeManagementPage />} />
    </Routes>
  );
}
