from __future__ import annotations

from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import TimestampMixin


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    settings = relationship("CompanySettings", back_populates="company", uselist=False)
    users = relationship("User", back_populates="company")
    vehicles = relationship("Vehicle", back_populates="company")
    jobs = relationship("Job", back_populates="company")
    expenses = relationship("Expense", back_populates="company")
