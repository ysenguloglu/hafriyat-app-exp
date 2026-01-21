from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import TimestampMixin


class CompanySettings(Base, TimestampMixin):
    __tablename__ = "company_settings"
    __table_args__ = (
        UniqueConstraint("company_id", name="uq_company_settings_company_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Feature flags: varsayılan olarak tüm özellikler açık (müşteri kullanabilsin)
    enable_income_tracking: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    enable_driver_job_entry: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    enable_advanced_reports: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    enable_future_modules: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    company = relationship("Company", back_populates="settings")
