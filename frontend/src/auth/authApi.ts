import { apiFetch } from "../api/client";
import type { CurrentUser, TokenResponse } from "./types";

export async function login(params: {
  phone: string;
  password: string;
}): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      phone: params.phone,
      password: params.password
    })
  });
}

export async function me(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/auth/me", { method: "GET" });
}

