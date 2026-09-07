import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchRoles, createRole, updateRole, fetchPrivileges } from "../../../services/roleService";
import { RolesIcon, PlusIcon, EditIcon } from "../../../components/icons";
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

/* ─────────────────────────────────────────────────────────────────
   Small reusable pieces
───────────────────────────────────────────────────────────────── */
function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] font-medium text-red-600">{msg}</p>;
}

function SkeletonRows({ cols }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-slate-100">
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} className="px-5 py-4">
          <div
            className="h-3.5 animate-pulse rounded-full bg-slate-200"
            style={{ width: `${60 + ((j * 17 + i * 11) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  ));
}

function EmptyState({ search, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <RolesIcon size={36} className="mx-auto mb-3 text-slate-300" />
        <p className="text-[14px] font-semibold text-slate-500">
          {search ? "No roles match your search" : "No roles found"}
        </p>
        <p className="mt-1 text-[12px] text-slate-400">
          {search
            ? "Try a different search term."
            : "Create a role with the button above to get started."}
        </p>
      </td>
    </tr>
  );
}

/* Privilege chips shown in the table (read-only) */
function PrivilegeChips({ names }) {
  if (!names || names.length === 0) return <span className="text-slate-400">—</span>;
  const visible = names.slice(0, 3);
  const rest = names.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((n) => (
        <span
          key={n}
          className="rounded-md border border-violet-100 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700"
        >
          {n}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          +{rest} more
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Privilege Selector  – grouped checkboxes loaded from API
───────────────────────────────────────────────────────────────── */
function PrivilegeSelector({ selected, onChange, modules, loadingPrivileges, privError }) {
  const [privSearch, setPrivSearch] = useState("");

  /* flat list of all privileges for "select all" logic */
  const allNames = useMemo(
    () => modules.flatMap((m) => m.privileges.map((p) => p.privilege_name)),
    [modules]
  );

  const allSelected = allNames.length > 0 && allNames.every((n) => selected.includes(n));
  const someSelected = !allSelected && allNames.some((n) => selected.includes(n));

  function toggleAll() {
    onChange(allSelected ? [] : [...allNames]);
  }

  function toggleOne(name) {
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name]
    );
  }

  /* filter visible modules/privileges by search */
  const filteredModules = useMemo(() => {
    if (!privSearch.trim()) return modules;
    const q = privSearch.toLowerCase();
    return modules
      .map((m) => ({
        ...m,
        privileges: m.privileges.filter(
          (p) =>
            p.privilege_name.toLowerCase().includes(q) ||
            (p.privilege_desc ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((m) => m.privileges.length > 0);
  }, [modules, privSearch]);

  if (loadingPrivileges) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
        <span className="text-[13px] text-slate-500">Loading privileges…</span>
      </div>
    );
  }

  if (privError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
        {privError}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
        No privileges available.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* search + select-all header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2.5">
        {/* select all checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={toggleAll}
            className={`
              flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer
              ${allSelected
                ? "border-blue-600 bg-blue-600"
                : someSelected
                  ? "border-blue-400 bg-blue-100"
                  : "border-slate-300 bg-white hover:border-blue-400"
              }
            `}
          >
            {allSelected ? (
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            ) : someSelected ? (
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
                <line x1="2" y1="6" x2="10" y2="6" />
              </svg>
            ) : null}
          </div>
          <span className="text-[12px] font-semibold text-slate-600">
            Select all ({allNames.length})
          </span>
        </label>

        {/* search inside privileges */}
        <div className="relative ml-auto flex-1 max-w-[200px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={privSearch}
            onChange={(e) => setPrivSearch(e.target.value)}
            placeholder="Search privileges…"
            className="h-7 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 text-[12px] font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </div>

        {/* selected count */}
        {selected.length > 0 && (
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
            {selected.length} selected
          </span>
        )}
      </div>

      {/* grouped list */}
      <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100
        [&::-webkit-scrollbar]:w-[4px]
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-slate-300
        [&::-webkit-scrollbar-track]:bg-transparent">
        {filteredModules.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-slate-400">No privileges match your search.</p>
        ) : (
          filteredModules.map((mod) => {
            const modNames = mod.privileges.map((p) => p.privilege_name);
            const modAllSelected = modNames.every((n) => selected.includes(n));
            const modSomeSelected = !modAllSelected && modNames.some((n) => selected.includes(n));

            function toggleModule() {
              if (modAllSelected) {
                onChange(selected.filter((n) => !modNames.includes(n)));
              } else {
                const next = new Set([...selected, ...modNames]);
                onChange([...next]);
              }
            }

            return (
              <div key={mod.module_id}>
                {/* module header */}
                <div
                  onClick={toggleModule}
                  className="flex cursor-pointer items-center gap-2.5 bg-slate-50/80 px-3 py-2 hover:bg-slate-100/60"
                >
                  <div
                    className={`
                      flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
                      ${modAllSelected
                        ? "border-blue-600 bg-blue-600"
                        : modSomeSelected
                          ? "border-blue-400 bg-blue-100"
                          : "border-slate-300 bg-white"
                      }
                    `}
                  >
                    {modAllSelected ? (
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    ) : modSomeSelected ? (
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="2" y1="6" x2="10" y2="6" />
                      </svg>
                    ) : null}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Module {mod.module_id}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-400">
                    {modNames.filter((n) => selected.includes(n)).length}/{modNames.length}
                  </span>
                </div>

                {/* individual privileges */}
                <div className="divide-y divide-slate-50">
                  {mod.privileges.map((priv) => {
                    const isChecked = selected.includes(priv.privilege_name);
                    return (
                      <label
                        key={priv.id}
                        className="flex cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors"
                      >
                        <div
                          onClick={() => toggleOne(priv.privilege_name)}
                          className={`
                            mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
                            ${isChecked
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white hover:border-blue-400"
                            }
                          `}
                        >
                          {isChecked && (
                            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1" onClick={() => toggleOne(priv.privilege_name)}>
                          <p className={`text-[13px] font-medium leading-snug ${isChecked ? "text-blue-700" : "text-slate-700"}`}>
                            {priv.privilege_name}
                          </p>
                          {priv.privilege_desc && (
                            <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">
                              {priv.privilege_desc}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Role Form Modal  (create | edit)
───────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  role_name: "",
  role_description: "",
  privilege_names: [],
};

function RoleFormModal({ isOpen, onClose, onSuccess, editRole }) {
  const isEdit = Boolean(editRole);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const firstFieldRef = useRef(null);

  /* privilege list from API */
  const [privModules, setPrivModules] = useState([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);
  const [privLoadError, setPrivLoadError] = useState("");

  /* populate / reset when modal opens */
  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setServerError("");

    if (isEdit && editRole) {
      setForm({
        role_name: editRole.role_name ?? "",
        role_description: editRole.role_description ?? "",
        privilege_names: Array.isArray(editRole.privilege_names)
          ? editRole.privilege_names
          : [],
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setTimeout(() => firstFieldRef.current?.focus(), 80);

    /* fetch privileges */
    setLoadingPrivileges(true);
    setPrivLoadError("");
    fetchPrivileges()
      .then((d) => setPrivModules(d.results ?? []))
      .catch((err) => setPrivLoadError(err?.message || "Failed to load privileges."))
      .finally(() => setLoadingPrivileges(false));
  }, [isOpen, isEdit, editRole]);

  function setField(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setFieldErrors((p) => ({ ...p, [field]: "" }));
    setServerError("");
  }

  function validate() {
    const errs = {};
    if (!form.role_name.trim()) errs.role_name = "Role name is required.";
    if (form.privilege_names.length === 0)
      errs.privilege_names = "Select at least one privilege.";
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
        role_name: form.role_name.trim(),
        role_description: form.role_description.trim() || null,
        privilege_names: form.privilege_names,
      };

      const result = isEdit
        ? await updateRole(editRole.id, payload)
        : await createRole(payload);

      onSuccess(result, isEdit ? "edit" : "create");
      onClose();
    } catch (err) {
      setServerError(
        err?.message || `Failed to ${isEdit ? "update" : "create"} role. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Role" : "Create New Role"}
      subtitle={
        isEdit
          ? `Updating "${editRole?.role_name ?? ""}"`
          : "Define a new role and assign privileges."
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

        {/* Role Name */}
        <UniformFormField label="Role Name *">
          <input
            ref={firstFieldRef}
            type="text"
            value={form.role_name}
            onChange={(e) => setField("role_name", e.target.value)}
            placeholder="e.g. Admin, Operator, Viewer"
            className={`${uniformInputClass} ${fieldErrors.role_name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
          />
          <FieldError msg={fieldErrors.role_name} />
        </UniformFormField>

        {/* Description */}
        <UniformFormField label="Description">
          <textarea
            value={form.role_description}
            onChange={(e) => setField("role_description", e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="Briefly describe what this role can do…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all resize-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <div className="mt-1 flex justify-end">
            <span className="text-[11px] text-slate-400">{form.role_description.length}/1000</span>
          </div>
        </UniformFormField>

        {/* Privileges */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Privileges *
          </label>
          <PrivilegeSelector
            selected={form.privilege_names}
            onChange={(val) => setField("privilege_names", val)}
            modules={privModules}
            loadingPrivileges={loadingPrivileges}
            privError={privLoadError}
          />
          <FieldError msg={fieldErrors.privilege_names} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
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
              <><EditIcon size={14} /> Save Changes</>
            ) : (
              <><PlusIcon size={14} /> Create Role</>
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
export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_on");
  const [sortOrder, setSortOrder] = useState("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [toast, setToast] = useState("");

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  /* fetch roles */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRoles({
        page: currentPage,
        page_size: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setRoles(data.results ?? []);
      setTotalCount(data.count ?? 0);
    } catch (err) {
      setError(err?.message || "Failed to load roles. Please try again.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditingRole(null); setModalOpen(true); }
  function openEdit(role) { setEditingRole(role); setModalOpen(true); }

  function handleSuccess(result, mode) {
    setToast(
      mode === "edit"
        ? `Role "${result.role_name}" updated successfully.`
        : `Role "${result.role_name}" created successfully.`
    );
    setTimeout(() => setToast(""), 4000);
    setCurrentPage(1);
    load();
  }

  const sorted = useMemo(() => {
    return [...roles].sort((a, b) => {
      const av = String(a[sortBy] ?? "").toLowerCase();
      const bv = String(b[sortBy] ?? "").toLowerCase();
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [roles, sortBy, sortOrder]);

  function handleSort(field) {
    if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortOrder("asc"); }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const COL_COUNT = 7;

  return (
    <>
      <div className="space-y-6 animate-fadeIn">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <RolesIcon size={20} />
            </div>
            <div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">Role Management</h2>
              <p className="text-[14px] text-slate-500">Define and manage roles and their privileges.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!loading && !error && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <span className="text-[13px] font-semibold text-slate-700">
                  {totalCount} Role{totalCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:from-blue-800 hover:to-blue-700 transition-all"
            >
              <PlusIcon size={14} />
              Create Role
            </button>
          </div>
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

        {/* ── Search ── */}
        <SearchBar
          placeholder="Search by role name or description…"
          value={search}
          onChange={setSearch}
          showFilter={false}
        />

        {/* ── Table ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="w-[52px] px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">#</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Role Name"   field="role_name"        sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Description" field="role_description" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Privileges
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Created By"  field="created_by_name"  sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Created On"  field="created_on"       sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
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
                  sorted.map((role, idx) => (
                    <tr key={role.id} className="group transition-colors hover:bg-blue-50/30">
                      <td className="px-5 py-4 text-[12px] font-medium text-slate-400">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <RolesIcon size={15} />
                          </div>
                          <span className="font-semibold text-slate-800">{role.role_name}</span>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">{role.role_description || "—"}</span>
                      </td>
                      <td className="max-w-[200px] px-5 py-4">
                        <PrivilegeChips names={role.privilege_names} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold uppercase text-slate-600">
                            {role.created_by_name?.[0] ?? "?"}
                          </div>
                          <span className="text-slate-700">
                            {role.created_by_name || `ID: ${role.created_by}`}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(role.created_on)}
                      </td>
                      <td className="sticky right-0 z-10 w-[80px] border-l border-slate-200/70 bg-white px-4 py-4 text-center shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)] group-hover:bg-blue-50/30">
                        <button
                          type="button"
                          onClick={() => openEdit(role)}
                          title="Edit role"
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

      <RoleFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editRole={editingRole}
      />
    </>
  );
}
