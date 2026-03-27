import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  CheckCircle,
  UserX,
  ShieldCheck,
  Search,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import Modal from "../../../components/shared/Modal";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import {
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import { useRouter } from "../../../context/RouterContext";

const initialUsers = [
  {
    id: "USR-1001",
    fullName: "Harish Kumar",
    username: "harish.admin",
    email: "harish.admin@nmdc.local",
    role: "Admin",
    status: "active",
    createdDate: "2026-01-11",
  },
  {
    id: "USR-1002",
    fullName: "Amit Singh",
    username: "amit.operator",
    email: "amit.operator@nmdc.local",
    role: "Operator",
    status: "active",
    createdDate: "2026-01-18",
  },
  {
    id: "USR-1003",
    fullName: "Neha Sharma",
    username: "neha.viewer",
    email: "neha.viewer@nmdc.local",
    role: "Viewer",
    status: "inactive",
    createdDate: "2026-02-03",
  },
  {
    id: "USR-1004",
    fullName: "Rohan Das",
    username: "rohan.operator",
    email: "rohan.operator@nmdc.local",
    role: "Operator",
    status: "active",
    createdDate: "2026-02-16",
  },
];

const emptyForm = {
  fullName: "",
  username: "",
  password: "",
  email: "",
  role: "Operator",
};

const roleOptions = ["Admin", "Operator", "Viewer"];

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DisableIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <line x1="12" y1="11" x2="12" y2="7" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EnableIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <polyline points="8 16 11 19 16 14" />
    </svg>
  );
}

