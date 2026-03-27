import { useEffect, useState } from "react";
import { useRouter } from "./../../../context/RouterContext";
import { PRIVILEGE_MODULES } from "../shared/superadminData";
import PrivilegeGroup from "./PrivilegeGroup";
import {
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";

function AddRolePage() {
  const { navigate, routeParams } = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  useEffect(() => {
    if (routeParams?.role) {
      setFormData({
        name: routeParams.role.name || "",
        description: routeParams.role.description || "",
      });
      setSelectedPrivileges(routeParams.role.privileges || []);
    }
  }, [routeParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(routeParams?.role ? "Updating role:" : "Creating role:", {
      ...formData,
      privileges: selectedPrivileges,
    });
    // TODO: Save role via API
    navigate("sa-roles");
  };

  const handleTogglePrivilege = (privilegeId) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privilegeId)
        ? prev.filter((id) => id !== privilegeId)
        : [...prev, privilegeId],
    );
  };

  const handleSelectAll = () => {
    const allPrivilegeIds = filteredModules.flatMap((m) =>
      m.privileges.map((p) => p.id),
    );
    setSelectedPrivileges(allPrivilegeIds);
  };

  const handleClearAll = () => {
    setSelectedPrivileges([]);
  };

  const handleRefresh = () => {
    setSelectedPrivileges([]);
    setFormData({ name: "", description: "" });
    setSelectedModule("all");
  };

  const filteredModules =
    selectedModule === "all"
      ? PRIVILEGE_MODULES
      : PRIVILEGE_MODULES.filter((m) => m.id === selectedModule);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        {/* Basic Details Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            {routeParams?.role ? "Edit Role Details" : "Basic Details"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter role name (e.g., Admin, Manager, User)"
                className={uniformInputClass}
              />
            </div>

            {/* Filter by Module */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className={`${uniformInputClass} bg-white`}
              >
                <option value="all">All Modules</option>
                {PRIVILEGE_MODULES.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the role's purpose and responsibilities..."
              rows={3}
              className={`${uniformInputClass} h-auto min-h-21 resize-none py-2.5`}
            />
          </div>
        </div>

        {/* Privileges Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Privileges <span className="text-red-500">*</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className={uniformSecondaryButtonClass}
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className={uniformSecondaryButtonClass}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-lg border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Privilege Groups */}
          <div className="space-y-3">
            {filteredModules.map((module) => (
              <PrivilegeGroup
                key={module.id}
                module={module}
                selectedPrivileges={selectedPrivileges}
                onToggle={handleTogglePrivilege}
              />
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("sa-roles")}
            className={uniformSecondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              !formData.name ||
              !formData.description ||
              selectedPrivileges.length === 0
            }
            className={`${uniformPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {routeParams?.role ? "Update Role" : "Create Role"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRolePage;
