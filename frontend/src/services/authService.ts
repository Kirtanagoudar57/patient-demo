import { api } from "./api";
import type { LoginRequest, RegisterRequest, RegisterResponse, TokenResponse } from "../types/auth";

export const authService = {
  /**
   * POST /auth/login
   * FastAPI's OAuth2PasswordRequestForm reads application/x-www-form-urlencoded
   * fields `username` and `password`. Sending JSON here would return 422.
   */
  async login({ username, password }: LoginRequest): Promise<TokenResponse> {
    const body = new URLSearchParams({ username, password });
    const { data } = await api.post<TokenResponse>("/auth/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },

  /**
   * POST /auth/register (JSON: username, email, password)
   * Returns 201 { message } or 409 if the username or email is taken.
   * It does not log the user in; call login() afterwards.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/auth/register", payload);
    return data;
  },

  // There is no logout endpoint in the backend: JWTs are stateless, so logging
  // out means discarding the token on the client (see AuthContext.logout).
};
