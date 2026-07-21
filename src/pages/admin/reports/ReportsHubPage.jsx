import { useMemo, useState } from "react";
import { useRouter } from "../../../context/RouterContext";
import { ReportsIcon } from "../../../components/icons";
import { REPORTS, REPORT_CATEGORIES, getCategoryLabel, getDataSourceLabel } from "./reportRegistry";

const categoryTone = {
  operations: "bg-blue-50 text-blue-700 border-blue-100",
  performance: "bg-emerald-50 text-emerald-700 border-emerald-100",
  compliance: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function ReportsHubPage() {
  const { navigate } = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return REPORTS.filter((report) => {
      const matchesCategory = category === "all" || report.category === category;
      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        report.config.title,
        report.config.subtitle,
        getCategoryLabel(report.category),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, category]);

  return (
    <div className="space-y-6 3xl:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">Reports</h2>
          <p className="mt-1 max-w-2xl text-[14px] text-slate-500">
            Choose a report type, apply filters, and export results. All operational, performance,
            and compliance reports are available from one place.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          <ReportsIcon size={18} className="text-blue-600" />
          {REPORTS.length} report types
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports by name or purpose…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-4 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {REPORT_CATEGORIES.map((item) => {
              const isActive = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ReportsIcon size={18} />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    categoryTone[report.category] ?? "bg-slate-50 text-slate-600 border-slate-100"
                  }`}
                >
                  {getCategoryLabel(report.category)}
                </span>
              </div>

              <h3 className="text-[17px] font-bold text-slate-800">{report.config.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-500">
                {report.config.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                <span className="rounded-md bg-slate-50 px-2 py-1">
                  {report.config.columns.length} columns
                </span>
                <span className="rounded-md bg-slate-50 px-2 py-1">
                  {report.config.filters.length} filters
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                  {getDataSourceLabel(report.dataSource)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(report.legacyRouteId)}
                className="mt-5 w-full rounded-lg bg-linear-to-r from-blue-700 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-800 hover:to-blue-700"
              >
                Open Report
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-slate-700">No reports match your search</p>
          <p className="mt-1 text-[13px] text-slate-500">Try a different keyword or category.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
            className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
