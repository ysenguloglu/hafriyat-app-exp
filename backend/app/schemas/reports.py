from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class VehicleReportRow(BaseModel):
    vehicle_id: int
    plate: str
    vehicle_type: str
    total_trip_count: int
    total_income: Decimal | None
    total_expense: Decimal
    net_profit: Decimal | None


class DriverJobSummaryRow(BaseModel):
    driver_id: int
    name: str
    phone: str
    job_count: int
    total_trip_count: int
    total_income: Decimal | None


Granularity = Literal["daily", "weekly", "monthly"]


class TimeSeriesRow(BaseModel):
    granularity: Granularity
    period_start: date
    period_end: date
    total_trip_count: int
    total_income: Decimal | None
    total_expense: Decimal
    net_profit: Decimal | None

