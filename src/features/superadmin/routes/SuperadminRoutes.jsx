import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import RoleManagementPage from "../../../pages/superadmin/RoleManagement/RoleManagementPage";
import AddRolePage from "../../../pages/superadmin/RoleManagement/AddRolePage";
import UserManagementPage from "../../../pages/superadmin/UserManagement/UserManagementPage";
import AddUserPage from "../../../pages/superadmin/UserManagement/AddUserPage";

export default function SuperadminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="roles" replace />} />
      <Route path="roles" element={<RoleManagementPage />} />
      <Route path="roles/add" element={<AddRolePage />} />
      <Route path="users" element={<UserManagementPage />} />
      <Route path="users/add" element={<AddUserPage />} />
      <Route path="users/:userId/edit" element={<AddUserPage />} />
    </Routes>
  );
}
