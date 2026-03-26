import { useMemo, useState } from "react";
import {
  UniformPageShell,
  UniformSectionCard,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";

const reportTabs = [
  { id: "daily", label: "Daily Dispatch" },
  { id: "monthly", label: "Monthly Summary" },
  { id: "customer", label: "Customer Dispatch" },
  { id: "delay", label: "Delay Analysis" },
  { id: "wagon", label: "Wagon Utilization" },
];

const dailyRows = [
  {
    date: "2026-03-23",
    rakeNumber: "RK-7729",
    customer: "JSW Steel",
    destination: "Vizag",
    oreType: "Fines",
    wagonCount: 58,
    totalTonnage: 3450,
    loadingDuration: "03h 42m",
    delayDuration: "00h 20m",
    status: "Completed",
    siding: "Siding-A",
  },
  {
    date: "2026-03-23",
    rakeNumber: "RK-8812",
    customer: "Tata Steel",
    destination: "Bhilai",
    oreType: "Lumps",
    wagonCount: 45,
    totalTonnage: 2780,
    loadingDuration: "02h 51m",
    delayDuration: "00h 00m",
    status: "Dispatched",
    siding: "Siding-C",
  },
  {
    date: "2026-03-24",
    rakeNumber: "RK-9003",
    customer: "SAIL",
    destination: "Raipur",
    oreType: "ROM",
    wagonCount: 59,
    totalTonnage: 3520,
    loadingDuration: "04h 05m",
    delayDuration: "00h 35m",
    status: "Completed",
    siding: "Siding-D",
  },
];

const monthlyRows = [
  { date: "2026-03-01", totalRakes: 11, totalTonnage: 28600, avgLoadingTime: "03h 28m", totalDelays: "08h 10m" },
  { date: "2026-03-02", totalRakes: 9, totalTonnage: 24150, avgLoadingTime: "03h 41m", totalDelays: "06h 35m" },
  { date: "2026-03-03", totalRakes: 13, totalTonnage: 33440, avgLoadingTime: "03h 17m", totalDelays: "04h 15m" },
];

const customerRows = [
  { customer: "JSW Steel", noOfRakes: 16, totalTonnage: 42500, avgTonnagePerRake: 2656 },
  { customer: "Tata Steel", noOfRakes: 12, totalTonnage: 31440, avgTonnagePerRake: 2620 },
  { customer: "SAIL", noOfRakes: 10, totalTonnage: 28110, avgTonnagePerRake: 2811 },
  { customer: "Welspun", noOfRakes: 8, totalTonnage: 21840, avgTonnagePerRake: 2730 },
];

const delayRows = [
  { category: "Mechanical", occurrenceCount: 18, totalDelayDuration: "14h 20m", avgDelayDuration: "00h 47m", percentageShare: "31%" },
  { category: "Railway Delay", occurrenceCount: 11, totalDelayDuration: "10h 05m", avgDelayDuration: "00h 55m", percentageShare: "22%" },
  { category: "Power Failure", occurrenceCount: 8, totalDelayDuration: "07h 30m", avgDelayDuration: "00h 56m", percentageShare: "16%" },
  { category: "Labor Delay", occurrenceCount: 6, totalDelayDuration: "05h 10m", avgDelayDuration: "00h 51m", percentageShare: "11%" },
];

const wagonRows = [
  { wagonType: "BOXN", totalWagonsUsed: 582, avgLoadPerWagon: "58.7t", sickWagonsCount: 6 },
  { wagonType: "NS", totalWagonsUsed: 440, avgLoadPerWagon: "57.8t", sickWagonsCount: 4 },
  { wagonType: "MIX", totalWagonsUsed: 231, avgLoadPerWagon: "58.2t", sickWagonsCount: 2 },
];

function SummaryCard({ title, value, tone }) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-800">{value}</p>
    </article>
  );
}

