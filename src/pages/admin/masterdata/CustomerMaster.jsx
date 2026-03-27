import { useState } from "react";
import {
  customersData,
  customersMeta,
} from "../../../data/adminmasterdatafiles/customers";
import useCrud from "../../../hooks/useCrud";
import SearchBar from "../../../components/shared/SearchBar";
import StatusBadge from "../../../components/shared/StatusBadge";
import Pagination from "../../../components/shared/Pagination";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import Toast from "../../../components/shared/Toast";
import { PlusIcon } from "../../../components/icons";
import { useRouter } from "../../../context/RouterContext";
import ThemedSelect from "../../../components/shared/ThemedSelect";

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
      className="3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
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
      className="3xl:w-5 3xl:h-5 5xl:w-6 5xl:h-6"
    >
      <path d="M17 11V7a5 5 0 0 0-10 0v4" />
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
      <polyline points="8 16 11 19 16 14" />
    </svg>
  );
}

function SortIcon({ isActive, order }) {
  if (!isActive) {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-300" aria-hidden="true">
        <path d="M8 2l3 3H5l3-3z" fill="currentColor" />
        <path d="M8 14l-3-3h6l-3 3z" fill="currentColor" />
      </svg>
    );
  }

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

const contractOptions = ["Long Term", "Annual", "Spot", "Trial"];
const contractBadgeColors = {
  "Long Term": "bg-brand-100 text-brand-700 border-brand-200",
  Annual: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Spot: "bg-amber-100 text-amber-700 border-amber-200",
  Trial: "bg-purple-100 text-purple-700 border-purple-200",
};

