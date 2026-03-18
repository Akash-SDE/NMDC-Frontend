import { createContext, useContext, useState, useCallback } from "react";

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState("login");
  const [routeParams, setRouteParams] = useState({});

  const navigate = useCallback((route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{ currentRoute, routeParams, navigate }}>
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
