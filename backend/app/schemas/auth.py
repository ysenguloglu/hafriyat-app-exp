from __future__ import annotations

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    phone: str
    password: str


class CurrentUser(BaseModel):
    id: int
    company_id: int
    name: str
    phone: str
    role: str
