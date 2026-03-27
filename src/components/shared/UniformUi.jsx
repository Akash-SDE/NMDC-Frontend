export const uniformInputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

export const uniformPrimaryButtonClass =
  "rounded-lg bg-linear-to-r from-blue-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-800 hover:to-blue-700";

export const uniformSecondaryButtonClass =
  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50";

export function UniformFormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

export function UniformSectionCard({ title, subtitle, children, rightSlot }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-[17px] font-extrabold tracking-tight text-[#102a57]">{title}</h3>
          {subtitle ? <p className="mt-1 text-[12px] font-medium text-slate-500">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function UniformPageShell({ title, subtitle, tabs, activeTab, onTabChange, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
        <div className="mb-3">
          <h2 className="text-[24px] font-extrabold leading-tight tracking-tight text-[#102a57]">{title}</h2>
          {subtitle ? <p className="text-[12px] font-medium text-slate-500">{subtitle}</p> : null}
        </div>
        {tabs && tabs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-linear-to-r from-blue-700 to-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="p-4 sm:p-5 lg:p-6">{children}</div>
    </div>
  );
}
