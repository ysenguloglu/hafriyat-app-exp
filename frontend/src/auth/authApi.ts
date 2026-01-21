import { apiFetch } from "../api/client";
import type { CurrentUser, TokenResponse } from "./types";

export async function login(params: {
  phone: string;
  password: string;
  company_id?: number;
}): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      phone: params.phone,
      password: params.password,
      company_id: params.company_id ?? null
    })
  });
}

export async function me(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/auth/me", { method: "GET" });
}

