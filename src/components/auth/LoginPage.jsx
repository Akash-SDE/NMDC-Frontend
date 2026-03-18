import { useState } from "react";
import { useRouter } from "../../context/RouterContext";

function EyeIcon({ className = "" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const { navigate } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  function handleSubmit(e) {
    e.preventDefault();
    navigate("dashboard");
  }

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left — Form side */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20 xl:px-24 3xl:px-32 5xl:px-48">
        <div className="mx-auto w-full max-w-[420px] 3xl:max-w-[520px] 5xl:max-w-[700px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 3xl:mb-14 5xl:mb-20">
            <div className="flex h-11 w-11 3xl:h-14 3xl:w-14 5xl:h-18 5xl:w-18 items-center justify-center rounded-xl bg-brand-600 text-white">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="3xl:w-7 3xl:h-7 5xl:w-9 5xl:h-9"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <span className="text-[18px] 3xl:text-[22px] 5xl:text-[28px] font-bold text-brand-900">
              Iron Ore Dispatch
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[30px] sm:text-[36px] 3xl:text-[44px] 5xl:text-[56px] font-bold text-brand-900 leading-tight">
            Welcome back
          </h1>
          <p className="mt-2 3xl:mt-3 text-[14px] sm:text-[15px] 3xl:text-[18px] 5xl:text-[24px] text-slate-500 leading-relaxed">
            Please enter your credentials to access the dispatch dashboard.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 3xl:mt-12 5xl:mt-16 space-y-5 3xl:space-y-7 5xl:space-y-9"
          >
            {/* Username */}
            <div>
              <label className="block text-[13px] sm:text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 3xl:px-5 3xl:py-4 5xl:px-7 5xl:py-5 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] sm:text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-brand-900 mb-2 3xl:mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 3xl:px-5 3xl:py-4 3xl:pr-14 5xl:px-7 5xl:py-5 5xl:pr-16 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 3xl:h-10 3xl:w-10 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 3xl:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => handleChange("remember", e.target.checked)}
                  className="h-4 w-4 3xl:h-5 3xl:w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-600">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-6 py-3.5 3xl:py-4 5xl:py-5 text-[15px] 3xl:text-[18px] 5xl:text-[24px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.99]"
            >
              Log In
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-8 3xl:mt-12 text-center text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-400">
            Authorized Personnel Only. System activity is monitored and logged.
          </p>

          {/* Sign up link */}
          <p className="mt-4 text-center text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("signup")}
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      {/* Right — Image side */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Mining operations"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Bottom overlay card */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 3xl:p-12 5xl:p-16">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 3xl:p-8 5xl:p-12 border border-white/20">
            <h3 className="text-[22px] 3xl:text-[28px] 5xl:text-[36px] font-bold text-white leading-tight">
              Efficient Industrial Logistics
            </h3>
            <p className="mt-2 3xl:mt-3 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-white/80 leading-relaxed">
              Real-time tracking and automated dispatch management for heavy
              industry operations. Optimizing iron ore transportation across the
              supply chain.
            </p>
            {/* Feature badges */}
            <div className="flex flex-wrap gap-4 3xl:gap-5 5xl:gap-7 mt-5 3xl:mt-7">
              {[
                { icon: "📊", label: "LIVE ANALYTICS" },
                { icon: "📍", label: "GPS TRACKING" },
                { icon: "📦", label: "INVENTORY CONTROL" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 3xl:gap-3 text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-wider text-white/90"
                >
                  <span className="text-[14px] 3xl:text-[18px]">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
