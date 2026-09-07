import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE } from "../../../constants/roles";
import { Logo } from "../../../components/icons";

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const LOGIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80";
const REMEMBER_USERNAME_KEY = "nmdc_remembered_username";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (remembered) {
      setFormData((prev) => ({ ...prev, username: remembered, remember: true }));
    }
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
      const result = await login({
        email: username.trim(),
        password,
        remember,
      });

      if (remember) {
        localStorage.setItem(REMEMBER_USERNAME_KEY, username.trim());
      } else {
        localStorage.removeItem(REMEMBER_USERNAME_KEY);
      }

      navigate(DEFAULT_ROUTE_BY_ROLE[result.role] ?? "/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* ── Left: form panel ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20 xl:px-24 3xl:px-32">
        <div className="mx-auto w-full max-w-105 3xl:max-w-130 5xl:max-w-175">

          {/* Logo + brand */}
          <div className="flex items-center gap-3 mb-8 3xl:mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
              <Logo size={34} className="h-full w-full object-contain" />
            </div>
            <span className="text-[18px] 3xl:text-[22px] font-bold text-brand-900">
              Rake Dispatch Management System
            </span>
          </div>

          {/* Hero image on mobile */}
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:hidden">
            <img src={LOGIN_HERO_IMAGE} alt="Freight rail logistics" className="h-42 w-full object-cover" />
          </div>

          <h1 className="text-[30px] sm:text-[36px] 3xl:text-[44px] font-bold text-brand-900 leading-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] sm:text-[15px] 3xl:text-[18px] text-slate-500">
            Sign in with your credentials to access the system.
          </p>

          {/* Error banner */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-slideDown" role="alert">
              <p className="text-[13px] 3xl:text-[15px] font-semibold text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5 3xl:space-y-7" noValidate>
            <div>
              <label htmlFor="login-email"
                className="block text-[13px] sm:text-[14px] 3xl:text-[17px] font-semibold text-brand-900 mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 3xl:py-4 text-[14px] 3xl:text-[17px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label htmlFor="login-password"
                className="block text-[13px] sm:text-[14px] 3xl:text-[17px] font-semibold text-brand-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 3xl:py-4 text-[14px] 3xl:text-[17px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => handleChange("remember", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-[13px] 3xl:text-[16px] text-slate-600">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-6 py-3.5 3xl:py-4 text-[15px] 3xl:text-[18px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="font-bold text-xs text-blue-600 text-center mt-10">
          <a href="https://thinkerscave.com/" target="_blank" rel="noreferrer">
            Powered By @ThinkersCave Technologies
          </a>
        </p>
      </div>

      {/* ── Right: hero image ── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden">
        <img
          src={LOGIN_HERO_IMAGE}
          alt="Freight rail logistics"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 3xl:p-12">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 3xl:p-8 border border-white/20">
            <h3 className="text-[22px] 3xl:text-[28px] font-bold text-white">
              Efficient Industrial Logistics
            </h3>
            <p className="mt-2 text-[14px] 3xl:text-[17px] text-white/80">
              Real-time tracking and automated dispatch management for heavy industry operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
