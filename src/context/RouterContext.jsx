import { useAuth } from "./AuthContext";
import { useAppNavigation } from "../hooks/useAppNavigation";

/** @deprecated RouterProvider is a no-op shim. AuthProvider wraps the app in providers.jsx */
export function RouterProvider({ children }) {
  return children;
}

/** Compatibility shim mapping legacy useRouter() to AuthContext + react-router-dom */
export function useRouter() {
  const auth = useAuth();
  const navigation = useAppNavigation();

  return {
    ...navigation,
    user: auth.user,
    userRole: auth.userRole,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    tokens: auth.tokens,
    refreshToken: async () => {
      throw new Error("Token refresh handled by axios interceptor.");
    },
  };
}

export { USER_ROLES } from "../constants/roles";
