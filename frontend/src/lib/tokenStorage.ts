// The FastAPI backend returns the JWT in the response body and reads it from
// the `Authorization: Bearer <token>` header (OAuth2PasswordBearer). It does not
// set cookies, so the token has to be stored by JavaScript. localStorage keeps
// the user signed in across reloads; the token itself expires after
// ACCESS_TOKEN_EXPIRE_MINUTES (30 by default) on the backend.
const TOKEN_KEY = "carepoint.access_token";

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage can be unavailable (private mode); the session then lasts until reload.
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
