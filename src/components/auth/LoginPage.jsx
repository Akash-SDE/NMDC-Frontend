import { useState } from "react";
import { useRouter, USER_ROLES } from "../../context/RouterContext";

function EyeIcon() {
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
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
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
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const DEMO_ACCOUNTS = {
  admin: { username: "admin", password: "admin123", name: "Harish Kumar" },
  superadmin: {
    username: "superadmin",
    password: "super123",
    name: "System Admin",
  },
};

export default function LoginPage() {
  const { login, navigate } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { username, password } = formData;

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    // Superadmin check
    if (
      username === DEMO_ACCOUNTS.superadmin.username &&
      password === DEMO_ACCOUNTS.superadmin.password
    ) {
      login(USER_ROLES.SUPERADMIN, {
        name: DEMO_ACCOUNTS.superadmin.name,
        username,
      });
      return;
    }

    // Admin check
    if (
      username === DEMO_ACCOUNTS.admin.username &&
      password === DEMO_ACCOUNTS.admin.password
    ) {
      login(USER_ROLES.ADMIN, { name: DEMO_ACCOUNTS.admin.name, username });
      return;
    }

    // Any other credentials → admin (demo mode)
    login(USER_ROLES.ADMIN, { name: username, username });
  }

  function quickLogin(role) {
    const creds = DEMO_ACCOUNTS[role];
    setFormData({
      username: creds.username,
      password: creds.password,
      remember: false,
    });
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Form Side */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20 xl:px-24 3xl:px-32">
        <div className="mx-auto w-full max-w-[420px] 3xl:max-w-[520px] 5xl:max-w-[700px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 3xl:mb-12">
            <div className="flex h-11 w-11 3xl:h-14 3xl:w-14 items-center justify-center rounded-xl bg-brand-600 text-white">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="3xl:w-7 3xl:h-7"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <span className="text-[18px] 3xl:text-[22px] font-bold text-brand-900">
              Iron Ore Dispatch
            </span>
          </div>

          <h1 className="text-[30px] sm:text-[36px] 3xl:text-[44px] font-bold text-brand-900 leading-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] sm:text-[15px] 3xl:text-[18px] text-slate-500">
            Please enter your credentials to access the system.
          </p>

          {/* Quick Login Buttons */}
          <div className="mt-6 3xl:mt-8 grid grid-cols-2 gap-3 3xl:gap-4">
            <button
              type="button"
              onClick={() => quickLogin("admin")}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-200 bg-brand-50 px-4 py-2.5 3xl:py-3 text-[12px] 3xl:text-[14px] font-semibold text-brand-700 hover:bg-brand-100 hover:border-brand-300 transition-all"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickLogin("superadmin")}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-purple-200 bg-purple-50 px-4 py-2.5 3xl:py-3 text-[12px] 3xl:text-[14px] font-semibold text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-all"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Super Admin
            </button>
          </div>

          <div className="flex items-center gap-3 my-5 3xl:my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] 3xl:text-[13px] font-semibold text-slate-400 uppercase tracking-wider">
              or enter manually
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-slideDown">
              <p className="text-[13px] 3xl:text-[15px] font-semibold text-red-600 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-red-500 flex-shrink-0"
                >
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 3xl:space-y-7">
            <div>
              <label className="block text-[13px] sm:text-[14px] 3xl:text-[17px] font-semibold text-brand-900 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 3xl:py-4 text-[14px] 3xl:text-[17px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-[13px] sm:text-[14px] 3xl:text-[17px] font-semibold text-brand-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 3xl:py-4 text-[14px] 3xl:text-[17px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => handleChange("remember", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[13px] 3xl:text-[16px] text-slate-600">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-[13px] 3xl:text-[16px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-6 py-3.5 3xl:py-4 text-[15px] 3xl:text-[18px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.99]"
            >
              Log In
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 3xl:p-5">
            <p className="text-[11px] 3xl:text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1.5">
              <p className="text-[12px] 3xl:text-[14px] text-slate-600 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-brand-100 text-brand-600 text-[9px] font-bold">
                  A
                </span>
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-brand-700">
                  admin
                </code>{" "}
                /{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-brand-700">
                  admin123
                </code>
              </p>
              <p className="text-[12px] 3xl:text-[14px] text-slate-600 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-purple-600 text-[9px] font-bold">
                  S
                </span>
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-purple-700">
                  superadmin
                </code>{" "}
                /{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border text-purple-700">
                  super123
                </code>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[13px] 3xl:text-[16px] text-slate-500">
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

      {/* Image Side */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-40">
            <svg
              viewBox="0 0 800 600"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#87CEEB" />
                  <stop offset="60%" stopColor="#B8860B" />
                  <stop offset="100%" stopColor="#8B7355" />
                </linearGradient>
              </defs>
              <rect width="800" height="600" fill="url(#skyGrad)" />
              <rect x="0" y="350" width="800" height="250" fill="#A0845C" />
              <rect
                x="200"
                y="250"
                width="350"
                height="120"
                rx="8"
                fill="#D4A843"
              />
              <rect
                x="180"
                y="200"
                width="150"
                height="80"
                rx="6"
                fill="#C4983D"
              />
              <circle cx="280" cy="390" r="35" fill="#333" />
              <circle cx="280" cy="390" r="18" fill="#555" />
              <circle cx="470" cy="390" r="35" fill="#333" />
              <circle cx="470" cy="390" r="18" fill="#555" />
              <polygon
                points="200,250 550,250 520,140 230,140"
                fill="#B8941E"
              />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 3xl:p-12">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 3xl:p-8 border border-white/20">
            <h3 className="text-[22px] 3xl:text-[28px] font-bold text-white">
              Efficient Industrial Logistics
            </h3>
            <p className="mt-2 text-[14px] 3xl:text-[17px] text-white/80">
              Real-time tracking and automated dispatch management for heavy
              industry operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
