import { useEffect, useRef } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

      {/* Modal content */}
      <div
        ref={contentRef}
        className={`
          relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl
          animate-slideUp overflow-hidden
          3xl:max-w-3xl 5xl:max-w-5xl
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 3xl:px-8 3xl:py-6 5xl:px-10 5xl:py-8 border-b border-slate-100">
          <div>
            <h3 className="text-[18px] sm:text-[20px] 3xl:text-[24px] 5xl:text-[32px] font-bold text-slate-800">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-[13px] 3xl:text-[15px] 5xl:text-[20px] text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 3xl:h-11 3xl:w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors -mt-1"
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 3xl:px-8 3xl:py-6 5xl:px-10 5xl:py-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
