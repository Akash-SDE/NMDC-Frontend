import { useState, useEffect, useCallback } from "react";
import { wagonTypesMeta } from "../../../data/adminmasterdatafiles/wagonTypes";
import SearchBar from "../../../components/shared/SearchBar";
import StatusBadge from "../../../components/shared/StatusBadge";
import Pagination from "../../../components/shared/Pagination";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import Toast from "../../../components/shared/Toast";
import { PlusIcon } from "../../../components/icons";
import { useRouter } from "../../../context/RouterContext";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import {
  fetchWagonTypes,
  createWagonType,
  updateWagonType,
  patchWagonType,
} from "../../../services/wagonTypeService";

// ─── Icons ────────────────────────────────────────────────────────────────────
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="3xl:w-5 3xl:h-5">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function DisableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="3xl:w-5 3xl:h-5">
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <line x1="12" y1="11" x2="12" y2="7" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function EnableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="3xl:w-5 3xl:h-5">
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <polyline points="8 16 11 19 16 14" />
    </svg>
  );
}
function SortIcon({ isActive, order }) {
  if (!isActive)
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-300" aria-hidden="true">
        <path d="M8 2l3 3H5l3-3z" fill="currentColor" />
        <path d="M8 14l-3-3h6l-3 3z" fill="currentColor" />
      </svg>
    );
  return order === "asc" ? (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-700" aria-hidden="true">
      <path d="M8 2l3 3H5l3-3z" fill="currentColor" />
      <path d="M8 4.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-700" aria-hidden="true">
      <path d="M8 14l-3-3h6l-3 3z" fill="currentColor" />
      <path d="M8 2.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toUi(r) {
  return {
    id: r.id,
    name: r.wagon_type || "",
    description: r.wagon_description || "",
    status: r.status ? "active" : "inactive",
  };
}

function toApi(form) {
  return {
    wagon_type: form.name || null,
    wagon_description: form.description || null,
    status: form.status === "active",
  };
}

// ─── Form ─────────────────────────────────────────────────────────────────────
const emptyForm = { name: "", description: "", status: "active" };

