import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "./../../../context/RouterContext";
import { MOCK_ROLES, getTotalPrivilegeCount } from "../shared/superadminData";
import RoleStatsCards from "./RoleStatsCards";
import RoleTable from "./RoleTable";
import {
  uniformInputClass,
  uniformPrimaryButtonClass,
} from "../../../components/shared/UniformUi";

function RoleManagementPage() {
  const { navigate } = useRouter();
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeRoles = roles.filter((r) => r.status === "active").length;
  const totalPrivileges = getTotalPrivilegeCount();

  const handleEdit = (role) => {
    navigate("sa-add-role", { role });
  };

  const handleDelete = (role) => {
    if (window.confirm(`Are you sure you want to delete ${role.name}?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    }
  };

  const handleViewPrivileges = (role) => {
    console.log("View privileges for:", role);
    // TODO: Show privileges modal
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Role Management</h1>
        <p className="text-slate-500 mt-1">
          Manage system roles, permissions, and access control
        </p>
      </div>

      {/* Stats Cards */}
      <RoleStatsCards
        totalRoles={roles.length}
        activeRoles={activeRoles}
        totalPrivileges={totalPrivileges}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${uniformInputClass} pl-10 pr-4`}
          />
        </div>

        {/* Add Role Button */}
        <button
          onClick={() => navigate("sa-add-role")}
          className={`${uniformPrimaryButtonClass} flex items-center gap-2`}
        >
          <Plus size={18} />
          Add Role
        </button>
      </div>

      {/* Role Table */}
      <RoleTable
        roles={filteredRoles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewPrivileges={handleViewPrivileges}
      />
    </div>
  );
}

export default RoleManagementPage;
