import { useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useAppNavigation } from "../hooks/useAppNavigation";

/** @deprecated RouterProvider is a no-op shim. AuthProvider wraps the app in providers.jsx */
export function RouterProvider({ children }) {
  return children;
}

const REFRESH_TOKEN_STUB = async () => {
  throw new Error("Token refresh handled by axios interceptor.");
};

/** Compatibility shim mapping legacy useRouter() to AuthContext + react-router-dom */
export function useRouter() {
  const auth = useAuth();
  const navigation = useAppNavigation();

  return useMemo(
    () => ({
      ...navigation,
      user: auth.user,
      userRole: auth.userRole,
      isAuthenticated: auth.isAuthenticated,
      login: auth.login,
      logout: auth.logout,
      tokens: auth.tokens,
      refreshToken: REFRESH_TOKEN_STUB,
    }),
    [
      navigation,
      auth.user,
      auth.userRole,
      auth.isAuthenticated,
      auth.login,
      auth.logout,
      auth.tokens,
    ],
  );
}

export { USER_ROLES } from "../constants/roles";
