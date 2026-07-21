import { Routes, Route } from "react-router-dom";
import AdminToolsPage from "../../../pages/admin/admintools/AdminToolsPage";

export default function AdminToolsRoutes() {
  return (
    <Routes>
      <Route index element={<AdminToolsPage />} />
      <Route path="edit-rake-timing" element={<AdminToolsPage />} />
    </Routes>
  );
}
