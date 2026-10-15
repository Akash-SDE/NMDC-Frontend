import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listRakes } from "../../../services/rakeManagementService";
import { listLoadingRecords } from "../../../services/loadingManagementService";
import { listDelayRecords } from "../../../services/delayManagementService";
import { fetchSidings } from "../../../services/sidingService";
import {
  asResults,
  buildDispatchGrid,
  buildMetricValues,
  buildUpcomingRakeRows,
  getDayWindow,
} from "../utils/dashboardMappers";

const REFRESH_INTERVAL_MS = 60 * 1000;
const DASHBOARD_PAGE_SIZE = 1000;

async function fetchDashboardRecords() {
  const [rakes, loadings, delays, sidings] = await Promise.all([
    listRakes({ page_size: DASHBOARD_PAGE_SIZE }),
    listLoadingRecords({ page_size: DASHBOARD_PAGE_SIZE }),
    listDelayRecords({ page_size: DASHBOARD_PAGE_SIZE }),
    fetchSidings({ page_size: DASHBOARD_PAGE_SIZE }),
  ]);

  return {
    rakes: asResults(rakes),
    loadings: asResults(loadings),
    delays: asResults(delays),
    sidings: asResults(sidings),
  };
}

export function useDashboardData(dashboardDate) {
  const [records, setRecords] = useState({ rakes: [], loadings: [], delays: [], sidings: [] });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const mountedRef = useRef(true);

  const loadDashboard = useCallback(() => {
    return fetchDashboardRecords().then(
      (nextRecords) => {
        if (!mountedRef.current) return;
        setRecords(nextRecords);
        setRefreshedAt(Date.now());
        setError(null);
        setStatus("success");
      },
      (err) => {
        if (!mountedRef.current) return;
        console.error("Failed to fetch dashboard data:", err);
        setError(err);
        setStatus("failed");
      },
    );
  }, []);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    return loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    mountedRef.current = true;
    loadDashboard();
    const intervalId = setInterval(loadDashboard, REFRESH_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [loadDashboard]);

  const dayWindow = useMemo(() => getDayWindow(dashboardDate), [dashboardDate]);

  const metricValues = useMemo(
    () => buildMetricValues(records, dayWindow),
    [records, dayWindow],
  );

  const dispatchGrid = useMemo(
    () => buildDispatchGrid(records, dayWindow, refreshedAt),
    [records, dayWindow, refreshedAt],
  );

  const upcomingRakeRows = useMemo(() => buildUpcomingRakeRows(records), [records]);

  return {
    status,
    error,
    metricValues,
    dispatchGrid,
    upcomingRakeRows,
    reload,
  };
}

export default useDashboardData;
