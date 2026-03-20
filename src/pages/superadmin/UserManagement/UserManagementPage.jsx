import { useState } from "react";
import { Users, CheckCircle, Clock, Search, UserPlus } from "lucide-react";
import { useRouter } from "./../../../context/RouterContext";
import { MOCK_USERS } from "../shared/superadminData";
import UserTable from "./UserTable";
import Breadcrumb from "../shared/Breadcrumb";

function UserManagementPage() {
  const { navigate } = useRouter();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;

  const handleEdit = (user) => {
    navigate("sa-edit-user", { user });
  };
  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  return (
    <div>
      <Breadcrumb />
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">
          Manage user accounts and role assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-3xl font-bold mt-1 text-slate-700">
              {users.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
            <Users className="text-2xl text-slate-700" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Users
            </p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {activeUsers}
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-2xl text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Invites
            </p>
            <p className="text-3xl font-bold mt-1 text-yellow-600">
              {pendingUsers}
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
            <Clock className="text-2xl text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Add User Button */}
        <button
          onClick={() => navigate("sa-add-user")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
        >
          <UserPlus className="text-lg" />
          Add User
        </button>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default UserManagementPage;
