import { RouterProvider, useRouter, USER_ROLES } from "./context/RouterContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./components/auth/LoginPage";

import Dashboard from "./pages/admin/dashboard/Dashboard";
import EDemandManagementPage from "./pages/admin/edemand/EDemandManagementPage";
import MasterDataPage from "./pages/admin/masterdata/MasterDataPage";
import RakeManagementPage from "./pages/admin/rakemanagement/RakeManagementPage";
import LoadingManagementPage from "./pages/admin/loading/LoadingManagementPage";
import DelayManagementPage from "./pages/admin/delay/DelayManagementPage";
import AdminUserManagementPage from "./pages/admin/users/AdminUserManagementPage";
import ReportsPage from "./pages/admin/reports/ReportsPage";
import AdminToolsPage from "./pages/admin/admintools/AdminToolsPage";
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
      case "e-demand":
      case "manage-e-demand":
      case "manage-e-demand-add":
      case "manage-e-permit":
        return <EDemandManagementPage />;
      case "rake-management":
        return <RakeManagementPage />;
      case "rake-offering":
        return <RakeManagementPage />;
      case "rake-adjustment":
        return <RakeManagementPage />;
      case "loading-management":
        return <LoadingManagementPage />;
      case "delay-management":
        return <DelayManagementPage />;
      case "admin-users":
      case "admin-users-add":
      case "admin-users-edit":
        return <AdminUserManagementPage />;
      case "admin-tools":
      case "admin-delete-offered-rakes":
      case "admin-edit-rake-timing":
        return <AdminToolsPage />;
      case "reports":
      case "reports-transaction":
      case "reports-demurrage":
      case "reports-daily":
      case "reports-siding-performance":
      case "reports-load-adjustment":
      case "reports-sick-wagon":
      case "reports-rt":
      case "reports-rake-incentive":
        return <ReportsPage />;
      case "master-data":
      case "wagon-types":
      case "wagon-types-add":
      case "wagon-types-edit":
      case "rail-sidings":
      case "rail-sidings-add":
      case "rail-sidings-edit":
      case "ore-categories":
      case "ore-categories-add":
      case "ore-categories-edit":
      case "customer-master":
      case "customer-master-add":
      case "customer-master-edit":
      case "destinations":
      case "destinations-add":
      case "destinations-edit":
      case "route-mapping":
      case "route-mapping-add":
      case "route-mapping-edit":
      case "stockpile-logs":
      case "stockpile-logs-add":
      case "stockpile-logs-edit":
      case "delay-categories":
      case "delay-categories-add":
      case "delay-categories-edit":
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
