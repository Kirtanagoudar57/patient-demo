import type { SessionUser } from "../types/auth";

interface JwtPayload {
  sub?: string;
  exp?: number;
}

// Reads the (unverified) payload of a JWT. This is only for display and for
// knowing when the session ends; the backend still verifies every request.
export function decodeToken(token: string): SessionUser | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as JwtPayload;
    if (!payload.sub || typeof payload.exp !== "number") return null;
    return { username: payload.sub, expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}

export function isExpired(user: SessionUser, now = Date.now()): boolean {
  return user.expiresAt <= now;
}