const emptyForm = {
  code: "",
  name: "",
  contactPerson: "",
  location: "",
  contractType: "Annual",
  status: "active",
};
function CustomerForm({ initialData, onSave, onCancel, isEditing }) {
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
    if (!form.contactPerson.trim())
      e.contactPerson = "Contact person is required";
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (validate()) onSave(form);
  }

  const inputClass = (f) =>
    `w-full rounded-lg border ${errors[f] ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"} bg-slate-50 px-4 py-2.5 3xl:py-3 5xl:py-4 text-[14px] 3xl:text-[16px] 5xl:text-[20px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 3xl:space-y-6 5xl:space-y-8"
    >
      {/* Code + Contract Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-5">
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-slate-800 mb-1.5 3xl:mb-2">
            Customer Code *
          </label>
          <input
            type="text"
            placeholder="e.g. CUST-006"
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
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-slate-800 mb-1.5 3xl:mb-2">
            Contract Type
          </label>
          <ThemedSelect
            value={form.contractType}
            onChange={(e) => handleChange("contractType", e.target.value)}
            className={
              inputClass("contractType") + " appearance-none cursor-pointer"
            }
          >
            {contractOptions.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </ThemedSelect>
        </div>
      </div>

      {/* Customer Name */}
      <div>
        <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-slate-800 mb-1.5 3xl:mb-2">
          Customer Name *
        </label>
        <input
          type="text"
          placeholder="e.g. JSW Steel Limited"
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

      {/* Contact Person + Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-5">
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-slate-800 mb-1.5 3xl:mb-2">
            Contact Person *
          </label>
          <input
            type="text"
            placeholder="e.g. Rajiv Sharma"
            value={form.contactPerson}
            onChange={(e) => handleChange("contactPerson", e.target.value)}
            className={inputClass("contactPerson")}
          />
          {errors.contactPerson && (
            <p className="mt-1 text-[11px] 3xl:text-[13px] text-red-500 font-medium">
              {errors.contactPerson}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-slate-800 mb-1.5 3xl:mb-2">
            Location *
          </label>
          <input
            type="text"
            placeholder="e.g. Bellary, Karnataka"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className={inputClass("location")}
          />
          {errors.location && (
            <p className="mt-1 text-[11px] 3xl:text-[13px] text-red-500 font-medium">
              {errors.location}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      {!isEditing && (
        <div>
          <label className="block text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-slate-800 mb-1.5 3xl:mb-2">
            Status
          </label>
          <ThemedSelect
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={inputClass("status") + " appearance-none cursor-pointer"}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </ThemedSelect>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 3xl:gap-4 pt-4 3xl:pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[14px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          {isEditing ? "Update Customer" : "Add Customer"}
        </button>
      </div>
    </form>
  );
}

export default function CustomerMaster() {
  const { navigate, currentRoute } = useRouter();
  const crud = useCrud(customersData, "code");
  const addRoute = "customer-master-add";
  const editRoute = "customer-master-edit";
  const baseRoute = "customer-master";
  const isAddPage = currentRoute === addRoute;
  const isEditPage = currentRoute === editRoute;
  const [sortBy, setSortBy] = useState("code");
  const [sortOrder, setSortOrder] = useState("asc");
  const pageSize = customersMeta.pageSize;
  const sortedData = [...crud.data].sort((a, b) => {
    const aValue = String(a[sortBy] ?? "").toLowerCase();
    const bValue = String(b[sortBy] ?? "").toLowerCase();
    if (aValue === bValue) return 0;
    const comparison = aValue > bValue ? 1 : -1;
    return sortOrder === "asc" ? comparison : -comparison;
  });
  const totalFiltered = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedData = sortedData.slice(
    (crud.currentPage - 1) * pageSize,
    crud.currentPage * pageSize,
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    crud.setCurrentPage(1);
  };

  const renderSortButton = (label, field) => {
    const isActive = sortBy === field;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className={`inline-flex items-center gap-1.5 transition-colors ${
          isActive ? "text-slate-700" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <span>{label}</span>
        <SortIcon isActive={isActive} order={sortOrder} />
      </button>
    );
  };

  const handleAddClick = () => {
    crud.closeForm();
    navigate(addRoute);
  };

  const handleAddSave = (formData) => {
    const success = crud.saveItem(formData);
    if (success) {
      navigate(baseRoute);
    }
  };

  const handleEditClick = (item) => {
    crud.openEditForm(item);
    navigate(editRoute);
  };

  const handleEditSave = (formData) => {
    const success = crud.saveItem(formData);
    if (success) {
      navigate(baseRoute);
    }
  };

  if (isEditPage && !crud.editingItem) {
    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
        <Toast toast={crud.toast} />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[14px] 3xl:text-[16px] text-slate-600">
            Select a customer from the list to edit.
          </p>
          <button
            type="button"
            onClick={() => navigate(baseRoute)}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[14px] 3xl:text-[16px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (isAddPage || isEditPage) {
    const isEditing = isEditPage;
    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
        <Toast toast={crud.toast} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </h2>
            <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
              Fill in the customer details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditing) crud.closeForm();
              navigate(baseRoute);
            }}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[14px] 3xl:text-[16px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Back to List
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CustomerForm
            initialData={isEditing ? crud.editingItem : { ...emptyForm }}
            onSave={isEditing ? handleEditSave : handleAddSave}
            onCancel={() => {
              if (isEditing) crud.closeForm();
              navigate(baseRoute);
            }}
            isEditing={isEditing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      <Toast toast={crud.toast} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            {customersMeta.title}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {customersMeta.subtitle}
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-blue-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-all self-start active:scale-[0.98]"
        >
          <PlusIcon />
          <span>{customersMeta.addLabel}</span>
        </button>
      </div>

      <SearchBar
        placeholder={customersMeta.searchPlaceholder}
        value={crud.search}
        onChange={(v) => {
          crud.setSearch(v);
          crud.setCurrentPage(1);
        }}
        showFilter={false}
      />

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {renderSortButton("Customer Code", "code")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {renderSortButton("Customer Name", "name")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden sm:table-cell">
                  {renderSortButton("Contact Person", "contactPerson")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden md:table-cell">
                  {renderSortButton("Location", "location")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  {renderSortButton("Contract", "contractType")}
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  {renderSortButton("Status", "status")}
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        className="mb-2"
                      >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <p className="text-[15px] 3xl:text-[18px] font-semibold text-slate-400">
                        No customers found
                      </p>
                      <p className="text-[13px] 3xl:text-[15px] text-slate-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((cust) => (
                  <tr
                    key={cust.code}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-blue-600">
                        {cust.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold text-slate-800">
                        {cust.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden sm:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-600">
                        {cust.contactPerson}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden md:table-cell">
                      <span className="text-[13px] 3xl:text-[15px] 5xl:text-[19px] text-slate-600">
                        {cust.location}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5 hidden lg:table-cell">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-semibold ${
                          contractBadgeColors[cust.contractType] ||
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {cust.contractType}
                      </span>
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <StatusBadge status={cust.status} showDot={false} />
                    </td>
                    <td className="px-5 py-4 3xl:px-6 3xl:py-5">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(cust)}
                          disabled={cust.status === "inactive"}
                          className={`flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg transition-colors ${
                            cust.status === "inactive"
                              ? "cursor-not-allowed text-slate-300"
                              : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                          title={cust.status === "inactive" ? "Enable to edit" : "Edit"}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => crud.openStatusToggleConfirm(cust)}
                          className={`flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-lg transition-colors ${
                            cust.status === "inactive"
                              ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                              : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                          }`}
                          title={cust.status === "inactive" ? "Enable" : "Disable"}
                        >
                          {cust.status === "inactive" ? <EnableIcon /> : <DisableIcon />}
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

      <ConfirmDialog
        isOpen={crud.isStatusToggleOpen}
        onClose={crud.closeStatusToggleConfirm}
        onConfirm={crud.confirmStatusToggle}
        title={crud.statusToggleItem?.status === "inactive" ? "Enable Customer" : "Disable Customer"}
        message={
          crud.statusToggleItem?.status === "inactive"
            ? "Are you sure you want to enable this customer?"
            : "Are you sure you want to disable this customer?"
        }
        itemName={crud.statusToggleItem?.code || ""}
        confirmLabel={crud.statusToggleItem?.status === "inactive" ? "Enable" : "Disable"}
        variant={crud.statusToggleItem?.status === "inactive" ? "warning" : "danger"}
      />
</div>
  );
}





