import { useState } from "react";
import { useRouter } from "../../context/RouterContext";

const roleOptions = [
  "Select Role",
  "Chief Controller",
  "Logistics Manager",
  "System Administrator",
  "Dispatch Officer",
  "Site Supervisor",
];

export default function SignupPage() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    role: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigate("dashboard");
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left — Image side */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Industrial mining facility"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Bottom brand card */}
        <div className="absolute bottom-0 left-0 right-0 p-8 3xl:p-12 5xl:p-16">
          <div className="flex items-center gap-3 mb-5 3xl:mb-7">
            <div className="flex h-10 w-10 3xl:h-12 3xl:w-12 items-center justify-center rounded-lg bg-brand-600 text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <span className="text-[16px] 3xl:text-[20px] 5xl:text-[26px] font-bold text-white">
              Iron Ore Dispatch
            </span>
          </div>
          <h3 className="text-[24px] sm:text-[28px] 3xl:text-[36px] 5xl:text-[48px] font-bold text-white leading-tight italic">
            Precision Logistics for Modern Mining Operations
          </h3>
          <p className="mt-3 3xl:mt-4 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-white/80 leading-relaxed">
            Streamline your fleet management, track dispatch cycles in
            real-time, and optimize your supply chain from pit to port.
          </p>
        </div>
      </div>

      {/* Right — Form side */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-14 xl:px-20 3xl:px-28 5xl:px-40">
        <div className="mx-auto w-full max-w-[480px] 3xl:max-w-[580px] 5xl:max-w-[750px]">
          {/* Heading */}
          <h1 className="text-[28px] sm:text-[32px] 3xl:text-[40px] 5xl:text-[52px] font-bold text-brand-900 leading-tight">
            Create Account
          </h1>
          <p className="mt-2 3xl:mt-3 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Join the central logistics network for your site operations.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 3xl:mt-12 5xl:mt-16 space-y-5 3xl:space-y-7 5xl:space-y-9"
          >
            {/* Full Name */}
            <div>
              <label className="block text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Johnathan Miller"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-3 3xl:py-4 5xl:py-5 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                />
              </div>
            </div>

            {/* Employee ID + Role row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-5">
              <div>
                <label className="block text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                  Employee ID
                </label>
                <input
                  type="text"
                  placeholder="ID-48293"
                  value={formData.employeeId}
                  onChange={(e) => handleChange("employeeId", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 3xl:py-4 5xl:py-5 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 3xl:py-4 5xl:py-5 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white appearance-none cursor-pointer"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r === "Select Role" ? "" : r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Email */}
            <div>
              <label className="block text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                Company Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <polyline points="22,7 12,13 2,7" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="j.miller@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-3 3xl:py-4 5xl:py-5 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pl-11 py-3 3xl:py-4 5xl:py-5 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                className="mt-0.5 h-4 w-4 3xl:h-5 3xl:w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-[13px] 3xl:text-[15px] 5xl:text-[20px] text-slate-600 leading-relaxed">
                I agree to the{" "}
                <span className="font-semibold text-brand-600 cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-semibold text-brand-600 cursor-pointer hover:underline">
                  Privacy Policy
                </span>{" "}
                regarding operational data handling.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-6 py-3.5 3xl:py-4 5xl:py-5 text-[15px] 3xl:text-[18px] 5xl:text-[24px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <span>→</span>
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 3xl:mt-8 text-center text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-500">
            Already have an account?{" "}
            <button
              onClick={() => navigate("login")}
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign In
            </button>
          </p>

          {/* Certifications */}
          <div className="mt-6 3xl:mt-8 flex items-center justify-center gap-4 3xl:gap-6">
            <span className="text-[10px] 3xl:text-[12px] 5xl:text-[15px] font-bold tracking-[0.08em] text-slate-400 uppercase">
              ISO 9001 Certified
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] 3xl:text-[12px] 5xl:text-[15px] font-bold tracking-[0.08em] text-slate-400 uppercase">
              End-to-End Encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
