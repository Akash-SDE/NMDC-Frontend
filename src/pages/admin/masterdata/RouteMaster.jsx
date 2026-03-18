import { useState } from "react";
import {
  routesData,
  routesStats,
  routesMeta,
} from "../../../data/adminmasterdatafiles/routes";
import useCrud from "../../../hooks/useCrud";
import { exportToCSV } from "../../../utils/export";
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
  sourceSiding: "",
  destination: "",
  distance: "",
  status: "active",
};
const csvColumns = [
  { key: "code", label: "Route Code" },
  { key: "name", label: "Route Name" },
  { key: "sourceSiding", label: "Source Siding" },
  { key: "destination", label: "Destination" },
  { key: "distance", label: "Distance (KM)" },
  { key: "status", label: "Status" },
];

function RouteForm({ initialData, onSave, onCancel, isEditing }) {
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
    if (!form.sourceSiding.trim()) e.sourceSiding = "Source siding is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    if (!form.distance.trim()) e.distance = "Distance is required";
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
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5">
            Route Code *
          </label>
          <input
            type="text"
            placeholder="e.g. RT-006"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
            disabled={isEditing}
            className={`${inputClass("code")} ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          {errors.code && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {errors.code}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5">
            Distance (KM) *
          </label>
          <input
            type="text"
            placeholder="e.g. 12.5"
            value={form.distance}
            onChange={(e) => handleChange("distance", e.target.value)}
            className={inputClass("distance")}
          />
          {errors.distance && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {errors.distance}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5">
          Route Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Main Haul Road A"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={inputClass("name")}
        />
        {errors.name && (
          <p className="mt-1 text-[11px] text-red-500 font-medium">
            {errors.name}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-5">
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5">
            Source Siding *
          </label>
          <input
            type="text"
            placeholder="e.g. North Mine Yard"
            value={form.sourceSiding}
            onChange={(e) => handleChange("sourceSiding", e.target.value)}
            className={inputClass("sourceSiding")}
          />
          {errors.sourceSiding && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {errors.sourceSiding}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5">
            Destination *
          </label>
          <input
            type="text"
            placeholder="e.g. Crusher Unit 1"
            value={form.destination}
            onChange={(e) => handleChange("destination", e.target.value)}
            className={inputClass("destination")}
          />
          {errors.destination && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {errors.destination}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-brand-900 mb-1.5">
          Status
        </label>
        <select
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className={inputClass("status") + " appearance-none cursor-pointer"}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
          {isEditing ? "Update Route" : "Add Route"}
        </button>
      </div>
    </form>
  );
}

export default function RouteMaster() {
  const crud = useCrud(routesData, "code");
  const pageSize = routesMeta.pageSize;
  const totalFiltered = crud.data.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedData = crud.data.slice(
    (crud.currentPage - 1) * pageSize,
    crud.currentPage * pageSize,
  );

  const activeRoutes = crud.allData.filter((r) => r.status === "active").length;
  const maintenanceRoutes = crud.allData.filter(
    (r) => r.status === "maintenance",
  ).length;
  const totalKm = crud.allData
    .filter((r) => r.status === "active")
    .reduce((sum, r) => sum + parseFloat(r.distance || 0), 0)
    .toFixed(1);

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      <Toast toast={crud.toast} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-brand-900">
            {routesMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {routesMeta.subtitle}
          </p>
        </div>
        <button
          onClick={crud.openAddForm}
          className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-brand-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-brand-700 transition-all self-start active:scale-[0.98]"
        >
          <PlusIcon />
          <span>{routesMeta.addLabel}</span>
        </button>
      </div>

      {/* Search + Export/Print */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md 3xl:max-w-lg">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={routesMeta.searchPlaceholder}
              value={crud.search}
              onChange={(e) => {
                crud.setSearch(e.target.value);
                crud.setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-2.5 3xl:py-3 text-[13px] 3xl:text-[16px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
            />
          </div>
          <button
            onClick={crud.toggleFilter}
            className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 3xl:gap-3">
          <button
            onClick={() => exportToCSV(crud.data, "routes_master", csvColumns)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 3xl:px-5 3xl:py-3 text-[13px] 3xl:text-[15px] font-medium text-slate-600 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
          >
            Export CSV
          </button>
          <button
            onClick={() => printTable(routesMeta.title)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 3xl:px-5 3xl:py-3 text-[13px] 3xl:text-[15px] font-medium text-slate-600 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
          >
            Print
          </button>
        </div>
      </div>

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
                  Route Code
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Route Name
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden sm:table-cell">
                  Source
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  Destination
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  Distance
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
                    colSpan={7}
                    className="px-5 py-12 text-center text-[15px] text-slate-400 font-semibold"
                  >
                    No routes found
                  </td>
                </tr>
              ) : (
                paginatedData.map((route) => (
                  <tr
                    key={route.code}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-600">
                        {route.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                        {route.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden sm:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] text-slate-600">
                        {route.sourceSiding}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden md:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] text-slate-600">
                        {route.destination}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden lg:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] font-semibold text-brand-900">
                        {route.distance}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <StatusBadge status={route.status} showDot={false} />
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => crud.openEditForm(route)}
                          className="flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => crud.openDeleteConfirm(route)}
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
        <div className="px-5 py-4">
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
        <div className="rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-brand-600">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="6" cy="19" r="3" />
                <path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" />
                <circle cx="18" cy="5" r="3" />
              </svg>
            </span>
            <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-slate-500 uppercase">
              Total Route Coverage
            </p>
          </div>
          <p className="text-[26px] 3xl:text-[32px] 5xl:text-[42px] font-bold text-brand-900">
            {totalKm} KM
          </p>
          <p className="mt-1 text-[12px] 3xl:text-[14px] text-slate-400">
            Combined distance of active routes
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-600">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </span>
            <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-emerald-700 uppercase">
              Operational
            </p>
          </div>
          <p className="text-[26px] 3xl:text-[32px] 5xl:text-[42px] font-bold text-brand-900">
            {activeRoutes} Routes
          </p>
          <p className="mt-1 text-[12px] 3xl:text-[14px] text-slate-400">
            Ready for dispatch assignments
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-5 3xl:p-7 5xl:p-9 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-600">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </span>
            <p className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-bold tracking-[0.06em] text-amber-700 uppercase">
              Under Maintenance
            </p>
          </div>
          <p className="text-[26px] 3xl:text-[32px] 5xl:text-[42px] font-bold text-brand-900">
            {maintenanceRoutes} Routes
          </p>
          <p className="mt-1 text-[12px] 3xl:text-[14px] text-slate-400">
            Temporarily unavailable
          </p>
        </div>
      </div>

      <Modal
        isOpen={crud.isFormOpen}
        onClose={crud.closeForm}
        title={crud.editingItem ? "Edit Route" : "Add New Route"}
        subtitle={
          crud.editingItem
            ? `Editing ${crud.editingItem.code}`
            : "Configure route details"
        }
        size="lg"
      >
        <RouteForm
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
        title="Delete Route"
        message="This will permanently remove this route from the system."
        itemName={crud.deletingItem?.name || ""}
      />
    </div>
  );
}
