import { createContext, useContext, useState, useCallback } from "react";

const RouterContext = createContext(null);

export const USER_ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  SUPERADMIN: "superadmin",
};

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState("login");
  const [routeParams, setRouteParams] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useCallback((route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo(0, 0);
  }, []);

  const login = useCallback(
    (role, userData = {}) => {
      setUserRole(role);
      setIsAuthenticated(true);
      setUser({
        name:
          userData.name ||
          (role === USER_ROLES.SUPERADMIN ? "Super Admin" : "Harish Kumar"),
        username:
          userData.username ||
          (role === USER_ROLES.SUPERADMIN ? "superadmin" : "admin"),
        role: role,
        ...userData,
      });

      if (role === USER_ROLES.SUPERADMIN) {
        navigate("sa-roles");
      } else if (role === USER_ROLES.OPERATOR) {
        navigate("operator-operations");
      } else {
        navigate("dashboard");
      }
    },
    [navigate],
  );

  const logout = useCallback(() => {
    setUserRole(null);
    setIsAuthenticated(false);
    setUser(null);
    setRouteParams({});
    navigate("login");
  }, [navigate]);

  return (
    <RouterContext.Provider
      value={{
        currentRoute,
        routeParams,
        navigate,
        userRole,
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
