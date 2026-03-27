import { useState } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { STATUS_COLORS } from "../shared/superadminData";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";

function UserTable({ users, onEdit, onDelete }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const pageSize = 10;

  const getComparableValue = (user, field) => {
    const value = user[field];
    if (field === "createdOn" && typeof value === "string") {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return typeof value === "string" ? value.toLowerCase() : (value ?? "");
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = getComparableValue(a, sortBy);
    const bValue = getComparableValue(b, sortBy);
    if (aValue === bValue) return 0;
    const comparison = aValue > bValue ? 1 : -1;
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.inactive;
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === paginatedUsers.length &&
                    paginatedUsers.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="User" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Role" field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Created On" field="createdOn" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.avatar}
                    </div>
                    <span className="font-medium text-slate-900">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {user.email}
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-blue-600">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {user.createdOn}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit?.(user)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete?.(user)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Page Size:</span>
          <select className="px-2 py-1 border border-slate-300 rounded-lg text-sm focus:ring-blue-200 focus:border-blue-500">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, sortedUsers.length)} of{" "}
            {sortedUsers.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserTable;
