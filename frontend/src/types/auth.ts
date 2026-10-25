// Mirrors `UserCreate` in app/schemas.py (POST /auth/register, JSON body).
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// POST /auth/register returns 201 with this body.
export interface RegisterResponse {
  message: string;
}

// POST /auth/login uses OAuth2PasswordRequestForm, so it expects
// form-encoded `username` and `password` (not JSON).
export interface LoginRequest {
  username: string;
  password: string;
}

// Mirrors `Token` in app/schemas.py.
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// What we can learn about the signed-in user. The backend has no "current user"
// endpoint, so this comes from the JWT payload created in app/auth.py:
// { "sub": <username>, "exp": <unix seconds> }.
export interface SessionUser {
  username: string;
  expiresAt: number; // milliseconds since epoch
}
