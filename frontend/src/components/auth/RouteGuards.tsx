import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export interface LoginRedirectState {
  from?: string;
}

/**
 * Renders protected pages only when a (non-expired) token is present.
 * This is a UX convenience; the FastAPI backend still rejects any request
 * without a valid token, which is what actually protects the data.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    const state: LoginRedirectState = { from: location.pathname + location.search };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}

/**
 * Login/signup pages: signed-in users are sent on, either back to the page they
 * originally asked for (set by ProtectedRoute) or to the dashboard.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) {
    const from = (location.state as LoginRedirectState | null)?.from;
    const target = from && from.startsWith("/") && !from.startsWith("/login") ? from : "/dashboard";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
