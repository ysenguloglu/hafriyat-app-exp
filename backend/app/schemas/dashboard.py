from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_trip_count: int
    total_income: Decimal | None
    total_expense: Decimal
    net_profit: Decimal | None
    active_vehicle_count: int
    total_work_hours: float | None  # Toplam çalışma saatleri (ondalık)
    total_fuel_amount: Decimal | None  # Toplam yakıt miktarı (litre)
    total_distance_km: int | None  # Toplam gidilen kilometre

