import { Routes, Route, Navigate } from "react-router-dom";
import MasterDataPage from "../../../pages/admin/masterdata/MasterDataPage";

export default function MasterDataRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="rail-sidings" replace />} />
      <Route path=":entity" element={<MasterDataPage />} />
      <Route path=":entity/add" element={<MasterDataPage />} />
      <Route path=":entity/:id/edit" element={<MasterDataPage />} />
    </Routes>
  );
}
