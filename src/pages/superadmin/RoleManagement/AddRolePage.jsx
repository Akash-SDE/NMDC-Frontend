import { useState } from "react";
import { useRouter } from "./../../../context/RouterContext";
import { PRIVILEGE_MODULES } from "../shared/superadminData";
import PrivilegeGroup from "./PrivilegeGroup";

function AddRolePage() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating role:", { ...formData, privileges: selectedPrivileges });
    // TODO: Save role via API
    navigate("sa-roles");
  };

  const handleTogglePrivilege = (privilegeId) => {
    setSelectedPrivileges(prev =>
      prev.includes(privilegeId)
        ? prev.filter(id => id !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  const handleSelectAll = () => {
    const allPrivilegeIds = filteredModules.flatMap(m => m.privileges.map(p => p.id));
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

  const filteredModules = selectedModule === "all"
    ? PRIVILEGE_MODULES
    : PRIVILEGE_MODULES.filter(m => m.id === selectedModule);

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit}>
        {/* Basic Details Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Basic Details</h2>
          
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
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name (e.g., Admin, Manager, User)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="all">All Modules</option>
                {PRIVILEGE_MODULES.map(module => (
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the role's purpose and responsibilities..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Privileges Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Privileges <span className="text-red-500">*</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary"
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
            className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.name || !formData.description || selectedPrivileges.length === 0}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Role
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRolePage;
