import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COCKPIT_FOOTER_METRICS,
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
    footerMetrics: COCKPIT_FOOTER_METRICS,
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
 * Falls back to static demo data when the API fails or returns no operational rows.
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
      setUseDemo(true);
      return;
    }
    if (status === "success" && liveBundle?.isEmpty) {
      setUseDemo(true);
      return;
    }
    if (status === "success" && liveBundle && !liveBundle.isEmpty) {
      setUseDemo(false);
    }
  }, [status, liveBundle]);

  const bundle = useMemo(() => {
    if (useDemo || !liveBundle) return demoBundle();
    return liveBundle;
  }, [useDemo, liveBundle]);

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
