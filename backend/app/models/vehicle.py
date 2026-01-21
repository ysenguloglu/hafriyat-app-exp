from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import CompanyScopedMixin, TimestampMixin


class Vehicle(Base, CompanyScopedMixin, TimestampMixin):
    __tablename__ = "vehicles"
    __table_args__ = (
        UniqueConstraint("company_id", "plate", name="uq_vehicles_company_plate"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    plate: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    vehicle_type: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    
    # Mevcut kilometre (son kaydedilen)
    current_odometer: Mapped[int | None] = mapped_column(Integer, nullable=True)

    company = relationship("Company", back_populates="vehicles")
    jobs = relationship("Job", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
