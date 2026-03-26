import { useRouter } from "../../context/RouterContext";

export default function Header() {
  const { user } = useRouter();

  const initials = (user?.name || "User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const roleLabel = (user?.role || "admin")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(" ");

  const normalizedUsername = (user?.username || "admin")
    .toLowerCase()
    .replace(/\s+/g, ".");
  const email = user?.email || `${normalizedUsername}@nmdc.local`;

  return (
    <header className="sticky top-0 z-100 shadow-lg bg-[#F3F5F8] py-2">
      <div className="flex h-15.5 items-center justify-between rounded-xl px-3 sm:px-4 lg:px-5">
        <div className="min-w-0 pr-3">
          <h1 className="truncate text-[18px] font-extrabold leading-none text-[#1f4ec9] sm:text-[26px]">
            RAKE DISPATCH MANAGEMENT SYSTEM
          </h1>
          <p className="mt-1 truncate text-[14px] font-bold leading-none text-black sm:text-[22px]">
            BIOM Bacheli Complex, Dantewada(C.G.)
          </p>
        </div>

        <div className="group relative">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-linear-to-br from-[#164ba5] to-[#0f2f67] text-[12px] font-bold text-white"
            aria-label="Profile"
          >
            {initials}
          </button>

          <div className="pointer-events-none absolute right-0 top-12 z-40 w-56 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            <p className="text-xs font-semibold text-slate-800">{email}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
