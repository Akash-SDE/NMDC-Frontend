export function LoadingState({ message = "Loading…" }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export default LoadingState;
