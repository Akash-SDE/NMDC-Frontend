export function EmptyState({ title = "No records found", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export default EmptyState;
