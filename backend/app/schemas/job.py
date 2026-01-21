from __future__ import annotations

from datetime import date as Date, time as Time
from decimal import Decimal

from pydantic import BaseModel, Field


class JobBase(BaseModel):
    date: Date
    vehicle_id: int
    job_type: str = Field(min_length=1, max_length=50)
    from_location: str = Field(min_length=1, max_length=200)
    to_location: str = Field(min_length=1, max_length=200)
    trip_count: int = Field(default=1, ge=1, le=1000)
    income_amount: Decimal | None = None
    fuel_amount: Decimal | None = Field(default=None, ge=0, description="Yakıt miktarı (litre)")
    odometer_start: int | None = Field(default=None, ge=0, description="Başlangıç kilometre")
    odometer_end: int | None = Field(default=None, ge=0, description="Bitiş kilometre")
    description: str | None = None
    start_time: Time | None = None
    end_time: Time | None = None


class JobCreate(JobBase):
    # Admin için zorunlu; driver için backend bunu current_user.id yapacak.
    driver_id: int | None = None


class JobUpdate(BaseModel):
    date: Date | None = None
    vehicle_id: int | None = None
    driver_id: int | None = None
    job_type: str | None = Field(default=None, min_length=1, max_length=50)
    from_location: str | None = Field(default=None, min_length=1, max_length=200)
    to_location: str | None = Field(default=None, min_length=1, max_length=200)
    trip_count: int | None = Field(default=None, ge=1, le=1000)
    income_amount: Decimal | None = None
    fuel_amount: Decimal | None = Field(default=None, ge=0, description="Yakıt miktarı (litre)")
    odometer_start: int | None = Field(default=None, ge=0, description="Başlangıç kilometre")
    odometer_end: int | None = Field(default=None, ge=0, description="Bitiş kilometre")
    description: str | None = None
    start_time: Time | None = None
    end_time: Time | None = None


class JobOut(JobBase):
    id: int
    company_id: int
    driver_id: int

    class Config:
        from_attributes = True

