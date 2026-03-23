import { useState } from "react";
import {
  Pencil,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button type="button" onClick={() => handleSort("name")}>
                  Role Name {sortBy === "name" ? `(${sortOrder})` : ""}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button type="button" onClick={() => handleSort("description")}>
                  Role Description{" "}
                  {sortBy === "description" ? `(${sortOrder})` : ""}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Privileges
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button type="button" onClick={() => handleSort("createdBy")}>
                  Created By {sortBy === "createdBy" ? `(${sortOrder})` : ""}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button type="button" onClick={() => handleSort("createdOn")}>
                  Created On {sortBy === "createdOn" ? `(${sortOrder})` : ""}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button type="button" onClick={() => handleSort("modifiedBy")}>
                  Modified By {sortBy === "modifiedBy" ? `(${sortOrder})` : ""}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <button type="button" onClick={() => handleSort("modifiedOn")}>
                  Modified On {sortBy === "modifiedOn" ? `(${sortOrder})` : ""}
                </button>
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
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-primary text-lg" />
                    <span className="font-medium text-primary">
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
                    className="text-sm text-primary hover:text-primary-dark hover:underline"
                  >
                    View privileges
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-primary">{role.createdBy}</span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {role.createdOn}
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-primary">
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
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="text-lg" />
                    </button>
                    <button
                      onClick={() => onDelete?.(role)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="text-lg" />
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
          <select className="px-2 py-1 border border-slate-300 rounded-lg text-sm focus:ring-primary focus:border-primary">
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
