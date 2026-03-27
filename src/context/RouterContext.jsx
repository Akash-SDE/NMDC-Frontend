import { createContext, useContext, useState, useCallback, useEffect } from "react";

const RouterContext = createContext(null);
const AUTH_STORAGE_KEY = "nmdc_auth_session";

export const USER_ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  SUPERADMIN: "superadmin",
};

function getDefaultRouteForRole(role) {
  if (role === USER_ROLES.SUPERADMIN) return "sa-roles";
  if (role === USER_ROLES.OPERATOR) return "operator-operations";
  return "dashboard";
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.isAuthenticated || !parsed?.userRole) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState("login");
  const [routeParams, setRouteParams] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedSession = readStoredSession();
    if (!storedSession) return;

    setUserRole(storedSession.userRole);
    setIsAuthenticated(true);
    setUser(storedSession.user || null);
    setCurrentRoute(
      storedSession.lastRoute || getDefaultRouteForRole(storedSession.userRole),
    );
    setRouteParams({});
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userRole || !user) return;

    writeStoredSession({
      isAuthenticated: true,
      userRole,
      user,
      lastRoute: currentRoute,
    });
  }, [isAuthenticated, userRole, user, currentRoute]);

  const navigate = useCallback((route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo(0, 0);
  }, []);

  const login = useCallback(
    (role, userData = {}) => {
      const resolvedUser = {
        name:
          userData.name ||
          (role === USER_ROLES.SUPERADMIN ? "Super Admin" : "Harish Kumar"),
        username:
          userData.username ||
          (role === USER_ROLES.SUPERADMIN ? "superadmin" : "admin"),
        role: role,
        ...userData,
      };

      const targetRoute = getDefaultRouteForRole(role);

      setUserRole(role);
      setIsAuthenticated(true);
      setUser(resolvedUser);

      writeStoredSession({
        isAuthenticated: true,
        userRole: role,
        user: resolvedUser,
        lastRoute: targetRoute,
      });

      navigate(targetRoute);
    },
    [navigate],
  );

  const logout = useCallback(() => {
    setUserRole(null);
    setIsAuthenticated(false);
    setUser(null);
    setRouteParams({});
    clearStoredSession();
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
