/**
 * Normalized API error for UI consumption.
 * Use normalizeApiError() to turn fetch Response or Error into this shape.
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "Please check your input and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Server error. Please try again later.",
  502: "Bad gateway. Please try again later.",
  503: "Service unavailable. Please try again later.",
};

const STATUS_CODES: Record<number, string> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "SERVER_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
};

/**
 * Normalizes a failed fetch Response or an Error into a consistent ApiError for UI.
 */
export async function normalizeApiError(
  responseOrError: Response | Error
): Promise<ApiError> {
  if (responseOrError instanceof Response) {
    const status = responseOrError.status;
    let message = STATUS_MESSAGES[status];
    try {
      const body = await responseOrError.json();
      const raw = (body && (body.message ?? body.error ?? body.msg)) ?? null;
      if (typeof raw === "string" && raw.length > 0) message = raw;
    } catch {
      // keep default message
    }
    return {
      message: message ?? "An error occurred. Please try again.",
      code: STATUS_CODES[status] ?? "REQUEST_FAILED",
      status,
    };
  }

  const err = responseOrError as Error;
  const message =
    err.name === "AbortError"
      ? "Request was cancelled."
      : err.message || "An unexpected error occurred. Please try again.";
  return {
    message,
    code: err.name === "TypeError" && err.message?.includes("fetch") ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
  };
}

/**
 * From an unknown catch value, returns a string message safe for UI display.
 */
export function getDisplayMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "Request was cancelled.";
    return error.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
