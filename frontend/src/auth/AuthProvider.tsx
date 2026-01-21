import React from "react";
import { clearToken, getToken, setToken } from "./token";
import type { CurrentUser, Role } from "./types";
import { login as loginApi, me as meApi, signup as signupApi } from "./authApi";

type AuthState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "authed"; user: CurrentUser };

type AuthContextValue = {
  state: AuthState;
  refresh: () => Promise<void>;
  signup: (params: { company_name: string; admin_name: string; admin_phone: string; admin_password: string }) => Promise<void>;
  login: (params: { phone: string; password: string }) => Promise<void>;
  logout: () => void;
  role: Role | null;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({ status: "loading" });

  const refresh = React.useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ status: "anon" });
      return;
    }
    try {
      const user = await meApi();
      setState({ status: "authed", user });
    } catch {
      clearToken();
      setState({ status: "anon" });
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signup = React.useCallback(
    async (params: { company_name: string; admin_name: string; admin_phone: string; admin_password: string }) => {
      const token = await signupApi(params);
      setToken(token.access_token);
      await refresh();
    },
    [refresh]
  );

  const login = React.useCallback(
    async (params: { phone: string; password: string }) => {
      const token = await loginApi({
        phone: params.phone,
        password: params.password
      });
      setToken(token.access_token);
      await refresh();
    },
    [refresh]
  );

  const logout = React.useCallback(() => {
    clearToken();
    setState({ status: "anon" });
  }, []);

  const role = state.status === "authed" ? state.user.role : null;

  const value: AuthContextValue = { state, refresh, signup, login, logout, role };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

