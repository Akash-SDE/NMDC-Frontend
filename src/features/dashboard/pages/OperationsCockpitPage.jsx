import OperationsCockpitDashboard from "../../../pages/admin/dashboard/operations-cockpit/OperationsCockpitDashboard";

/** Full-viewport cockpit: shell layout uses compact breadcrumb + non-scrolling main (see Layout.jsx). */
export default function OperationsCockpitPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <OperationsCockpitDashboard />
    </div>
  );
}
