from __future__ import annotations

from datetime import date as Date
from decimal import Decimal

from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    date: Date
    vehicle_id: int
    expense_type: str = Field(min_length=1, max_length=50)
    amount: Decimal = Field(gt=0)
    description: str | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    date: Date | None = None
    vehicle_id: int | None = None
    expense_type: str | None = Field(default=None, min_length=1, max_length=50)
    amount: Decimal | None = Field(default=None, gt=0)
    description: str | None = None


class ExpenseOut(ExpenseBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True

