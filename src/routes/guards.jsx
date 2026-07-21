import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { DEFAULT_ROUTE_BY_ROLE } from "../constants/roles";

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const fallback = DEFAULT_ROUTE_BY_ROLE[userRole] ?? ROUTES.ADMIN.DASHBOARD;
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated) {
    const target = DEFAULT_ROUTE_BY_ROLE[userRole] ?? ROUTES.ADMIN.DASHBOARD;
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
