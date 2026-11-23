/**
 * Table shell: body scrolls inside the viewport; header row + column filters stick;
 * footer (pagination) stays visible at the bottom of the panel.
 */
export default function DataTablePanel({
  children,
  footer = null,
  className = "",
  scrollClassName = "",
}) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className={`min-h-0 flex-1 overflow-auto ${scrollClassName}`}>
        {children}
      </div>
      {footer ? (
        <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-2 sm:px-5">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Apply to <thead> so labels and filter row stay visible while tbody scrolls. */
export const STICKY_TABLE_HEAD_CLASS =
  "sticky top-0 z-20 bg-slate-50 shadow-[0_1px_0_0_rgb(226,232,240)] [&>tr:first-child_th]:bg-slate-50 [&>tr:last-child_td]:bg-white";