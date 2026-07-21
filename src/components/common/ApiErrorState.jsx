import { getErrorMessage } from "../../api/apiError";

export function ApiErrorState({ error, onRetry, title = "Failed to load data" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-red-700">{title}</h3>
      <p className="max-w-md text-sm text-red-600">{getErrorMessage(error)}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export default ApiErrorState;
