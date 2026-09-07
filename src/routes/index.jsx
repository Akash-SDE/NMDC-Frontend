import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { USER_ROLES, RAILWAY_ROLES } from "../constants/roles";
import { ProtectedRoute, GuestRoute } from "./guards";
import { LoadingState } from "../components/common/LoadingState";
import AdminLayout from "../layouts/AdminLayout";
import SuperadminLayout from "../layouts/SuperadminLayout";

const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const EDemandPage = lazy(() => import("../features/edemand/pages/EDemandPage"));
const RakeRoutes = lazy(() => import("../features/rake/routes/RakeRoutes"));
const LoadingPage = lazy(() => import("../features/loading/pages/LoadingPage"));
const DelayPage = lazy(() => import("../features/delay/pages/DelayPage"));
const AdminUsersPage = lazy(() => import("../features/users/pages/AdminUsersPage"));
const ReportsRoutes = lazy(() => import("../features/reports/routes/ReportsRoutes"));
const MasterDataRoutes = lazy(() => import("../features/master-data/routes/MasterDataRoutes"));
const OperatorHub = lazy(() => import("../features/operator/pages/OperatorHub"));
const SuperadminRoutes = lazy(() => import("../features/superadmin/routes/SuperadminRoutes"));
const AdminToolsRoutes = lazy(() => import("../features/admin-tools/routes/AdminToolsRoutes"));
const RailwayRoutes = lazy(() => import("../features/railway/routes/RailwayRoutes"));
const ExtractionPage = lazy(() => import("../features/extraction/pages/ExtractionPage"));
const UserManagementPage = lazy(() => import("../features/user-management/pages/UserManagementPage"));
const RoleManagementPage = lazy(() => import("../features/role-management/pages/RoleManagementPage"));

function Lazy({ children }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            <Lazy>
              <LoginPage />
            </Lazy>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.OPERATOR]} />}>
        <Route
          path={ROUTES.OPERATOR}
          element={
            <Lazy>
              <OperatorHub />
            </Lazy>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[...RAILWAY_ROLES, USER_ROLES.ADMIN]}
          />
        }
      >
        <Route element={<AdminLayout />}>
          <Route
            path={`${ROUTES.RAILWAY.ROOT}/*`}
            element={
              <Lazy>
                <RailwayRoutes />
              </Lazy>
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.SUPERADMIN]} />}>
        <Route
          path={`${ROUTES.SUPERADMIN.ROOT}/*`}
          element={
            <Lazy>
              <SuperadminLayout />
            </Lazy>
          }
        >
          <Route
            path="*"
            element={
              <Lazy>
                <SuperadminRoutes />
              </Lazy>
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
          <Route
            path={ROUTES.ADMIN.DASHBOARD}
            element={
              <Lazy>
                <DashboardPage />
              </Lazy>
            }
          />
          <Route
            path={`${ROUTES.ADMIN.EDEMAND}/*`}
            element={
              <Lazy>
                <EDemandPage />
              </Lazy>
            }
          />
          <Route
            path={`${ROUTES.ADMIN.RAKE}/*`}
            element={
              <Lazy>
                <RakeRoutes />
              </Lazy>
            }
          />
          <Route
            path={ROUTES.ADMIN.LOADING}
            element={
              <Lazy>
                <LoadingPage />
              </Lazy>
            }
          />
          <Route
            path={ROUTES.ADMIN.DELAY}
            element={
              <Lazy>
                <DelayPage />
              </Lazy>
            }
          />
          <Route
            path={`${ROUTES.ADMIN.USERS}/*`}
            element={
              <Lazy>
                <AdminUsersPage />
              </Lazy>
            }
          />
          <Route
            path={`${ROUTES.ADMIN.REPORTS}/*`}
            element={
              <Lazy>
                <ReportsRoutes />
              </Lazy>
            }
          />
          <Route
            path={`${ROUTES.ADMIN.MASTER_DATA}/*`}
            element={
              <Lazy>
                <MasterDataRoutes />
              </Lazy>
            }
          />
          <Route
            path="/admin/tools/*"
            element={
              <Lazy>
                <AdminToolsRoutes />
              </Lazy>
            }
          />
          <Route
            path={`${ROUTES.ADMIN.RAILWAY_APPROVALS}/*`}
            element={
              <Lazy>
                <RailwayRoutes />
              </Lazy>
            }
          />
          <Route
            path={ROUTES.ADMIN.EXTRACTION}
            element={
              <Lazy>
                <ExtractionPage />
              </Lazy>
            }
          />
          <Route
            path={ROUTES.ADMIN.USER_MANAGEMENT}
            element={
              <Lazy>
                <UserManagementPage />
              </Lazy>
            }
          />
          <Route
            path={ROUTES.ADMIN.ROLE_MANAGEMENT}
            element={
              <Lazy>
                <RoleManagementPage />
              </Lazy>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default AppRoutes;
