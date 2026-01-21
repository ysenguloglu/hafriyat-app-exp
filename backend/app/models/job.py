from __future__ import annotations

from datetime import date, time
from decimal import Decimal

from sqlalchemy import BigInteger, Date, ForeignKey, Integer, Numeric, String, Text, Index, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import CompanyScopedMixin, TimestampMixin


class Job(Base, CompanyScopedMixin, TimestampMixin):
    __tablename__ = "jobs"
    __table_args__ = (
        Index("ix_jobs_company_date", "company_id", "date"),
        Index("ix_jobs_company_driver_date", "company_id", "driver_id", "date"),
        Index("ix_jobs_company_vehicle_date", "company_id", "vehicle_id", "date"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # İş saatleri (opsiyonel)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    vehicle_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("vehicles.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    driver_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    job_type: Mapped[str] = mapped_column(String(50), nullable=False)
    from_location: Mapped[str] = mapped_column(String(200), nullable=False)
    to_location: Mapped[str] = mapped_column(String(200), nullable=False)
    trip_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Her iş kaydında gelir olabilir; feature flag ile görünürlük kontrol edilecek (ileriki adım).
    income_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    # Yakıt miktarı (litre cinsinden)
    fuel_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Kilometre takibi (opsiyonel)
    odometer_start: Mapped[int | None] = mapped_column(Integer, nullable=True)
    odometer_end: Mapped[int | None] = mapped_column(Integer, nullable=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    company = relationship("Company", back_populates="jobs")
    vehicle = relationship("Vehicle", back_populates="jobs")
    driver = relationship("User", back_populates="jobs")
