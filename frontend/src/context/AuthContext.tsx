import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { setUnauthorizedHandler } from "../services/api";
import { authService } from "../services/authService";
import { decodeToken, isExpired } from "../lib/jwt";
import { tokenStorage } from "../lib/tokenStorage";
import type { LoginRequest, SessionUser } from "../types/auth";

export type LogoutReason = "manual" | "expired";

export interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** Set when the last logout happened because the session expired. */
  logoutReason: LogoutReason | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: (reason?: LogoutReason) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Restore a stored token on page load, discarding it if unreadable or expired.
function readInitialUser(): SessionUser | null {
  const token = tokenStorage.get();
  if (!token) return null;
  const user = decodeToken(token);
  if (!user || isExpired(user)) {
    tokenStorage.clear();
    return null;
  }
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readInitialUser);
  const [logoutReason, setLogoutReason] = useState<LogoutReason | null>(null);

  const logout = useCallback((reason: LogoutReason = "manual") => {
    tokenStorage.clear();
    setUser(null);
    setLogoutReason(reason);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { access_token } = await authService.login(credentials);
    const sessionUser = decodeToken(access_token);
    if (!sessionUser) {
      throw new Error("The server returned an unreadable token.");
    }
    tokenStorage.set(access_token);
    setLogoutReason(null);
    setUser(sessionUser);
  }, []);

  // A 401 from any protected endpoint means the token is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(() => logout("expired"));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Log out automatically at the moment the token expires.
  useEffect(() => {
    if (!user) return;
    const msLeft = user.expiresAt - Date.now();
    // setTimeout overflows above ~24.8 days; tokens here last minutes.
    const timer = window.setTimeout(() => logout("expired"), Math.min(Math.max(msLeft, 0), 2 ** 31 - 1));
    return () => window.clearTimeout(timer);
  }, [user, logout]);

  // Keep several open tabs in sync (logging out in one logs out all).
  useEffect(() => {
    const onStorage = () => setUser(readInitialUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, logoutReason, login, logout }),
    [user, logoutReason, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
