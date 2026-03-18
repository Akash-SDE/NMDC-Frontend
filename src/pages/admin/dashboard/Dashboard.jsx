import Greeting from "./Greeting";
import StatsGrid from "./StatsGrid";
import WeeklyChart from "./WeeklyChart";
import LiveFeed from "./LiveFeed";

export default function Dashboard() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10 3xl:px-14 3xl:py-10 5xl:px-20 5xl:py-14 space-y-6 3xl:space-y-8 5xl:space-y-12">
      {/* Greeting + Action Bar */}
      <Greeting />

      {/* Stats cards */}
      <StatsGrid />

      {/* Chart + Live Feed row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 3xl:gap-8 5xl:gap-12">
        <div className="xl:col-span-8">
          <WeeklyChart />
        </div>
        <div className="xl:col-span-4">
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
