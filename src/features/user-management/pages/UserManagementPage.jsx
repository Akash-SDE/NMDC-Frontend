import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchUsers, createUser, updateUser } from "../../../services/userManagementService";
import { fetchRoles } from "../../../services/roleService";
import { UsersIcon, PlusIcon, EditIcon } from "../../../components/icons";
import Modal from "../../../components/shared/Modal";
import SearchBar from "../../../components/shared/SearchBar";
import Pagination from "../../../components/shared/Pagination";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import {
  uniformInputClass,
  UniformFormField,
} from "../../../components/shared/UniformUi";

const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getInitials(first, last) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

/* ─────────────────────────────────────────────────────────────────
   Small reusable UI pieces
───────────────────────────────────────────────────────────────── */
function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Inactive
    </span>
  );
}

function SuperuserBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
      ★ Superuser
    </span>
  );
}

function RoleChips({ roles }) {
  if (!roles || roles.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => (
        <span key={r.id ?? r} className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          {r.role_name ?? r}
        </span>
      ))}
    </div>
  );
}

function FilterTab({ label, count, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all ${
        active ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function SkeletonRows({ cols }) {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="border-b border-slate-100">
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} className="px-5 py-4">
          <div className="h-3.5 animate-pulse rounded-full bg-slate-200" style={{ width: `${50 + ((j * 19 + i * 13) % 45)}%` }} />
        </td>
      ))}
    </tr>
  ));
}

function EmptyState({ search, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <UsersIcon size={36} className="mx-auto mb-3 text-slate-300" />
        <p className="text-[14px] font-semibold text-slate-500">
          {search ? "No users match your search" : "No users found"}
        </p>
        <p className="mt-1 text-[12px] text-slate-400">
          {search ? "Try adjusting the search or filters." : "Create a user with the button above to get started."}
        </p>
      </td>
    </tr>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] font-medium text-red-600">{msg}</p>;
}

/* ─────────────────────────────────────────────────────────────────
   Eye toggle
───────────────────────────────────────────────────────────────── */
function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" tabIndex={-1} onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Shared User Form Modal  (mode = "create" | "edit")
───────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  organisation_name: "",
  role: "",
  status: true,
};

