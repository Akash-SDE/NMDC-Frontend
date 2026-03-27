import { useState } from "react";
import {
  Pencil,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";

function RoleTable({ roles, onEdit, onDelete, onViewPrivileges }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const pageSize = 10;

  const getComparableValue = (role, field) => {
    const value = role[field];
    if (field.includes("On") && typeof value === "string") {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return typeof value === "string" ? value.toLowerCase() : (value ?? "");
  };

  const sortedRoles = [...roles].sort((a, b) => {
    const aValue = getComparableValue(a, sortBy);
    const bValue = getComparableValue(b, sortBy);
    if (aValue === bValue) return 0;
    const comparison = aValue > bValue ? 1 : -1;
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedRoles.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRoles = sortedRoles.slice(startIndex, startIndex + pageSize);

  const toggleSelectAll = () => {
    if (selectedRoles.length === paginatedRoles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(paginatedRoles.map((r) => r.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedRoles((prev) =>
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
                    selectedRoles.length === paginatedRoles.length &&
                    paginatedRoles.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Role Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Role Description" field="description" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Privileges
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Created By" field="createdBy" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Created On" field="createdOn" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Modified By" field="modifiedBy" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <SortHeaderButton label="Modified On" field="modifiedOn" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRoles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleSelect(role.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-600" />
                    <span className="font-medium text-blue-600">
                      {role.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">
                  {role.description}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onViewPrivileges?.(role)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View privileges
                  </button>
                </td>
                <td className="px-4 py-4">
                    <span className="text-sm text-blue-600">{role.createdBy}</span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {role.createdOn}
                </td>
                <td className="px-4 py-4">
                    <span className="text-sm text-blue-600">
                    {role.modifiedBy}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {role.modifiedOn}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit?.(role)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete?.(role)}
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
            {Math.min(startIndex + pageSize, sortedRoles.length)} of{" "}
            {sortedRoles.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="text-lg" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleTable;
