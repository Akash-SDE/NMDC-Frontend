import { Shield, CheckCircle, LockOpen } from "lucide-react";

function RoleStatsCards({ totalRoles, activeRoles, totalPrivileges }) {
  const stats = [
    {
      label: "Total Roles",
      value: totalRoles,
      icon: Shield,
      color: "text-slate-700",
    },
    {
      label: "Active Roles",
      value: activeRoles,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Total Privileges",
      value: totalPrivileges,
      icon: LockOpen,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
            <stat.icon size={20} className={stat.color} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoleStatsCards;
