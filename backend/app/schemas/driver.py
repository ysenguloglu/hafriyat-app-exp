from __future__ import annotations

from pydantic import BaseModel, Field


class DriverBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    phone: str = Field(min_length=5, max_length=32)


class DriverCreate(DriverBase):
    password: str = Field(min_length=6, max_length=128)


class DriverUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = Field(default=None, min_length=5, max_length=32)
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)


class DriverOut(DriverBase):
    id: int
    company_id: int
    role: str
    is_active: bool

    class Config:
        from_attributes = True

