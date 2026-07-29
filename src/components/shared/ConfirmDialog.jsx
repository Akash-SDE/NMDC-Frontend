import { useId } from "react";
import Modal from "./Modal";
import { uniformSecondaryButtonClass } from "./UniformUi";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
}) {
  const variants = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      btnBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      btnBg: "bg-amber-600 hover:bg-amber-700",
    },
  };

  const v = variants[variant] || variants.danger;
  const titleId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" labelledBy={titleId} size="sm">
      <div className="text-center">
        {/* Warning icon */}
        <div
          className={`mx-auto flex h-14 w-14 3xl:h-18 3xl:w-18 items-center justify-center rounded-full ${v.iconBg} mb-4 3xl:mb-6`}
          aria-hidden="true"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${v.iconColor} 3xl:w-9 3xl:h-9`}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h3
          id={titleId}
          className="mb-2 text-[18px] font-bold text-slate-800 3xl:text-[22px] 5xl:text-[28px]"
        >
          {title}
        </h3>

        {/* Message */}
        <p className="text-[14px] 3xl:text-[16px] 5xl:text-[20px] text-slate-500 leading-relaxed mb-1">
          {message}
        </p>

        {/* Item name highlight */}
        {itemName && (
          <p className="mb-6 text-[14px] font-semibold text-slate-800 3xl:mb-8 3xl:text-[16px] 5xl:text-[20px]">
            "{itemName}"
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 3xl:gap-4 justify-center mt-6 3xl:mt-8">
          <button
            type="button"
            onClick={onClose}
            className={`${uniformSecondaryButtonClass} flex-1 px-5 py-2.5 text-[14px] 3xl:px-6 3xl:py-3 3xl:text-[16px] 5xl:px-8 5xl:py-4 5xl:text-[20px]`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] 3xl:px-6 3xl:py-3 3xl:text-[16px] 5xl:px-8 5xl:py-4 5xl:text-[20px] ${v.btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
