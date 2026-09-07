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
import { fetchProfile } from "../services/profileService";
import { writeTokens } from "../api/axiosClient";

const AuthContext = createContext(null);

/* ── storage helpers ─────────────────────────────────────────── */
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

/* ── role resolution ─────────────────────────────────────────── */
/**
 * Derive the app role from the profile API response.
 * Priority: is_superuser → role array → fallback to ADMIN
 */
function resolveRoleFromProfile(profile) {
  if (!profile) return USER_ROLES.ADMIN;
  if (profile.is_superuser) return USER_ROLES.SUPERADMIN;

  const roleNames = (profile.role ?? []).map((r) =>
    (r.role_name ?? r).toLowerCase()
  );

  if (roleNames.some((n) => n.includes("superadmin"))) return USER_ROLES.SUPERADMIN;
  if (roleNames.some((n) => n.includes("operator")))    return USER_ROLES.OPERATOR;
  if (roleNames.some((n) => n.includes("station") || n.includes("operations")))
    return USER_ROLES.STATION_MASTER;
  if (roleNames.some((n) => n.includes("commercial")))  return USER_ROLES.COMMERCIAL;
  if (roleNames.some((n) => n.includes("cw") || n.includes("wagon")))
    return USER_ROLES.CW_INSPECTOR;

  return USER_ROLES.ADMIN;
}

/* ── provider ────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(null);
  const [profile, setProfile]             = useState(null); // full profile from API
  const [userRole, setUserRole]           = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [tokens, setTokens]               = useState({ access: null, refresh: null });

  /* restore session on mount */
  useEffect(() => {
    const session = readStoredSession();
    if (session) {
      setUser(session.user ?? null);
      setProfile(session.profile ?? null);
      setUserRole(session.userRole);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback(
    (role, userData, profileData, authTokens, remember) => {
      setUserRole(role);
      setUser(userData);
      setProfile(profileData);
      setIsAuthenticated(true);
      setTokens(authTokens);
      writeTokens(authTokens);

      writeStoredSession(
        { isAuthenticated: true, userRole: role, user: userData, profile: profileData },
        remember,
      );
    },
    [],
  );

  const login = useCallback(
    async ({ email, password, remember = false }) => {
      const trimmedEmail = email.trim();

      /* 1. get tokens */
      const authTokens = await loginWithCredentials(trimmedEmail, password);

      /* 2. store tokens first so the profile request is authenticated */
      writeTokens(authTokens);

      /* 3. fetch profile to get real role + user info */
      let profileData = null;
      let role = USER_ROLES.ADMIN;

      try {
        profileData = await fetchProfile();
        role = resolveRoleFromProfile(profileData);
      } catch {
        /* profile fetch failed (e.g. mock mode) — fall back to email heuristic */
        role = resolveRoleFromEmail(trimmedEmail);
      }

      const userData = {
        username: trimmedEmail,
        name: profileData
          ? `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`.trim() ||
            trimmedEmail.split("@")[0]
          : trimmedEmail.split("@")[0],
        email: profileData?.email ?? trimmedEmail,
        role,
      };

      persistSession(role, userData, profileData, authTokens, remember);
      return { role, user: userData, profile: profileData, tokens: authTokens };
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setTokens({ access: null, refresh: null });
    clearStoredSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      userRole,
      isAuthenticated,
      isLoading,
      tokens,
      login,
      logout,
      defaultRoute: userRole ? DEFAULT_ROUTE_BY_ROLE[userRole] : "/login",
    }),
    [user, profile, userRole, isAuthenticated, isLoading, tokens, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* fallback role heuristic when profile API is unavailable */
function resolveRoleFromEmail(email) {
  const v = email.toLowerCase();
  if (v.includes("superadmin"))                        return USER_ROLES.SUPERADMIN;
  if (v.includes("station") || v.includes("operations")) return USER_ROLES.STATION_MASTER;
  if (v.includes("commercial"))                        return USER_ROLES.COMMERCIAL;
  if (v.includes("cw") || v.includes("wagon"))         return USER_ROLES.CW_INSPECTOR;
  if (v.includes("operator"))                          return USER_ROLES.OPERATOR;
  return USER_ROLES.ADMIN;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { USER_ROLES };
