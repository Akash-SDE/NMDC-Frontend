import { useMemo, useState } from "react";
import {
  UniformPageShell,
  UniformSectionCard,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";

const logs = [
  {
    id: "AUD-9001",
    timestamp: "2026-03-25T08:12:00",
    user: "harish.admin",
    action: "CREATE_RAKE",
    module: "Rake Management",
    target: "R-2026-019",
    severity: "info",
    ipAddress: "10.22.1.6",
  },
  {
    id: "AUD-9002",
    timestamp: "2026-03-25T08:46:00",
    user: "amit.operator",
    action: "UPDATE_LOADING",
    module: "Loading",
    target: "RK-8812",
    severity: "info",
    ipAddress: "10.22.1.9",
  },
  {
    id: "AUD-9003",
    timestamp: "2026-03-25T09:18:00",
    user: "harish.admin",
    action: "DISABLE_USER",
    module: "Manage Users",
    target: "USR-1003",
    severity: "warning",
    ipAddress: "10.22.1.6",
  },
  {
    id: "AUD-9004",
    timestamp: "2026-03-25T09:33:00",
    user: "neha.viewer",
    action: "LOGIN_FAILED",
    module: "Auth",
    target: "viewer-portal",
    severity: "critical",
    ipAddress: "10.22.2.12",
  },
  {
    id: "AUD-9005",
    timestamp: "2026-03-25T10:02:00",
    user: "amit.operator",
    action: "ADD_DELAY",
    module: "Delay",
    target: "Mechanical",
    severity: "warning",
    ipAddress: "10.22.1.9",
  },
  {
    id: "AUD-9006",
    timestamp: "2026-03-25T11:06:00",
    user: "harish.admin",
    action: "EXPORT_REPORT",
    module: "Reports",
    target: "Daily Dispatch",
    severity: "info",
    ipAddress: "10.22.1.6",
  },
];

function formatTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityClass(severity) {
  if (severity === "critical") return "bg-rose-100 text-rose-700";
  if (severity === "warning") return "bg-amber-100 text-amber-700";
  return "bg-sky-100 text-sky-700";
}

function Metric({ title, value, tone }) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-800">{value}</p>
    </article>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((entry) => {
      const searchMatches = `${entry.user} ${entry.action} ${entry.module} ${entry.target}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return searchMatches;
    });
  }, [search]);

  const summary = useMemo(() => {
    const warningCount = filteredLogs.filter((entry) => entry.severity === "warning").length;
    const criticalCount = filteredLogs.filter((entry) => entry.severity === "critical").length;
    return {
      total: filteredLogs.length,
      warnings: warningCount,
      critical: criticalCount,
    };
  }, [filteredLogs]);

  return (
    <UniformPageShell
      title="Audit Logs"
      subtitle="Central trace for security events, user actions, and operational change history."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric title="Visible Events" value={summary.total} tone="border-slate-200 bg-white" />
          <Metric title="Warnings" value={summary.warnings} tone="border-amber-200 bg-amber-50" />
          <Metric title="Critical" value={summary.critical} tone="border-rose-200 bg-rose-50" />
        </div>

        <UniformSectionCard
          title="Event Stream"
          subtitle="Chronological system events with action-level metadata for compliance and troubleshooting."
        >
          <SearchBar
            placeholder="Search user, module, action, or target"
            value={search}
            onChange={setSearch}
            showFilter={false}
          />

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-210">
              <thead>
                <tr className="bg-slate-700 text-white">
                  {["Timestamp", "User", "Action", "Module", "Target", "Severity", "IP Address"].map((head) => (
                    <th key={head} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`border-t border-slate-200 text-sm ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    <td className="px-3 py-2.5">{formatTime(entry.timestamp)}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{entry.user}</td>
                    <td className="px-3 py-2.5">{entry.action}</td>
                    <td className="px-3 py-2.5">{entry.module}</td>
                    <td className="px-3 py-2.5">{entry.target}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityClass(entry.severity)}`}>
                        {entry.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{entry.ipAddress}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                      No events found for this search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </UniformSectionCard>
      </div>
    </UniformPageShell>
  );
}
