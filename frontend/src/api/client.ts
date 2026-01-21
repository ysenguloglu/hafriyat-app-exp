import { API_BASE_URL } from "../env";
import { getToken, clearToken } from "../auth/token";

export type ApiError = {
  status: number;
  message: string;
};

async function parseError(res: Response): Promise<ApiError> {
  const status = res.status;
  try {
    const data = (await res.json()) as { detail?: unknown };
    const message = typeof data?.detail === "string" ? data.detail : "Request failed";
    return { status, message };
  } catch {
    return { status, message: "Request failed" };
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const auth = options.auth !== false;
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearToken();
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

