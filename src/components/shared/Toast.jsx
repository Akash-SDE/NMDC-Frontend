import { useEffect, useState } from "react";

const iconMap = {
  success: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-emerald-500 3xl:w-6 3xl:h-6"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  error: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-red-500 3xl:w-6 3xl:h-6"
    >
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  ),
};

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2700);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast || !visible) return null;

  const bgColor =
    toast.type === "error"
      ? "border-red-200 bg-red-50"
      : "border-emerald-200 bg-emerald-50";

  return (
    <div className="fixed top-6 right-6 3xl:top-10 3xl:right-10 z-[200] animate-slideDown">
      <div
        className={`flex items-center gap-3 3xl:gap-4 rounded-xl border px-5 py-3.5 3xl:px-7 3xl:py-5 5xl:px-9 5xl:py-6 shadow-lg ${bgColor}`}
      >
        {iconMap[toast.type]}
        <span className="text-[14px] 3xl:text-[17px] 5xl:text-[22px] font-semibold text-brand-900">
          {toast.message}
        </span>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 text-slate-400 hover:text-slate-600"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