function WagonTypeForm({ initialData, onSave, onCancel, isEditing, saving }) {
  const [form, setForm] = useState(initialData || { ...emptyForm });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Wagon type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (validate()) onSave(form);
  }

  const inputClass = (f) =>
    `w-full rounded-lg border ${errors[f] ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"} bg-slate-50 px-4 py-2.5 3xl:py-3 text-[14px] 3xl:text-[16px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 3xl:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-5">
        <div>
          <label className="block text-[13px] 3xl:text-[15px] font-semibold text-slate-800 mb-1.5">
            Wagon Type *
          </label>
          <input type="text" placeholder="e.g. BOXN"
            value={form.name} onChange={(e) => handleChange("name", e.target.value)}
            className={inputClass("name")} />
          {errors.name && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name}</p>}
        </div>
        {!isEditing && (
          <div>
            <label className="block text-[13px] 3xl:text-[15px] font-semibold text-slate-800 mb-1.5">
              Status
            </label>
            <ThemedSelect value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className={inputClass("status") + " appearance-none cursor-pointer"}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </ThemedSelect>
          </div>
        )}
      </div>

      <div>
        <label className="block text-[13px] 3xl:text-[15px] font-semibold text-slate-800 mb-1.5">
          Description
        </label>
        <input type="text" placeholder="e.g. BOXN Open Wagon"
          value={form.description} onChange={(e) => handleChange("description", e.target.value)}
          className={inputClass("description")} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? "Saving…" : isEditing ? "Update Wagon Type" : "Add Wagon Type"}
        </button>
      </div>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function WagonTypeMaster() {
  const { navigate, currentRoute } = useRouter();
  const addRoute = "wagon-types-add";
  const editRoute = "wagon-types-edit";
  const baseRoute = "wagon-types";
  const isAddPage = currentRoute === addRoute;
  const isEditPage = currentRoute === editRoute;

  const [wagonTypes, setWagonTypes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusToggleItem, setStatusToggleItem] = useState(null);
  const [isStatusToggleOpen, setIsStatusToggleOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function showToast(message, type = "success") {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }

  const loadWagonTypes = useCallback(async () => {
    setLoading(true);
    try {
      const filters = search.trim() ? { wagon_type: search.trim() } : {};
      const res = await fetchWagonTypes(filters);
      const results = res?.results ?? res ?? [];
      setWagonTypes(results.map(toUi));
      setTotalCount(res?.count ?? results.length);
    } catch (err) {
      showToast(err.message || "Failed to load wagon types.", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!isAddPage && !isEditPage) loadWagonTypes();
  }, [isAddPage, isEditPage, loadWagonTypes]);

  const sorted = [...wagonTypes].sort((a, b) => {
    const av = String(a[sortBy] ?? "").toLowerCase();
    const bv = String(b[sortBy] ?? "").toLowerCase();
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (sortOrder === "asc" ? 1 : -1);
  });
  const paginatedData = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field) {
    if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortOrder("asc"); }
    setCurrentPage(1);
  }

  function renderSortButton(label, field) {
    const isActive = sortBy === field;
    return (
      <button type="button" onClick={() => handleSort(field)}
        className={`inline-flex items-center gap-1.5 transition-colors ${isActive ? "text-slate-700" : "text-slate-500 hover:text-slate-700"}`}>
        <span>{label}</span>
        <SortIcon isActive={isActive} order={sortOrder} />
      </button>
    );
  }

  async function handleAddSave(formData) {
    setSaving(true);
    try {
      await createWagonType(toApi(formData));
      showToast(`"${formData.name}" added successfully.`);
      navigate(baseRoute);
      loadWagonTypes();
    } catch (err) {
      showToast(err.message || "Failed to add wagon type.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(formData) {
    setSaving(true);
    try {
      await updateWagonType(editingItem.id, toApi(formData));
      showToast(`"${formData.name}" updated successfully.`);
      setEditingItem(null);
      navigate(baseRoute);
      loadWagonTypes();
    } catch (err) {
      showToast(err.message || "Failed to update wagon type.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmStatusToggle() {
    if (!statusToggleItem) return;
    const newStatus = statusToggleItem.status !== "active";
    try {
      await patchWagonType(statusToggleItem.id, { status: newStatus });
      showToast(`"${statusToggleItem.name}" ${newStatus ? "enabled" : "disabled"} successfully.`);
      loadWagonTypes();
    } catch (err) {
      showToast(err.message || "Failed to update status.", "error");
    } finally {
      setStatusToggleItem(null);
      setIsStatusToggleOpen(false);
    }
  }

  // Guard
  if (isEditPage && !editingItem) {
    return (
      <div className="space-y-6">
        <Toast toast={toast} />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[14px] text-slate-600">Select a wagon type from the list to edit.</p>
          <button type="button" onClick={() => navigate(baseRoute)}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  // Add / Edit form
  if (isAddPage || isEditPage) {
    return (
      <div className="space-y-6 3xl:space-y-8">
        <Toast toast={toast} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] font-bold text-slate-800">
              {isEditPage ? "Edit Wagon Type" : "Add New Wagon Type"}
            </h2>
            <p className="mt-1 text-[14px] 3xl:text-[17px] text-slate-500">Configure wagon type specifications.</p>
          </div>
          <button type="button" onClick={() => { setEditingItem(null); navigate(baseRoute); }}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            Back to List
          </button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <WagonTypeForm
            initialData={isEditPage ? editingItem : { ...emptyForm }}
            onSave={isEditPage ? handleEditSave : handleAddSave}
            onCancel={() => { setEditingItem(null); navigate(baseRoute); }}
            isEditing={isEditPage}
            saving={saving}
          />
        </div>
      </div>
    );
  }

  // List
  return (
    <div className="space-y-6 3xl:space-y-8">
      <Toast toast={toast} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] font-bold text-slate-800">
            {wagonTypesMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] text-slate-500">{wagonTypesMeta.subtitle}</p>
        </div>
        <button onClick={() => { setEditingItem(null); navigate(addRoute); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 3xl:px-6 3xl:py-3 text-[13px] 3xl:text-[16px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-all self-start active:scale-[0.98]">
          <PlusIcon />
          <span>{wagonTypesMeta.addLabel}</span>
        </button>
      </div>

      <SearchBar
        placeholder={wagonTypesMeta.searchPlaceholder}
        value={search}
        onChange={(v) => { setSearch(v); setCurrentPage(1); }}
        showFilter={false}
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  #
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {renderSortButton("Wagon Type", "name")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  {renderSortButton("Description", "description")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {renderSortButton("Status", "status")}
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] 3xl:text-[13px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-[14px] text-slate-400 animate-pulse">Loading wagon types…</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[15px] text-slate-400 font-semibold">
                    No wagon types found
                  </td>
                </tr>
              ) : (
                paginatedData.map((wagon) => (
                  <tr key={wagon.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] font-semibold text-blue-600">{wagon.id}</span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] font-semibold text-slate-800">{wagon.name || "—"}</span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden md:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] text-slate-600">{wagon.description || "—"}</span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <StatusBadge status={wagon.status} showDot={false} />
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(wagon); navigate(editRoute); }}
                          disabled={wagon.status === "inactive"}
                          className={`flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg transition-colors ${wagon.status === "inactive" ? "cursor-not-allowed text-slate-300" : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"}`}
                          title={wagon.status === "inactive" ? "Enable to edit" : "Edit"}>
                          <EditIcon />
                        </button>
                        <button onClick={() => { setStatusToggleItem(wagon); setIsStatusToggleOpen(true); }}
                          className={`flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg transition-colors ${wagon.status === "inactive" ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600" : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"}`}
                          title={wagon.status === "inactive" ? "Enable" : "Disable"}>
                          {wagon.status === "inactive" ? <EnableIcon /> : <DisableIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 3xl:px-6 3xl:py-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isStatusToggleOpen}
        onClose={() => { setStatusToggleItem(null); setIsStatusToggleOpen(false); }}
        onConfirm={confirmStatusToggle}
        title={statusToggleItem?.status === "inactive" ? "Enable Wagon Type" : "Disable Wagon Type"}
        message={statusToggleItem?.status === "inactive"
          ? "Are you sure you want to enable this wagon type?"
          : "Are you sure you want to disable this wagon type?"}
        itemName={statusToggleItem?.name || ""}
        confirmLabel={statusToggleItem?.status === "inactive" ? "Enable" : "Disable"}
        variant={statusToggleItem?.status === "inactive" ? "warning" : "danger"}
      />
    </div>
  );
}
