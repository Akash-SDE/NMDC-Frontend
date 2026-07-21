import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AUTH_STORAGE_KEY, AUTH_TAB_SESSION_KEY, TOKEN_STORAGE_KEY } from "../constants/storageKeys";
import { USER_ROLES, DEFAULT_ROUTE_BY_ROLE } from "../constants/roles";
import { loginWithCredentials } from "../services/auth/authService";
import { writeTokens } from "../api/axiosClient";

const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY) ||
      sessionStorage.getItem(AUTH_TAB_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.isAuthenticated || !parsed?.userRole) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSession(session, remember) {
  const payload = JSON.stringify(session);
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, payload);
    sessionStorage.removeItem(AUTH_TAB_SESSION_KEY);
  } else {
    sessionStorage.setItem(AUTH_TAB_SESSION_KEY, payload);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_TAB_SESSION_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function resolveRoleFromEmail(email) {
  const value = email.toLowerCase();
  if (value.includes("superadmin")) return USER_ROLES.SUPERADMIN;
  if (value.includes("station") || value.includes("operations")) {
    return USER_ROLES.STATION_MASTER;
  }
  if (value.includes("commercial")) return USER_ROLES.COMMERCIAL;
  if (value.includes("cw") || value.includes("wagon")) return USER_ROLES.CW_INSPECTOR;
  if (value.includes("operator")) return USER_ROLES.OPERATOR;
  return USER_ROLES.ADMIN;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState({ access: null, refresh: null });

  useEffect(() => {
    const session = readStoredSession();
    if (session) {
      setUser(session.user ?? null);
      setUserRole(session.userRole);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((role, userData, authTokens, remember) => {
    setUserRole(role);
    setUser(userData);
    setIsAuthenticated(true);
    setTokens(authTokens);
    writeTokens(authTokens);

    if (remember) {
      writeStoredSession(
        {
          isAuthenticated: true,
          userRole: role,
          user: userData,
        },
        true,
      );
    } else {
      writeStoredSession(
        {
          isAuthenticated: true,
          userRole: role,
          user: userData,
        },
        false,
      );
      writeTokens(authTokens);
    }
  }, []);

  const login = useCallback(
    async ({ email, password, remember = false }) => {
      const trimmedEmail = email.trim();
      const tokens = await loginWithCredentials(trimmedEmail, password);
      const role = resolveRoleFromEmail(trimmedEmail);
      const userData = {
        username: trimmedEmail,
        name: trimmedEmail.split("@")[0],
        role,
      };
      persistSession(role, userData, tokens, remember);
      return { role, user: userData, tokens };
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setTokens({ access: null, refresh: null });
    clearStoredSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      userRole,
      isAuthenticated,
      isLoading,
      tokens,
      login,
      logout,
      defaultRoute: userRole ? DEFAULT_ROUTE_BY_ROLE[userRole] : "/login",
    }),
    [user, userRole, isAuthenticated, isLoading, tokens, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { USER_ROLES };
