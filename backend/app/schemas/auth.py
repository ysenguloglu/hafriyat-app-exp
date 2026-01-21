from __future__ import annotations

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    # Multi-tenant: aynı telefon birden fazla firmada olabilir.
    # company_id verilirse login kesinleşir; verilmezse ve birden fazla kayıt varsa hata döner.
    company_id: int | None = None
    phone: str
    password: str


class CurrentUser(BaseModel):
    id: int
    company_id: int
    name: str
    phone: str
    role: str
