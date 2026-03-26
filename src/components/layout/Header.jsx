import { useRouter } from "../../context/RouterContext";
import { BellIcon, MenuIcon } from "../icons";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-500"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .35 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.35 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.82.35l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .35-1.82A1.7 1.7 0 0 0 3 14H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.03 1.7 1.7 0 0 0-.35-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.82.35h.01A1.7 1.7 0 0 0 10 3.1V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.55h.01a1.7 1.7 0 0 0 1.82-.35l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.35 1.82V9A1.7 1.7 0 0 0 20.9 10H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export default function Header({ onMenuClick }) {
  const { user } = useRouter();

  return (
    <header className="sticky z-100 bg-[#F3F5F8] top-0 py-2">
      <div className="flex h-15.5 items-center gap-3 rounded-xl px-3 sm:px-4 lg:px-5">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon size={20} />
        </button>

        <div className="min-w-0 pr-2 lg:pr-4">
          <h1 className="truncate text-[15px] font-extrabold tracking-tight text-slate-800 sm:text-[18px]">
            RAKE DISPATCH MANAGEMENT
          </h1>
        </div>

        <div className="hidden min-w-55 flex-1 lg:block">
          <div className="relative w-full max-w-115">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search Rakes or Data..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-surface pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:flex"
          aria-label="Notifications"
        >
          <BellIcon size={17} />
        </button>
        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:flex"
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>

        <div className="ml-auto flex items-center gap-2 rounded-lg px-1 py-1 sm:ml-0">
          <div className="hidden text-right sm:block">
            <p className="text-[12px] font-bold text-slate-800">
              {user?.name || "John Operator"}
            </p>
            <p className="text-[10px] font-medium text-slate-500">
              {user?.role ? `${user.role} Command` : "Shift Commander"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-linear-to-br from-[#164ba5] to-[#0f2f67] text-[12px] font-bold text-white">
            {(user?.name || "JO")
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
}
