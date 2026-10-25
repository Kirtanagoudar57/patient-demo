import axios, { AxiosError } from "axios";
import { tokenStorage } from "../lib/tokenStorage";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

// One shared Axios instance for every request to the FastAPI backend.
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach the bearer token (if any) to every request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Session expiry handling -------------------------------------------------
// AuthContext registers a handler here. When a protected request comes back 401
// (expired or invalid token), we call it once so the app logs out and the
// router sends the user to /login. Requests to /auth/* are excluded so a wrong
// password on the login form never triggers a redirect loop.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint = url.startsWith("/auth/");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      onUnauthorized?.();
    }
    return Promise.reject(toApiError(error));
  },
);

// --- Consistent error shape --------------------------------------------------
export class ApiError extends Error {
  status: number | null;
  /** Field-level messages from FastAPI 422 responses, keyed by field name. */
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number | null, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface FastApiValidationItem {
  loc?: Array<string | number>;
  msg?: string;
}

// Pydantic prefixes custom validator errors with "Value error, ".
function cleanMessage(msg: string): string {
  return msg.replace(/^Value error,\s*/i, "");
}

function toApiError(error: AxiosError): ApiError {
  if (!error.response) {
    const message =
      error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : "Cannot reach the server. Make sure the FastAPI backend is running.";
    return new ApiError(message, null);
  }

  const { status, data } = error.response;
  const detail = (data as { detail?: unknown } | undefined)?.detail;

  // HTTPException(detail="...") -> { "detail": "..." }
  if (typeof detail === "string") {
    return new ApiError(detail, status);
  }

  // Request validation errors -> { "detail": [{ loc, msg, type }, ...] }
  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    const messages: string[] = [];
    for (const item of detail as FastApiValidationItem[]) {
      const msg = cleanMessage(item.msg ?? "Invalid value");
      const loc = (item.loc ?? []).filter((part) => part !== "body");
      const field = loc.length ? String(loc[loc.length - 1]) : "";
      if (field && !fieldErrors[field]) fieldErrors[field] = msg;
      messages.push(field ? `${field}: ${msg}` : msg);
    }
    return new ApiError(messages[0] ?? "Validation failed.", status, fieldErrors);
  }

  const fallback: Record<number, string> = {
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to do that.",
    404: "The requested resource was not found.",
    500: "The server encountered an error. Please try again later.",
  };
  return new ApiError(fallback[status] ?? `Request failed (HTTP ${status}).`, status);
}

/** Turns any thrown value into a human-readable message. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
