from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_trip_count: int
    total_income: Decimal | None
    total_expense: Decimal
    net_profit: Decimal | None
    active_vehicle_count: int