function UserFormModal({ isOpen, onClose, onSuccess, roles, rolesLoading, editUser }) {
  const isEdit = Boolean(editUser);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const firstFieldRef = useRef(null);

  /* populate / reset when modal opens */
  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setServerError("");
    setShowPassword(false);
    setShowConfirm(false);

    if (isEdit && editUser) {
      /* pre-fill with existing user data; password left blank */
      setForm({
        first_name: editUser.first_name ?? "",
        last_name: editUser.last_name ?? "",
        email: editUser.email ?? "",
        password: "",
        confirm_password: "",
        organisation_name: editUser.organisation_name ?? "",
        role: editUser.role_data?.[0]?.id
          ? String(editUser.role_data[0].id)
          : editUser.role
            ? String(editUser.role)
            : "",
        status: editUser.status ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setTimeout(() => firstFieldRef.current?.focus(), 80);
  }, [isOpen, isEdit, editUser]);

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setFieldErrors((p) => ({ ...p, [field]: "" }));
    setServerError("");
  }

  function validate() {
    const errs = {};

    if (!form.first_name.trim()) errs.first_name = "First name is required.";
    else if (form.first_name.length > 15) errs.first_name = "Max 15 characters.";

    if (form.last_name && form.last_name.length > 15) errs.last_name = "Max 15 characters.";

    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";

    /* password only required on create; on edit blank = unchanged */
    if (!isEdit) {
      if (!form.password) errs.password = "Password is required.";
      else if (form.password.length < 8) errs.password = "Minimum 8 characters.";
      if (!form.confirm_password) errs.confirm_password = "Please confirm your password.";
      else if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match.";
    } else {
      if (form.password && form.password.length < 8) errs.password = "Minimum 8 characters.";
      if (form.password && form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match.";
    }

    if (!form.role) errs.role = "Please select a role.";

    if (form.organisation_name && form.organisation_name.length > 15) errs.organisation_name = "Max 15 characters.";

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || undefined,
        email: form.email.trim(),
        role: Number(form.role),
        status: form.status,
        ...(form.organisation_name.trim() ? { organisation_name: form.organisation_name.trim() } : {}),
        /* include password only if provided */
        ...(form.password ? { password: form.password } : {}),
      };

      let result;
      if (isEdit) {
        result = await updateUser(editUser.id, payload);
      } else {
        result = await createUser(payload);
      }

      onSuccess(result, isEdit ? "edit" : "create");
      onClose();
    } catch (err) {
      setServerError(err?.message || `Failed to ${isEdit ? "update" : "create"} user. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Create New User"}
      subtitle={
        isEdit
          ? `Updating details for ${editUser?.first_name ?? ""} ${editUser?.last_name ?? ""}`.trim()
          : "Fill in the details below to add a new user to the system."
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* server error */}
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
            {serverError}
          </div>
        )}

        {/* Name row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UniformFormField label="First Name *">
            <input ref={firstFieldRef} type="text" value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)} maxLength={15} placeholder="e.g. Bikash"
              className={`${uniformInputClass} ${fieldErrors.first_name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            <FieldError msg={fieldErrors.first_name} />
          </UniformFormField>

          <UniformFormField label="Last Name">
            <input type="text" value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)} maxLength={15} placeholder="e.g. Nishank"
              className={`${uniformInputClass} ${fieldErrors.last_name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            <FieldError msg={fieldErrors.last_name} />
          </UniformFormField>
        </div>

        {/* Email */}
        <UniformFormField label="Email Address *">
          <input type="email" value={form.email}
            onChange={(e) => set("email", e.target.value)} placeholder="user@example.com"
            className={`${uniformInputClass} ${fieldErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
          />
          <FieldError msg={fieldErrors.email} />
        </UniformFormField>

        {/* Password row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UniformFormField label={isEdit ? "New Password" : "Password *"}>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={isEdit ? "Leave blank to keep unchanged" : "Min. 8 characters"}
                className={`${uniformInputClass} pr-9 ${fieldErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword((p) => !p)} />
            </div>
            <FieldError msg={fieldErrors.password} />
          </UniformFormField>

          <UniformFormField label={isEdit ? "Confirm New Password" : "Confirm Password *"}>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={form.confirm_password}
                onChange={(e) => set("confirm_password", e.target.value)}
                placeholder="Re-enter password"
                className={`${uniformInputClass} pr-9 ${fieldErrors.confirm_password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
            </div>
            <FieldError msg={fieldErrors.confirm_password} />
          </UniformFormField>
        </div>

        {/* Role + Organisation row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UniformFormField label="Role *">
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              disabled={rolesLoading}
              className={`${uniformInputClass} ${fieldErrors.role ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""} ${rolesLoading ? "opacity-60" : ""}`}
            >
              <option value="">{rolesLoading ? "Loading roles…" : "Select a role"}</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </select>
            <FieldError msg={fieldErrors.role} />
          </UniformFormField>

          <UniformFormField label="Organisation Name">
            <input type="text" value={form.organisation_name}
              onChange={(e) => set("organisation_name", e.target.value)} maxLength={15} placeholder="Optional"
              className={`${uniformInputClass} ${fieldErrors.organisation_name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            <FieldError msg={fieldErrors.organisation_name} />
          </UniformFormField>
        </div>

        {/* Status toggle */}
        <UniformFormField label="Status">
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => set("status", !form.status)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${form.status ? "bg-blue-600" : "bg-slate-300"}`}
              role="switch" aria-checked={form.status}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${form.status ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className={`text-[13px] font-semibold ${form.status ? "text-emerald-700" : "text-slate-500"}`}>
              {form.status ? "Active" : "Inactive"}
            </span>
          </div>
        </UniformFormField>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} disabled={submitting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-2 text-[13px] font-semibold text-white shadow-sm hover:from-blue-800 hover:to-blue-700 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              <>
                <EditIcon size={14} />
                Save Changes
              </>
            ) : (
              <>
                <PlusIcon size={14} />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────── */
export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_on");
  const [sortOrder, setSortOrder] = useState("desc");

  /* single modal for both create & edit */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create mode

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [toast, setToast] = useState("");

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter]);

  /* fetch users */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        page: currentPage,
        page_size: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter === "active" ? { status: true } : {}),
        ...(statusFilter === "inactive" ? { status: false } : {}),
      };
      const data = await fetchUsers(payload);
      setUsers(data.results ?? []);
      setTotalCount(data.count ?? 0);
      setTotalActive(data.total_is_active ?? 0);
      setTotalInactive(data.total_inactive ?? 0);
    } catch (err) {
      setError(err?.message || "Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  /* fetch roles when modal opens */
  useEffect(() => {
    if (!modalOpen) return;
    setRolesLoading(true);
    fetchRoles({ page: 1, page_size: 100 })
      .then((d) => setRoles(d.results ?? []))
      .catch(() => setRoles([]))
      .finally(() => setRolesLoading(false));
  }, [modalOpen]);

  /* open create */
  function openCreate() {
    setEditingUser(null);
    setModalOpen(true);
  }

  /* open edit */
  function openEdit(user) {
    setEditingUser(user);
    setModalOpen(true);
  }

  /* after create or edit */
  function handleSuccess(result, mode) {
    const name = `${result.first_name ?? ""} ${result.last_name ?? ""}`.trim();
    setToast(mode === "edit" ? `User "${name}" updated successfully.` : `User "${name}" created successfully.`);
    setTimeout(() => setToast(""), 4000);
    setCurrentPage(1);
    load();
  }

  /* sort */
  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      let av, bv;
      if (sortBy === "full_name") {
        av = `${a.first_name ?? ""} ${a.last_name ?? ""}`.toLowerCase();
        bv = `${b.first_name ?? ""} ${b.last_name ?? ""}`.toLowerCase();
      } else if (sortBy === "status") {
        av = a.status ? "1" : "0"; bv = b.status ? "1" : "0";
      } else {
        av = String(a[sortBy] ?? "").toLowerCase();
        bv = String(b[sortBy] ?? "").toLowerCase();
      }
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [users, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortOrder("asc"); }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const COL_COUNT = 9; // # + Name + Email + Phone + Roles + Status + Created + LastLogin + Actions

  return (
    <>
      <div className="space-y-6 animate-fadeIn">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <UsersIcon size={20} />
            </div>
            <div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">User Management</h2>
              <p className="text-[14px] text-slate-500">Manage system users, their profiles and access.</p>
            </div>
          </div>
          <button type="button" onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:from-blue-800 hover:to-blue-700 transition-all"
          >
            <PlusIcon size={14} />
            Create User
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Users", value: loading ? "—" : totalCount,    color: "text-slate-700",   bg: "bg-slate-50 border-slate-200"    },
            { label: "Active",      value: loading ? "—" : totalActive,   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Inactive",    value: loading ? "—" : totalInactive, color: "text-slate-500",   bg: "bg-slate-50 border-slate-200"    },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-1 text-[22px] font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-medium text-emerald-700">
            ✓ {toast}
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[13px] font-medium text-red-700">{error}</p>
            <button type="button" onClick={load}
              className="ml-4 shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Search + filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar placeholder="Search by name, email…" value={search} onChange={setSearch} showFilter={false} />
          </div>
          <div className="flex items-center gap-2">
            <FilterTab label="All"      count={totalCount}    active={statusFilter === "all"}      onClick={() => setStatusFilter("all")}      />
            <FilterTab label="Active"   count={totalActive}   active={statusFilter === "active"}   onClick={() => setStatusFilter("active")}   />
            <FilterTab label="Inactive" count={totalInactive} active={statusFilter === "inactive"} onClick={() => setStatusFilter("inactive")} />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="w-[52px] px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">#</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Name"       field="full_name"  sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Email"      field="email"      sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Phone</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Roles</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Status"     field="status"     sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Created On" field="created_on" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Last Login" field="last_login" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  {/* sticky actions column */}
                  <th className="sticky right-0 z-20 w-[80px] border-l border-slate-200/70 bg-slate-50 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <SkeletonRows cols={COL_COUNT} />
                ) : sorted.length === 0 ? (
                  <EmptyState search={debouncedSearch} colSpan={COL_COUNT} />
                ) : (
                  sorted.map((user, idx) => (
                    <tr key={user.id} className="group transition-colors hover:bg-blue-50/30">
                      <td className="px-5 py-4 text-[12px] font-medium text-slate-400">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(user.id)}`}>
                            {getInitials(user.first_name, user.last_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—"}
                            </p>
                            {user.is_superuser && <div className="mt-0.5"><SuperuserBadge /></div>}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline transition-colors">
                          {user.email || "—"}
                        </a>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.phone_number
                          ? `${user.country_code ? `+${user.country_code} ` : ""}${user.phone_number}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4"><RoleChips roles={user.role_data} /></td>

                      <td className="px-5 py-4"><StatusBadge active={user.status} /></td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(user.created_on)}</td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(user.last_login)}</td>

                      {/* sticky edit action */}
                      <td className="sticky right-0 z-10 w-[80px] border-l border-slate-200/70 bg-white px-4 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)] group-hover:bg-blue-50/30">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          title="Edit user"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <EditIcon size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && !error && totalCount > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── User Form Modal (create & edit) ── */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        roles={roles}
        rolesLoading={rolesLoading}
        editUser={editingUser}
      />
    </>
  );
}
