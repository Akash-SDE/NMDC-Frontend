import { useMemo, useState } from "react";
import {
  UniformFormField,
  UniformPageShell,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import SearchBar from "../../../components/shared/SearchBar";

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
  status: "active",
};

const userTabs = [
  { id: "form", label: "User Form" },
  { id: "table", label: "User Table" },
];

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

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, hint, tone }) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-800">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p>
    </article>
  );
}

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = `${user.fullName} ${user.username} ${user.email}`.toLowerCase();
      const searchMatches = searchValue.includes(searchTerm.toLowerCase());
      return searchMatches;
    });
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    const activeCount = users.filter((user) => user.status === "active").length;
    const inactiveCount = users.length - activeCount;
    const operatorCount = users.filter((user) => user.role === "Operator").length;
    return {
      total: users.length,
      active: activeCount,
      inactive: inactiveCount,
      operators: operatorCount,
    };
  }, [users]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  }

  function resetForm(shouldClearMessage = true) {
    setForm(emptyForm);
    setEditingId(null);
    if (shouldClearMessage) {
      setMessage("");
    }
  }

  function validateForm() {
    if (form.fullName.trim().length < 2) return "Full name must be at least 2 characters.";
    if (!/^[a-z0-9.]+$/i.test(form.username.trim())) {
      return "Username must be alphanumeric (dot allowed).";
    }
    if (!editingId && form.password.trim().length < 8) {
      return "Password must be at least 8 characters for new users.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    const duplicate = users.find(
      (user) => user.username.toLowerCase() === form.username.trim().toLowerCase() && user.id !== editingId,
    );
    if (duplicate) {
      return "Username already exists. Please choose another username.";
    }

    return "";
  }

  function handleSave(event) {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setMessage(error);
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
                status: form.status,
              }
            : user,
        ),
      );
      setMessage("User updated successfully.");
      setActiveTab("table");
      return;
    }

    const nextId = `USR-${1000 + users.length + 1}`;
    setUsers((prev) => [
      {
        id: nextId,
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        createdDate: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setMessage("User created successfully.");
    resetForm(false);
    setActiveTab("table");
  }

  function handleEdit(user) {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      username: user.username,
      password: "",
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setMessage(`Editing ${user.fullName}`);
    setActiveTab("form");
  }

  function toggleStatus(userId) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user,
      ),
    );
    setMessage("User status updated.");
  }

  return (
    <UniformPageShell
      title="Manage Users"
      subtitle="Admin control room for account creation, role assignment, and secure access states."
      tabs={userTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Accounts"
            value={stats.total}
            hint="All users in this workspace"
            tone="border-slate-200 bg-white"
          />
          <StatCard
            title="Active Users"
            value={stats.active}
            hint="Can login and operate"
            tone="border-emerald-200 bg-emerald-50"
          />
          <StatCard
            title="Inactive Users"
            value={stats.inactive}
            hint="Temporarily disabled"
            tone="border-amber-200 bg-amber-50"
          />
          <StatCard
            title="Operators"
            value={stats.operators}
            hint="Operational workforce"
            tone="border-blue-200 bg-blue-50"
          />
        </div>

        {activeTab === "form" ? (
          <UniformSectionCard
            title={editingId ? "Edit User" : "Create User"}
            subtitle="Minimum validations follow your workflow: name, unique username, password, email, role, and status."
          >
            {message ? (
              <p className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                {message}
              </p>
            ) : null}

            <form onSubmit={handleSave} className="space-y-3">
              <UniformFormField label="Full Name">
                <input
                  className={uniformInputClass}
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Enter full name"
                />
              </UniformFormField>

              <UniformFormField label="Username">
                <input
                  className={uniformInputClass}
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                  placeholder="Unique username"
                />
              </UniformFormField>

              <UniformFormField label={editingId ? "Password (optional)" : "Password"}>
                <input
                  type="password"
                  className={uniformInputClass}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder={editingId ? "Leave blank to keep unchanged" : "Minimum 8 characters"}
                />
              </UniformFormField>

              <UniformFormField label="Email">
                <input
                  type="email"
                  className={uniformInputClass}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="user@nmdc.local"
                />
              </UniformFormField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <UniformFormField label="Role">
                  <select
                    className={uniformInputClass}
                    value={form.role}
                    onChange={(event) => updateField("role", event.target.value)}
                  >
                    <option>Admin</option>
                    <option>Operator</option>
                    <option>Viewer</option>
                  </select>
                </UniformFormField>

                <UniformFormField label="Status">
                  <select
                    className={uniformInputClass}
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </UniformFormField>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button type="button" className={uniformSecondaryButtonClass} onClick={resetForm}>
                  Reset
                </button>
                <button type="submit" className={uniformPrimaryButtonClass}>
                  {editingId ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </UniformSectionCard>
        ) : null}

        {activeTab === "table" ? (
          <UniformSectionCard
            title="User Directory"
            subtitle="Search users and manage edit plus enable or disable actions."
          >
            <SearchBar
              placeholder="Search name, username, or email"
              value={searchTerm}
              onChange={setSearchTerm}
              showFilter={false}
            />

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-190">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    {["Full Name", "Username", "Role", "Status", "Created Date", "Actions"].map((head) => (
                      <th key={head} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-t border-slate-200 text-sm ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} ${user.status === "inactive" ? "opacity-60" : ""}`}
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-blue-700">{user.username}</td>
                      <td className="px-3 py-2.5">{user.role}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">{formatDate(user.createdDate)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(user.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              user.status === "active"
                                ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            title={user.status === "active" ? "Disable" : "Enable"}
                          >
                            {user.status === "active" ? <DisableIcon /> : <EnableIcon />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                        No users found for this search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </UniformSectionCard>
        ) : null}
      </div>
    </UniformPageShell>
  );
}
