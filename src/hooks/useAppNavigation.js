import { useCallback, useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { legacyRouteToPath, pathToLegacyRoute } from "../constants/routes";

/**
 * Bridge hook for legacy route IDs → URL paths.
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const routeParams = useMemo(() => {
    const query = Object.fromEntries(searchParams.entries());
    return { ...params, ...query, ...(location.state ?? {}) };
  }, [params, searchParams, location.state]);

  const currentRoute = pathToLegacyRoute(location.pathname);

  const appNavigate = useCallback(
    (legacyIdOrPath, state = {}) => {
      const target = legacyIdOrPath.startsWith("/")
        ? legacyIdOrPath
        : legacyRouteToPath(legacyIdOrPath);
      navigate(target, { state });
      window.scrollTo(0, 0);
    },
    [navigate],
  );

  return {
    navigate: appNavigate,
    currentRoute,
    routeParams,
    pathname: location.pathname,
    location,
  };
}
