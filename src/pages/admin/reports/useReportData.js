import { useEffect, useState } from "react";
import { loadReportDataset } from "./reportDataEngine";
import { getReportById } from "./reportRegistry";

export function useReportData(reportId) {
  const [state, setState] = useState({
    rows: [],
    filters: [],
    loading: Boolean(reportId),
    source: "static",
  });

  useEffect(() => {
    const report = getReportById(reportId);
    const baseConfig = report?.config;

    if (!reportId || !baseConfig) {
      setState({ rows: [], filters: [], loading: false, source: "static" });
      return;
    }

    let cancelled = false;
    setState({
      rows: baseConfig.rows ?? [],
      filters: baseConfig.filters ?? [],
      loading: true,
      source: "static",
    });

    loadReportDataset(reportId, baseConfig)
      .then((dataset) => {
        if (cancelled) return;
        setState({
          rows: dataset.rows?.length ? dataset.rows : baseConfig.rows ?? [],
          filters: dataset.filters ?? baseConfig.filters ?? [],
          loading: false,
          source: dataset.rows?.length ? "live" : "static",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          rows: baseConfig.rows ?? [],
          filters: baseConfig.filters ?? [],
          loading: false,
          source: "static",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  return state;
}
