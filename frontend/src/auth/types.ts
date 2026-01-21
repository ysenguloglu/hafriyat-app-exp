export type Role = "admin" | "driver";

export type CurrentUser = {
  id: number;
  company_id: number;
  name: string;
  phone: string;
  role: Role;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

