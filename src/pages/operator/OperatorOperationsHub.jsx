export default function OperatorOperationsHub() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-800">Operator Operations Hub</h2>
        <p className="mt-1 text-sm text-slate-500">
          Operator workflow includes rake offering, loading updates, and delay recording.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Create Rake Offering</h3>
          <p className="mt-2 text-sm text-slate-500">Capture rake details and offer for loading.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Update Loading</h3>
          <p className="mt-2 text-sm text-slate-500">Record tonnage, wagon condition, and completion times.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Log Delays</h3>
          <p className="mt-2 text-sm text-slate-500">Capture delay category, duration, and reason.</p>
        </article>
      </section>
    </div>
  );
}
