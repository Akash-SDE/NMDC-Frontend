import { useEffect, useRef, useState } from "react";
import { useRouter } from "../../context/RouterContext";
import { useAuth } from "../../context/AuthContext";
import { MenuIcon } from "../icons";

/* ── helpers ─────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

/* ── Profile popup ───────────────────────────────────────────── */
function ProfilePopup({ profile, userRole, onClose, onLogout }) {
  const popupRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  /* close on Escape */
  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const firstName  = profile?.first_name ?? "";
  const lastName   = profile?.last_name  ?? "";
  const fullName   = `${firstName} ${lastName}`.trim() || "User";
  const email      = profile?.email      ?? "—";
  const phone      = profile?.phone_number
    ? `${profile.country_code ? `+${profile.country_code} ` : ""}${profile.phone_number}`
    : "—";
  const org        = profile?.organisation_name ?? "—";
  const lastLogin  = formatDate(profile?.last_login);
  const createdOn  = formatDate(profile?.created_on);
  const status     = profile?.status;
  const isSuperuser = profile?.is_superuser;

  const roles      = Array.isArray(profile?.role) && profile.role.length > 0
    ? profile.role.map((r) => r.role_name ?? r).join(", ")
    : isSuperuser ? "Superuser" : userRole ?? "—";

  const initials = getInitials(firstName, lastName);

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fadeIn"
      role="dialog"
      aria-label="Profile details"
    >
      {/* ── colour header ── */}
      <div className="bg-gradient-to-r from-[#164ba5] to-[#0f2f67] px-5 py-5">
        <div className="flex items-center gap-3">
          {/* avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-[16px] font-bold text-white ring-2 ring-white/30">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-white">{fullName}</p>
            <p className="truncate text-[12px] text-blue-200">{email}</p>
          </div>
        </div>

        {/* status + superuser badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {status !== undefined && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              status ? "bg-emerald-400/30 text-emerald-100" : "bg-slate-400/30 text-slate-200"
            }`}>
              {status ? "● Active" : "● Inactive"}
            </span>
          )}
          {isSuperuser && (
            <span className="rounded-full bg-amber-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-100">
              ★ Superuser
            </span>
          )}
        </div>
      </div>

      {/* ── detail rows ── */}
      <div className="divide-y divide-slate-100 px-1">
        {[
          { icon: shieldIcon,   label: "Role",         value: roles },
          { icon: phoneIcon,    label: "Phone",        value: phone },
          { icon: buildingIcon, label: "Organisation", value: org },
          { icon: clockIcon,    label: "Last Login",   value: lastLogin },
          { icon: calendarIcon, label: "Member Since", value: createdOn },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 px-4 py-2.5">
            <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-0.5 truncate text-[12px] font-medium text-slate-700">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── sign out ── */}
      <div className="border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* tiny inline SVG icons used in the detail rows */
const shieldIcon = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v6c0 5.25 3.75 10.17 9 11.38C17.25 23.17 21 18.25 21 13V7l-9-5z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const phoneIcon = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.7a16 16 0 006.29 6.29l1.22-1.22a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const buildingIcon = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);
const clockIcon = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
  </svg>
);
const calendarIcon = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ── Header ──────────────────────────────────────────────────── */
export default function Header({ onMenuClick }) {
  const { userRole, logout } = useRouter();
  const { profile } = useAuth();
  const [popupOpen, setPopupOpen] = useState(false);

  const firstName = profile?.first_name ?? "";
  const lastName  = profile?.last_name  ?? "";
  const initials  = getInitials(firstName, lastName);

  function handleLogout() {
    setPopupOpen(false);
    logout();
  }

  return (
    <header className="sticky top-0 z-100 shadow-lg bg-[#F3F5F8] py-2">
      <div className="flex h-15.5 items-center justify-between rounded-xl px-3 sm:px-4 lg:px-5">

        {/* left: mobile menu + title */}
        <div className="flex min-w-0 items-center gap-2 pr-3 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[14px] font-extrabold leading-none text-[#1f4ec9] sm:text-[26px]">
              RAKE DISPATCH MANAGEMENT SYSTEM
            </h1>
            <p className="mt-1 truncate text-[11px] font-bold leading-none text-black sm:text-[22px]">
              BIOM Bacheli Complex, Dantewada(C.G.)
            </p>
          </div>
        </div>

        {/* right: profile button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPopupOpen((p) => !p)}
            aria-label="Open profile"
            aria-expanded={popupOpen}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#164ba5] to-[#0f2f67] text-[12px] font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {initials}
          </button>

          {popupOpen && (
            <ProfilePopup
              profile={profile}
              userRole={userRole}
              onClose={() => setPopupOpen(false)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