function getStatusClass(status) {
  if (status === "Dispatched") return "bg-slate-200 text-slate-700";
  if (status === "Completed") return "bg-blue-100 text-blue-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const [searchValue, setSearchValue] = useState("");

  const tableData = useMemo(() => {
    let source = wagonRows;

    if (activeTab === "daily") source = dailyRows;
    if (activeTab === "monthly") source = monthlyRows;
    if (activeTab === "customer") source = customerRows;
    if (activeTab === "delay") source = delayRows;

    if (!searchValue.trim()) return source;

    const query = searchValue.toLowerCase();
    return source.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [activeTab, searchValue]);

  const summary = useMemo(() => {
    if (activeTab === "daily") {
      const totalTonnage = tableData.reduce((sum, row) => sum + row.totalTonnage, 0);
      return [
        { title: "Rows", value: tableData.length, tone: "border-slate-200 bg-white" },
        {
          title: "Tonnage",
          value: `${totalTonnage.toLocaleString("en-IN")} t`,
          tone: "border-blue-200 bg-blue-50",
        },
        { title: "Completed", value: tableData.filter((row) => row.status === "Completed").length, tone: "border-emerald-200 bg-emerald-50" },
      ];
    }

    if (activeTab === "monthly") {
      return [
        { title: "Days", value: tableData.length, tone: "border-slate-200 bg-white" },
        {
          title: "Total Rakes",
          value: tableData.reduce((sum, row) => sum + row.totalRakes, 0),
          tone: "border-blue-200 bg-blue-50",
        },
        {
          title: "Total Tonnage",
          value: `${tableData.reduce((sum, row) => sum + row.totalTonnage, 0).toLocaleString("en-IN")} t`,
          tone: "border-emerald-200 bg-emerald-50",
        },
      ];
    }

    return [
      { title: "Rows", value: tableData.length, tone: "border-slate-200 bg-white" },
      { title: "View", value: "Live", tone: "border-blue-200 bg-blue-50" },
      { title: "Search", value: "Enabled", tone: "border-emerald-200 bg-emerald-50" },
    ];
  }, [activeTab, tableData]);

  const columns =
    activeTab === "daily"
      ? ["Date", "Rake Number", "Customer", "Destination", "Ore Type", "Wagon Count", "Total Tonnage", "Loading Duration", "Delay Duration", "Status"]
      : activeTab === "monthly"
        ? ["Date", "Total Rakes", "Total Tonnage", "Avg Loading Time", "Total Delays"]
        : activeTab === "customer"
          ? ["Customer", "No. of Rakes", "Total Tonnage", "Avg Tonnage per Rake"]
          : activeTab === "delay"
            ? ["Delay Category", "Occurrence Count", "Total Delay Duration", "Avg Delay Duration", "Percentage Share"]
            : ["Wagon Type", "Total Wagons Used", "Avg Load per Wagon", "Sick Wagons Count"];

  return (
    <UniformPageShell
      title="Reports Control Center"
      subtitle="Premium analytics workspace for daily dispatch, monthly summary, customer shipment, delay analysis, and wagon utilization."
      tabs={reportTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {summary.map((item) => (
            <SummaryCard key={item.title} title={item.title} value={item.value} tone={item.tone} />
          ))}
        </div>

        <UniformSectionCard
          title="Report Preview"
          subtitle={`Showing ${columns.length} columns with ${tableData.length} records.`}
        >
          <SearchBar
            placeholder="Search current report data"
            value={searchValue}
            onChange={setSearchValue}
            showFilter={false}
          />

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-230">
              <thead>
                <tr className="bg-slate-700 text-white">
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={`${activeTab}-${index}`}
                    className={`border-t border-slate-200 text-sm ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    {activeTab === "daily" ? (
                      <>
                        <td className="px-3 py-2.5">{row.date}</td>
                        <td className="px-3 py-2.5 font-semibold text-blue-700">{row.rakeNumber}</td>
                        <td className="px-3 py-2.5">{row.customer}</td>
                        <td className="px-3 py-2.5">{row.destination}</td>
                        <td className="px-3 py-2.5">{row.oreType}</td>
                        <td className="px-3 py-2.5">{row.wagonCount}</td>
                        <td className="px-3 py-2.5">{row.totalTonnage}</td>
                        <td className="px-3 py-2.5">{row.loadingDuration}</td>
                        <td className="px-3 py-2.5">{row.delayDuration}</td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    ) : null}

                    {activeTab === "monthly" ? (
                      <>
                        <td className="px-3 py-2.5">{row.date}</td>
                        <td className="px-3 py-2.5">{row.totalRakes}</td>
                        <td className="px-3 py-2.5">{row.totalTonnage}</td>
                        <td className="px-3 py-2.5">{row.avgLoadingTime}</td>
                        <td className="px-3 py-2.5">{row.totalDelays}</td>
                      </>
                    ) : null}

                    {activeTab === "customer" ? (
                      <>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{row.customer}</td>
                        <td className="px-3 py-2.5">{row.noOfRakes}</td>
                        <td className="px-3 py-2.5">{row.totalTonnage}</td>
                        <td className="px-3 py-2.5">{row.avgTonnagePerRake}</td>
                      </>
                    ) : null}

                    {activeTab === "delay" ? (
                      <>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{row.category}</td>
                        <td className="px-3 py-2.5">{row.occurrenceCount}</td>
                        <td className="px-3 py-2.5">{row.totalDelayDuration}</td>
                        <td className="px-3 py-2.5">{row.avgDelayDuration}</td>
                        <td className="px-3 py-2.5">{row.percentageShare}</td>
                      </>
                    ) : null}

                    {activeTab === "wagon" ? (
                      <>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{row.wagonType}</td>
                        <td className="px-3 py-2.5">{row.totalWagonsUsed}</td>
                        <td className="px-3 py-2.5">{row.avgLoadPerWagon}</td>
                        <td className="px-3 py-2.5">{row.sickWagonsCount}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-slate-500">
                      No report rows match this search.
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
