from __future__ import annotations

from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    plate: str = Field(min_length=2, max_length=20)
    vehicle_type: str = Field(min_length=1, max_length=50)
    current_odometer: int | None = Field(default=None, ge=0, description="Mevcut kilometre")


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    plate: str | None = Field(default=None, min_length=2, max_length=20)
    vehicle_type: str | None = Field(default=None, min_length=1, max_length=50)
    is_active: bool | None = None
    current_odometer: int | None = Field(default=None, ge=0, description="Mevcut kilometre")


class VehicleOut(VehicleBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

