import Dashboard from "../../../pages/admin/dashboard/Dashboard";

/** Daily overview fills the app shell main area without page-level scroll (see Layout.jsx). */
export default function DashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Dashboard />
    </div>
  );
}
