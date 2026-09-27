export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function parseApiError(error) {
  if (error instanceof ApiError) return error;

  const response = error?.response;
  if (response) {
    const data = response.data ?? {};
    const firstValue = data && typeof data === "object" ? Object.values(data)[0] : null;
    const fieldMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue;
    const message =
      (typeof data === "string" && data.trim()) ||
      data?.detail ||
      data?.non_field_errors?.[0] ||
      (typeof fieldMessage === "string" ? fieldMessage : null) ||
      error.message ||
      `Request failed (${response.status})`;
    return new ApiError(message, response.status, data);
  }

  return new ApiError(error?.message || "Network error", 0);
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (error instanceof ApiError) return error.message;
  if (error?.message) return error.message;
  return fallback;
}
