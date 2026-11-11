import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COCKPIT_KPIS,
  COCKPIT_SIDINGS,
  DASHBOARD_META,
  DISPATCH_GRID_ROWS,
  LIVE_RAKE_REGISTER,
  MONTHLY_TREND,
  PRODUCT_DISPATCH,
  REGISTER_TOTAL_TRACKED,
  SIDING_LOADING,
} from "../../../pages/admin/dashboard/operations-cockpit/staticData";
import { buildCockpitBundle } from "../utils/cockpitMappers";
import useDashboardData from "./useDashboardData";

/** Demo fallback is opt-in only (local demos). Successful API calls always use live data. */
const ALLOW_DEMO_FALLBACK =
  import.meta.env.VITE_COCKPIT_ALLOW_DEMO === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_COCKPIT_ALLOW_DEMO !== "false");

const EMPTY_RECORDS = { rakes: [], loadings: [], delays: [], sidings: [] };

function emptyLiveBundle(dateValue, refreshedAt = Date.now()) {
  return buildCockpitBundle(EMPTY_RECORDS, dateValue, refreshedAt);
}

function formatDashboardDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function demoBundle() {
  return {
    meta: DASHBOARD_META,
    kpis: COCKPIT_KPIS,
    footerMetrics: [],
    sidings: COCKPIT_SIDINGS,
    dispatchGridRows: DISPATCH_GRID_ROWS,
    liveRakeRegister: LIVE_RAKE_REGISTER,
    registerTotalTracked: REGISTER_TOTAL_TRACKED,
    monthlyTrend: MONTHLY_TREND,
    productDispatch: PRODUCT_DISPATCH,
    productDispatchTotalMt: 1.24,
    sidingLoading: SIDING_LOADING,
    isEmpty: false,
    isDemo: true,
  };
}

/**
 * Live operations cockpit: same APIs as the main dashboard, mapped to cockpit UI shapes.
 * Optional demo fallback (VITE_COCKPIT_ALLOW_DEMO=true) when APIs fail — never when APIs succeed.
 */
export function useOperationsCockpitData(cockpitDate) {
  const dateValue = cockpitDate || formatDashboardDate(new Date());
  const { status, error, records, refreshedAt, reload } = useDashboardData(dateValue);
  const [useDemo, setUseDemo] = useState(false);

  const liveBundle = useMemo(() => {
    if (status !== "success") return null;
    return buildCockpitBundle(records, dateValue, refreshedAt);
  }, [status, records, dateValue, refreshedAt]);

  useEffect(() => {
    if (status === "failed") {
      setUseDemo(ALLOW_DEMO_FALLBACK);
      return;
    }
    if (status === "success") {
      setUseDemo(false);
    }
  }, [status]);

  const bundle = useMemo(() => {
    if (useDemo) return demoBundle();
    if (liveBundle) return liveBundle;
    if (status === "loading") return emptyLiveBundle(dateValue, refreshedAt);
    return emptyLiveBundle(dateValue, refreshedAt);
  }, [useDemo, liveBundle, status, dateValue, refreshedAt]);

  const forceLive = useCallback(() => {
    setUseDemo(false);
    return reload();
  }, [reload]);

  return {
    status,
    error,
    bundle,
    dataSource: bundle.isDemo ? "demo" : "live",
    reload: forceLive,
    dateValue,
  };
}

export default useOperationsCockpitData;
