import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE } from "../../../constants/roles";
import { SESSION_EXPIRED_FLAG_KEY } from "../../../constants/storageKeys";
import { Logo } from "../../../components/icons";

const LOGIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80";
const REMEMBER_USERNAME_KEY = "nmdc_remembered_username";

export default function LoginPage() {
  const { login, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [error, setError] = useState("");
  const [info, setInfo] = useState(() =>
    sessionStorage.getItem(SESSION_EXPIRED_FLAG_KEY)
      ? "Your session has expired. Please sign in again."
      : "",
  );
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    remember: false,
  });

  useEffect(() => {
    sessionStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    const remembered = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (remembered) {
      setFormData((prev) => ({ ...prev, email: remembered, remember: true }));
    }
  }, []);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (info) setInfo("");
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const email = formData.email.trim();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtp(email);
      setStep("otp");
      setFormData((prev) => ({ ...prev, otp: "" }));
      if (result?.otp) {
        setInfo(`OTP sent. For local/demo use: ${result.otp}`);
      } else {
        setInfo(`OTP sent to ${email}. Check your inbox.`);
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    const { email, otp, remember } = formData;

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const result = await login({
        email: email.trim(),
        otp: otp.trim(),
        remember,
      });

      if (remember) {
        localStorage.setItem(REMEMBER_USERNAME_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_USERNAME_KEY);
      }

      navigate(DEFAULT_ROUTE_BY_ROLE[result.role] ?? "/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeEmail() {
    setStep("email");
    setFormData((prev) => ({ ...prev, otp: "" }));
    setError("");
    setInfo("");
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
            {step === "email"
              ? "Sign in with your email. We’ll send a one-time password."
              : `Enter the OTP sent to ${formData.email.trim()}.`}
          </p>

          {/* Error / info banners */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-slideDown" role="alert">
              <p className="text-[13px] 3xl:text-[15px] font-semibold text-red-600">{error}</p>
            </div>
          )}
          {!error && info && (
            <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 animate-slideDown" role="status">
              <p className="text-[13px] 3xl:text-[15px] font-semibold text-brand-800">{info}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="mt-8 space-y-5 3xl:space-y-7" noValidate>
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
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 3xl:py-4 text-[14px] 3xl:text-[17px] text-brand-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
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
                    Sending OTP…
                  </span>
                ) : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5 3xl:space-y-7" noValidate>
              <div>
                <label htmlFor="login-otp"
                  className="block text-[13px] sm:text-[14px] 3xl:text-[17px] font-semibold text-brand-900 mb-2">
                  One-time password
                </label>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => handleChange("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 3xl:py-4 text-[14px] 3xl:text-[17px] tracking-[0.35em] text-brand-900 placeholder-slate-400 placeholder:tracking-normal outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-[13px] 3xl:text-[16px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  Change email
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="text-[13px] 3xl:text-[16px] font-semibold text-slate-600 hover:text-brand-700 disabled:opacity-60"
                >
                  Resend OTP
                </button>
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
                    Verifying…
                  </span>
                ) : "Verify & Sign In"}
              </button>
            </form>
          )}
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
