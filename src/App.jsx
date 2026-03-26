import { RouterProvider, useRouter, USER_ROLES } from "./context/RouterContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";

import Dashboard from "./pages/admin/dashboard/Dashboard";
import MasterDataPage from "./pages/admin/masterdata/MasterDataPage";
import RakeManagementPage from "./pages/admin/rakemanagement/RakeManagementPage";
import LoadingManagementPage from "./pages/admin/loading/LoadingManagementPage";
import DelayManagementPage from "./pages/admin/delay/DelayManagementPage";
import AdminUserManagementPage from "./pages/admin/users/AdminUserManagementPage";
import ReportsPage from "./pages/admin/reports/ReportsPage";
import AuditLogsPage from "./pages/admin/audit/AuditLogsPage";
import OperatorOperationsHub from "./pages/operator/OperatorOperationsHub";
import SuperadminLayout from "./pages/superadmin/SuperadminLayout";
import RoleManagementPage from "./pages/superadmin/RoleManagement/RoleManagementPage";
import AddRolePage from "./pages/superadmin/RoleManagement/AddRolePage";
import UserManagementPage from "./pages/superadmin/UserManagement/UserManagementPage";
import AddUserPage from "./pages/superadmin/UserManagement/AddUserPage";

function AppRoutes() {
  const { currentRoute, userRole, isAuthenticated } = useRouter();

  // === AUTH PAGES ===
  if (currentRoute === "login") return <LoginPage />;
  if (currentRoute === "signup") return <SignupPage />;

  // === GUARD ===
  if (!isAuthenticated) return <LoginPage />;

  // === SUPERADMIN ROUTES ===
  if (
    currentRoute.startsWith("sa-") ||
    (userRole === USER_ROLES.SUPERADMIN && currentRoute.startsWith("sa-"))
  ) {
    const renderSuperadminPage = () => {
      switch (currentRoute) {
        case "sa-roles":
          return <RoleManagementPage />;
        case "sa-add-role":
          return <AddRolePage />;
        case "sa-users":
          return <UserManagementPage />;
        case "sa-add-user":
          return <AddUserPage />;
        case "sa-edit-user":
          return <AddUserPage />;
        default:
          return <RoleManagementPage />;
      }
    };

    return <SuperadminLayout>{renderSuperadminPage()}</SuperadminLayout>;
  }

  // === ADMIN ROUTES ===
  if (userRole === USER_ROLES.OPERATOR) {
    const renderOperatorPage = () => {
      switch (currentRoute) {
        case "operator-operations":
          return <OperatorOperationsHub />;
        default:
          return <OperatorOperationsHub />;
      }
    };

    return <Layout>{renderOperatorPage()}</Layout>;
  }

  const renderAdminPage = () => {
    switch (currentRoute) {
      case "dashboard":
        return <Dashboard />;
      case "rake-management":
        return <RakeManagementPage />;
      case "loading-management":
        return <LoadingManagementPage />;
      case "delay-management":
        return <DelayManagementPage />;
      case "admin-users":
        return <AdminUserManagementPage />;
      case "reports":
        return <ReportsPage />;
      case "audit-logs":
        return <AuditLogsPage />;
      case "master-data":
      case "wagon-types":
      case "rail-sidings":
      case "ore-categories":
      case "customer-master":
      case "destinations":
      case "route-mapping":
      case "stockpile-logs":
      case "delay-categories":
        return <MasterDataPage />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderAdminPage()}</Layout>;
}

export default function App() {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}