function StatCard({ title, value, icon, valueTone = "text-slate-700" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${valueTone}`}>{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${uniformInputClass} flex items-center justify-between text-left`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {roleOptions.map((option) => {
              const isSelected = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-sm transition-colors last:border-b-0 ${
                    isSelected
                      ? "bg-slate-100 font-semibold text-slate-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span>{option}</span>
                  {isSelected ? <Check size={15} className="text-blue-600" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUserManagementPage() {
  const { navigate, currentRoute } = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("fullName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [statusConfirmUserId, setStatusConfirmUserId] = useState(null);
  const pageSize = 8;
  const addRoute = "admin-users-add";
  const baseRoute = "admin-users";
  const isAddPage = currentRoute === addRoute;

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();

    return users.filter((user) =>
      `${user.fullName} ${user.username} ${user.email} ${user.role}`
        .toLowerCase()
        .includes(q),
    );
  }, [searchQuery, users]);

  const sortedUsers = useMemo(() => {
    const getComparableValue = (user, field) => {
      if (field === "createdDate") {
        const parsed = Date.parse(user.createdDate);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return String(user[field] ?? "").toLowerCase();
    };

    return [...filteredUsers].sort((a, b) => {
      const aValue = getComparableValue(a, sortBy);
      const bValue = getComparableValue(b, sortBy);
      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (isAddPage) {
      setForm(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
    }
  }, [isAddPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  const statusConfirmUser = useMemo(
    () => users.find((user) => user.id === statusConfirmUserId),
    [statusConfirmUserId, users],
  );

  const stats = useMemo(() => {
    const active = users.filter((user) => user.status === "active").length;
    const inactive = users.length - active;
    const admins = users.filter((user) => user.role === "Admin").length;

    return {
      total: users.length,
      active,
      inactive,
      admins,
    };
  }, [users]);

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function openEditForm(user) {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      username: user.username,
      password: "",
      email: user.email,
      role: user.role,
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    resetForm();
  }

  function validateForm() {
    if (form.fullName.trim().length < 2) return "Full name must be at least 2 characters.";
    if (editingId && !/^[a-z0-9.]+$/i.test(form.username.trim())) {
      return "Username must be alphanumeric (dot allowed).";
    }
    if (!editingId && form.password.trim().length < 8) {
      return "Password must be at least 8 characters for new users.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (editingId) {
      const duplicate = users.find(
        (user) =>
          user.username.toLowerCase() === form.username.trim().toLowerCase() &&
          user.id !== editingId,
      );

      if (duplicate) {
        return "Username already exists. Please choose another username.";
      }
    }

    return "";
  }

  function generateUniqueUsername() {
    const emailPrefix = form.email.split("@")[0] || "";
    const fullNameBase = form.fullName.trim().toLowerCase().replace(/\s+/g, ".");
    let base = (emailPrefix || fullNameBase || "user")
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "")
      .replace(/\.{2,}/g, ".")
      .replace(/^\.|\.$/g, "");

    if (!base) {
      base = "user";
    }

    let candidate = base;
    let suffix = 1;

    while (users.some((user) => user.username.toLowerCase() === candidate.toLowerCase())) {
      candidate = `${base}.${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  function handleSave(event) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    if (editingId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingId
            ? {
                ...user,
                fullName: form.fullName.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                role: form.role,
              }
            : user,
        ),
      );
      setMessage("User updated successfully.");
      closeForm();
      return;
    } else {
      const nextId = `USR-${1000 + users.length + 1}`;
      const generatedUsername = generateUniqueUsername();
      setUsers((prev) => [
        {
          id: nextId,
          fullName: form.fullName.trim(),
          username: generatedUsername,
          email: form.email.trim(),
          role: form.role,
          status: "active",
          createdDate: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      setMessage("User created successfully.");
      setCurrentPage(1);
      setForm(emptyForm);
      navigate(baseRoute);
      return;
    }
  }

  function requestStatusToggle(userId) {
    setStatusConfirmUserId(userId);
  }

  function closeStatusDialog() {
    setStatusConfirmUserId(null);
  }

  function confirmStatusToggle() {
    if (!statusConfirmUserId) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === statusConfirmUserId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user,
      ),
    );

    setMessage("User status updated successfully.");
    setStatusConfirmUserId(null);
  }

  if (isAddPage) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add User</h1>
            <p className="mt-1 text-slate-500">Create a new user account with role assignment.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(baseRoute)}
            className={uniformSecondaryButtonClass}
          >
            Back to User Management
          </button>
        </div>

        {message ? (
          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            {message}
          </p>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Enter full name"
                  className={uniformInputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Role</label>
                <RoleDropdown value={form.role} onChange={(value) => updateField("role", value)} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="user@nmdc.local"
                  className={uniformInputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Minimum 8 characters"
                  className={uniformInputClass}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => navigate(baseRoute)} className={uniformSecondaryButtonClass}>
                Cancel
              </button>
              <button type="submit" className={uniformPrimaryButtonClass}>
                Save User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-slate-500">Manage user accounts and role assignments</p>
      </div>

      {message ? (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.total} icon={<Users size={20} />} />
        <StatCard
          title="Active Users"
          value={stats.active}
          icon={<CheckCircle size={20} className="text-emerald-600" />}
          valueTone="text-emerald-600"
        />
        <StatCard
          title="Inactive Users"
          value={stats.inactive}
          icon={<UserX size={20} className="text-amber-600" />}
          valueTone="text-amber-600"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={<ShieldCheck size={20} className="text-blue-600" />}
          valueTone="text-blue-600"
        />
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate(addRoute)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-230">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <SortHeaderButton label="User" field="fullName" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <SortHeaderButton label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <SortHeaderButton label="Role" field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <SortHeaderButton label="Created On" field="createdDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No users found for this search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{user.fullName}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-4 py-4 text-sm font-medium text-blue-600">{user.role}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDate(user.createdDate)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(user)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestStatusToggle(user.id)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            user.status === "active"
                              ? "text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                              : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                          title={user.status === "active" ? "Disable" : "Enable"}
                        >
                          {user.status === "active" ? <DisableIcon /> : <EnableIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {sortedUsers.length === 0
              ? "0 records"
              : `${startIndex + 1} to ${Math.min(startIndex + pageSize, sortedUsers.length)} of ${sortedUsers.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit User" : "Add User"}
        subtitle={editingId ? "Update account details and permissions." : "Create a new account with role and access state."}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Full Name</label>
              <input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Enter full name"
                className={uniformInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Username</label>
              <input
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="Unique username"
                className={uniformInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="user@nmdc.local"
                className={uniformInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                {editingId ? "Password (Optional)" : "Password"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder={editingId ? "Leave blank to keep unchanged" : "Minimum 8 characters"}
                className={uniformInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Role</label>
              <RoleDropdown value={form.role} onChange={(value) => updateField("role", value)} />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={closeForm} className={uniformSecondaryButtonClass}>
              Cancel
            </button>
            <button type="submit" className={uniformPrimaryButtonClass}>
              {editingId ? "Update User" : "Save User"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(statusConfirmUser)}
        onClose={closeStatusDialog}
        onConfirm={confirmStatusToggle}
        title={statusConfirmUser?.status === "active" ? "Disable User" : "Enable User"}
        message={
          statusConfirmUser?.status === "active"
            ? "Are you sure you want to disable this user account?"
            : "Are you sure you want to enable this user account?"
        }
        itemName={statusConfirmUser?.fullName || ""}
        confirmLabel={statusConfirmUser?.status === "active" ? "Disable" : "Enable"}
        variant={statusConfirmUser?.status === "active" ? "danger" : "warning"}
      />
    </div>
  );
}
