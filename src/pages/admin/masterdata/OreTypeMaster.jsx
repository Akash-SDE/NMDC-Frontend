import { useState } from "react";
import {
  oreTypesData,
  oreTypesStats,
  oreTypesMeta,
} from "../../../data/adminmasterdatafiles/oreTypes";
import useCrud from "../../../hooks/useCrud";
import { exportToCSV } from "../../../utils/export";
import SearchBar from "../../../components/shared/SearchBar";
import StatusBadge from "../../../components/shared/StatusBadge";
import Pagination from "../../../components/shared/Pagination";
import Modal from "../../../components/shared/Modal";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import Toast from "../../../components/shared/Toast";
import FilterPanel from "../../../components/shared/FilterPanel";
import { PlusIcon } from "../../../components/icons";

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
      className="3xl:w-5 3xl:h-5"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function DeleteIcon() {
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
      className="3xl:w-5 3xl:h-5"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

const emptyForm = {
  code: "",
  name: "",
  grade: "",
  description: "",
  status: "active",
};
const csvColumns = [
  { key: "code", label: "Ore Type Code" },
  { key: "name", label: "Ore Type Name" },
  { key: "grade", label: "Grade (Fe %)" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
];

function OreTypeForm({ initialData, onSave, onCancel, isEditing }) {
  const [form, setForm] = useState(initialData || { ...emptyForm });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.code.trim()) e.code = "Code is required";
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.grade.trim()) e.grade = "Grade is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (validate()) onSave(form);
  }

  const inputClass = (f) =>
    `w-full rounded-lg border ${errors[f] ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"} bg-slate-50 px-4 py-2.5 3xl:py-3 5xl:py-4 text-[14px] 3xl:text-[16px] 5xl:text-[20px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 3xl:space-y-6 5xl:space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-5">
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5 3xl:mb-2">
            Ore Type Code *
          </label>
          <input
            type="text"
            placeholder="e.g. FE-62-H"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
            disabled={isEditing}
            className={`${inputClass("code")} ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          {errors.code && (
            <p className="mt-1 text-[11px] 3xl:text-[13px] text-red-500 font-medium">
              {errors.code}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5 3xl:mb-2">
            Grade (Fe %) *
          </label>
          <input
            type="text"
            placeholder="e.g. 62.5%"
            value={form.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            className={inputClass("grade")}
          />
          {errors.grade && (
            <p className="mt-1 text-[11px] 3xl:text-[13px] text-red-500 font-medium">
              {errors.grade}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5 3xl:mb-2">
          Ore Type Name *
        </label>
        <input
          type="text"
          placeholder="e.g. High Grade Hematite"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={inputClass("name")}
        />
        {errors.name && (
          <p className="mt-1 text-[11px] 3xl:text-[13px] text-red-500 font-medium">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5 3xl:mb-2">
          Description
        </label>
        <textarea
          placeholder="Brief description of the ore type..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          className={inputClass("description") + " resize-none"}
        />
      </div>
      <div>
        <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5 3xl:mb-2">
          Status
        </label>
        <select
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className={inputClass("status") + " appearance-none cursor-pointer"}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex items-center justify-end gap-3 3xl:gap-4 pt-4 3xl:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 3xl:px-6 3xl:py-3 text-[14px] 3xl:text-[16px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 text-[14px] 3xl:text-[16px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all active:scale-[0.98]"
        >
          {isEditing ? "Update Ore Type" : "Add Ore Type"}
        </button>
      </div>
    </form>
  );
}

export default function OreTypeMaster() {
  const crud = useCrud(oreTypesData, "code");
  const pageSize = oreTypesMeta.pageSize;
  const totalFiltered = crud.data.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedData = crud.data.slice(
    (crud.currentPage - 1) * pageSize,
    crud.currentPage * pageSize,
  );

  const activeCount = crud.allData.filter((o) => o.status === "active").length;

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      <Toast toast={crud.toast} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900 italic">
            {oreTypesMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {oreTypesMeta.subtitle}
          </p>
        </div>
        <button
          onClick={crud.openAddForm}
          className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start active:scale-[0.98]"
        >
          <PlusIcon />
          <span>{oreTypesMeta.addLabel}</span>
        </button>
      </div>

      <SearchBar
        placeholder={oreTypesMeta.searchPlaceholder}
        value={crud.search}
        onChange={(v) => {
          crud.setSearch(v);
          crud.setCurrentPage(1);
        }}
        showFilter
        showExport
        filterLabel="Filters"
        onFilter={crud.toggleFilter}
        onExport={() => exportToCSV(crud.data, "ore_types", csvColumns)}
      />
      <FilterPanel
        isOpen={crud.isFilterOpen}
        onClose={crud.toggleFilter}
        activeFilters={crud.activeFilters}
        onApply={crud.applyFilter}
        onClear={crud.clearFilters}
      />

      <div className="rounded-xl border border-border-subtle bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Ore Type Code
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Name
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden sm:table-cell">
                  Grade
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Description
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-[15px] 3xl:text-[18px] text-slate-400 font-semibold"
                  >
                    No ore types found
                  </td>
                </tr>
              ) : (
                paginatedData.map((ore) => (
                  <tr
                    key={ore.code}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-brand-600">
                        {ore.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-brand-900">
                        {ore.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden sm:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-medium text-slate-700">
                        {ore.grade}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden md:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-500 truncate max-w-[200px] block">
                        {ore.description}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <StatusBadge status={ore.status} showDot={false} />
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => crud.openEditForm(ore)}
                          className="flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => crud.openDeleteConfirm(ore)}
                          className="flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <DeleteIcon />
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
            currentPage={crud.currentPage}
            totalPages={totalPages}
            totalCount={totalFiltered}
            pageSize={pageSize}
            onPageChange={crud.setCurrentPage}
          />
        </div>
      </div>

      {/* Dynamic stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 3xl:gap-6 5xl:gap-8">
        <div className="flex items-center gap-3 3xl:gap-4 rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm">
          <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-brand-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-brand-600"
            >
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-slate-500 uppercase">
              Total Ore Types
            </p>
            <p className="text-[24px] 3xl:text-[30px] 5xl:text-[40px] font-bold text-brand-900">
              {crud.allData.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 3xl:gap-4 rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm">
          <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-emerald-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-emerald-600"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-slate-500 uppercase">
              Active Grades
            </p>
            <p className="text-[24px] 3xl:text-[30px] 5xl:text-[40px] font-bold text-brand-900">
              {activeCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 3xl:gap-4 rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm">
          <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-xl bg-red-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-red-500"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-slate-500 uppercase">
              Avg. Grade Fe %
            </p>
            <p className="text-[24px] 3xl:text-[30px] 5xl:text-[40px] font-bold text-brand-900">
              59.7%
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={crud.isFormOpen}
        onClose={crud.closeForm}
        title={crud.editingItem ? "Edit Ore Type" : "Add New Ore Type"}
        subtitle={
          crud.editingItem
            ? `Editing ${crud.editingItem.code}`
            : "Fill in the ore type details"
        }
        size="lg"
      >
        <OreTypeForm
          initialData={crud.editingItem}
          onSave={crud.saveItem}
          onCancel={crud.closeForm}
          isEditing={!!crud.editingItem}
        />
      </Modal>

      <ConfirmDialog
        isOpen={crud.isDeleteOpen}
        onClose={crud.closeDeleteConfirm}
        onConfirm={crud.deleteItem}
        title="Delete Ore Type"
        message="This will permanently remove this ore type from the system."
        itemName={crud.deletingItem?.name || ""}
      />
    </div>
  );
}
