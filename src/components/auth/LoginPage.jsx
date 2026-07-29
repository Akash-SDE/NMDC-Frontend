import { useEffect, useState } from "react";
import { useRouter, USER_ROLES } from "../../context/RouterContext";
import { Logo } from "../icons";
import { loginWithCredentials } from "../../services/authService";

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
  admin: { username: "admin@nmdc.com", password: "admin123", name: "Harish Kumar" },
  superadmin: { username: "superadmin@nmdc.com", password: "super123", name: "System Admin" },
};

const LOGIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80";
const REMEMBER_LOGIN_KEY = "nmdc_remembered_login";

function readRememberedCredentials() {
  try {
    const raw = window.localStorage.getItem(REMEMBER_LOGIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.username || !parsed?.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRememberedCredentials(username, password) {
  try {
    window.localStorage.setItem(
      REMEMBER_LOGIN_KEY,
      JSON.stringify({ username, password }),
    );
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}

function clearRememberedCredentials() {
  try {
    window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}

export default function LoginPage() {
  const { login } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    const remembered = readRememberedCredentials();
    if (!remembered) return;

    setFormData({
      username: remembered.username,
      password: remembered.password,
      remember: true,
    });
  }, []);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { username, password, remember } = formData;

    if (!username.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const tokens = await loginWithCredentials(username.trim(), password);

      if (remember) {
        writeRememberedCredentials(username.trim(), password);
      } else {
        clearRememberedCredentials();
      }

      // Determine role from token payload (if backend encodes it), else default to admin
      let role = USER_ROLES.ADMIN;
      try {
        const payload = JSON.parse(atob(tokens.access.split(".")[1]));
        if (payload?.role === "superadmin") role = USER_ROLES.SUPERADMIN;
        else if (payload?.role === "operator") role = USER_ROLES.OPERATOR;
      } catch {
        // Payload decode failed — keep default role
      }

      login(role, { username: username.trim(), name: username.trim() }, remember, tokens);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div className="mx-auto w-full max-w-105 3xl:max-w-130 5xl:max-w-175">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 3xl:mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
              <Logo size={34} className="h-full w-full object-contain" />
            </div>
            <span className="text-[18px] 3xl:text-[22px] font-bold text-brand-900">
              Rake Dispatch Management System
            </span>
          </div>

          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:hidden">
            <img
              src={LOGIN_HERO_IMAGE}
              alt="Freight rail logistics"
              className="h-42 w-full object-cover"
            />
          </div>

          <h1 className="text-[30px] sm:text-[36px] 3xl:text-[44px] font-bold text-brand-900 leading-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] sm:text-[15px] 3xl:text-[18px] text-slate-500">
            Please enter your credentials to access the system.
          </p>

          {/* Quick Login Buttons */}
          <div className="mt-6 3xl:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 3xl:gap-4">
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
                  className="text-red-500 shrink-0"
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
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
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
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-6 py-3.5 3xl:py-4 text-[15px] 3xl:text-[18px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>
        </div>
        <div className="font-bold text-xs text-blue-600 text-center mt-10">
          <a href="https://thinkerscave.com/">
            Powered By @ThinkersCave Technologies
          </a>
        </div>
      </div>
      {/* Image Side */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden">
        <img
          src={LOGIN_HERO_IMAGE}
          alt="Freight rail logistics"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/50 to-transparent p-8 3xl:p-12">
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
