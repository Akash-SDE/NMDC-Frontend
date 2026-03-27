import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { useRouter } from "./../../../context/RouterContext";
import { MOCK_ROLES } from "../shared/superadminData";
import {
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";

function AddUserPage() {
  const { navigate, routeParams } = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (routeParams?.user) {
      setFormData({
        name: routeParams.user.name || "",
        email: routeParams.user.email || "",
        phone: routeParams.user.phone || "",
        role: routeParams.user.role || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [routeParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log(routeParams?.user ? "Updating user:" : "Creating user:", formData);
    // TODO: Save user via API
    navigate("sa-users");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Profile Details Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            {routeParams?.user ? "Edit User Details" : "Profile Details"}
          </h2>
          {/* ... contents ... */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={`${uniformInputClass} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={`${uniformInputClass} pl-10 pr-4`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className={`${uniformInputClass} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className={`${uniformInputClass} appearance-none bg-white pl-10 pr-8`}
                  >
                    <option value="">Select a role</option>
                    {MOCK_ROLES.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            {routeParams?.user ? "Security & Access" : "Security"}
          </h2>
          <div className="space-y-5">
            {/* Password */}
            <div className="flex gap-6 w-full">
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Enter password"
                    className={`${uniformInputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="text-xl" />
                    ) : (
                      <Eye className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm password"
                    className={`${uniformInputClass} pl-10 pr-4`}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 flex items-center gap-1">
            <Info className="text-sm" />
            Password must be at least 8 characters with numbers and symbols
          </p>
        </div>
        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("sa-users")}
            className={uniformSecondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={uniformPrimaryButtonClass}
          >
            {routeParams?.user ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUserPage;
