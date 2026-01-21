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
    let message = "İstek başarısız";
    
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      // Pydantic validation errors
      const errors = data.detail as Array<{ loc: (string | number)[]; msg: string; type: string }>;
      message = errors.map(e => {
        const field = e.loc.slice(1).join("."); // Remove "body" from location
        return `${field}: ${e.msg}`;
      }).join(", ");
    }
    
    return { status, message };
  } catch {
    return { status, message: "İstek başarısız" };
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

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      clearToken();
    }
    if (!res.ok) throw await parseError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (error: any) {
    // Network hatası (failed to fetch)
    if (error instanceof TypeError || error?.message?.includes("fetch") || error?.message?.includes("network")) {
      throw { status: 0, message: "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin." };
    }
    throw error;
  }
}

