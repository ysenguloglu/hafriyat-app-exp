from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class JobBase(BaseModel):
    date: date
    vehicle_id: int
    job_type: str = Field(min_length=1, max_length=50)
    from_location: str = Field(min_length=1, max_length=200)
    to_location: str = Field(min_length=1, max_length=200)
    trip_count: int = Field(default=1, ge=1, le=1000)
    income_amount: Decimal | None = None
    description: str | None = None


class JobCreate(JobBase):
    # Admin için zorunlu; driver için backend bunu current_user.id yapacak.
    driver_id: int | None = None


class JobUpdate(BaseModel):
    date: date | None = None
    vehicle_id: int | None = None
    driver_id: int | None = None
    job_type: str | None = Field(default=None, min_length=1, max_length=50)
    from_location: str | None = Field(default=None, min_length=1, max_length=200)
    to_location: str | None = Field(default=None, min_length=1, max_length=200)
    trip_count: int | None = Field(default=None, ge=1, le=1000)
    income_amount: Decimal | None = None
    description: str | None = None


class JobOut(JobBase):
    id: int
    company_id: int
    driver_id: int

    class Config:
        from_attributes = True

