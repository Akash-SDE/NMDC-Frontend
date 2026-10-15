import { useCallback, useEffect, useState } from "react";
import { loadReportDataset, toReportRequest } from "./reportDataEngine";
import { getReportById } from "./reportRegistry";

const FILTER_DEBOUNCE_MS = 300;

export function useReportData(reportId, filterValues) {
  const baseConfig = getReportById(reportId)?.config;
  const requestKey = JSON.stringify(toReportRequest(filterValues));
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState(() => ({
    rows: [],
    filters: baseConfig?.filters ?? [],
    status: "loading",
    error: null,
    refreshing: false,
  }));

  useEffect(() => {
    if (!baseConfig) return undefined;

    let cancelled = false;
    const timer = setTimeout(() => {
      setState((previous) => ({ ...previous, refreshing: true }));
      loadReportDataset(reportId, baseConfig, JSON.parse(requestKey))
        .then((dataset) => {
          if (cancelled) return;
          setState({
            rows: dataset.rows,
            filters: dataset.filters,
            status: "ready",
            error: null,
            refreshing: false,
          });
        })
        .catch((error) => {
          if (cancelled) return;
          setState((previous) => ({ ...previous, status: "error", error, refreshing: false }));
        });
    }, FILTER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reportId, baseConfig, requestKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { ...state, reload };
}
