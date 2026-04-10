import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { refreshAccessToken } from "../services/authService";

const RouterContext = createContext(null);
const AUTH_STORAGE_KEY = "nmdc_auth_session";
const TOKEN_STORAGE_KEY = "nmdc_auth_tokens";

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
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}

function readStoredTokens() {
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredTokens(tokens) {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Ignore storage failures.
  }
}

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState("login");
  const [routeParams, setRouteParams] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [persistSession, setPersistSession] = useState(false);
  const [tokens, setTokens] = useState({ access: null, refresh: null });

  useEffect(() => {
    const storedSession = readStoredSession();
    if (!storedSession) return;

    const storedTokens = readStoredTokens();
    if (storedTokens) setTokens(storedTokens);

    setUserRole(storedSession.userRole);
    setIsAuthenticated(true);
    setUser(storedSession.user || null);
    setPersistSession(true);
    setCurrentRoute(
      storedSession.lastRoute || getDefaultRouteForRole(storedSession.userRole),
    );
    setRouteParams({});
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userRole || !user || !persistSession) {
      if (!persistSession) {
        clearStoredSession();
      }
      return;
    }

    writeStoredSession({
      isAuthenticated: true,
      userRole,
      user,
      lastRoute: currentRoute,
    });
  }, [isAuthenticated, userRole, user, currentRoute, persistSession]);

  const navigate = useCallback((route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo(0, 0);
  }, []);

  const login = useCallback(
    (role, userData = {}, rememberSession = false, authTokens = {}) => {
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
      setPersistSession(rememberSession);
      setTokens(authTokens);

      // Always persist tokens so apiClient can read them for API calls.
      // Session (user/role) is only persisted when rememberSession is true.
      if (authTokens?.access) writeStoredTokens(authTokens);

      if (rememberSession) {
        writeStoredSession({
          isAuthenticated: true,
          userRole: role,
          user: resolvedUser,
          lastRoute: targetRoute,
        });
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      navigate(targetRoute);
    },
    [navigate],
  );

  const logout = useCallback(() => {
    setUserRole(null);
    setIsAuthenticated(false);
    setUser(null);
    setPersistSession(false);
    setRouteParams({});
    setTokens({ access: null, refresh: null });
    clearStoredSession();
    navigate("login");
  }, [navigate]);

  /** Attempt a silent token refresh; returns new access token or throws. */
  const refreshToken = useCallback(async () => {
    const storedTokens = readStoredTokens() || tokens;
    if (!storedTokens?.refresh) throw new Error("No refresh token available.");
    const { access } = await refreshAccessToken(storedTokens.refresh);
    const updated = { ...storedTokens, access };
    setTokens(updated);
    if (persistSession) writeStoredTokens(updated);
    return access;
  }, [tokens, persistSession]);

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
        tokens,
        refreshToken,
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
