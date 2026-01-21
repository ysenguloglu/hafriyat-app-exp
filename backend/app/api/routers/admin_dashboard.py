from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_company_settings, require_admin
from app.db.session import get_db
from app.models.expense import Expense
from app.models.job import Job
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.dashboard import DashboardSummary


router = APIRouter(prefix="/admin/dashboard", tags=["admin"])


@router.get("", response_model=DashboardSummary)
def dashboard_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    settings=Depends(get_company_settings),
) -> DashboardSummary:
    if start_date > end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Başlangıç tarihi bitiş tarihinden büyük olamaz")

    company_id = admin_user.company_id
    enable_income = bool(settings.enable_income_tracking) if settings else False

    total_trip_count = db.scalar(
        select(func.coalesce(func.sum(Job.trip_count), 0)).where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
        )
    )

    total_expense = db.scalar(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.company_id == company_id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
    )

    active_vehicle_count = db.scalar(
        select(func.count()).select_from(Vehicle).where(
            Vehicle.company_id == company_id,
            Vehicle.is_active.is_(True),
        )
    )

    # Toplam yakıt miktarı
    total_fuel = db.scalar(
        select(func.coalesce(func.sum(Job.fuel_amount), 0)).where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
            Job.fuel_amount.isnot(None),
        )
    )

    # Toplam çalışma saatleri hesapla
    jobs_with_times = db.execute(
        select(Job.start_time, Job.end_time).where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
            Job.start_time.isnot(None),
            Job.end_time.isnot(None),
        )
    ).all()

    total_work_hours = None
    if jobs_with_times:
        total_seconds = 0
        for start, end in jobs_with_times:
            # Time objelerini saniyeye çevir
            start_seconds = start.hour * 3600 + start.minute * 60 + (start.second or 0)
            end_seconds = end.hour * 3600 + end.minute * 60 + (end.second or 0)
            
            if end_seconds < start_seconds:
                # Gece yarısını geçmişse (24 saat ekle)
                end_seconds += 24 * 3600
            
            diff_seconds = end_seconds - start_seconds
            total_seconds += diff_seconds
        total_work_hours = round(total_seconds / 3600.0, 2)  # Saate çevir, 2 ondalık

    # Toplam gidilen kilometre hesapla (odometer_end - odometer_start)
    total_distance = db.scalar(
        select(
            func.coalesce(
                func.sum(Job.odometer_end - Job.odometer_start),
                0
            )
        ).where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
            Job.odometer_start.isnot(None),
            Job.odometer_end.isnot(None),
        )
    )
    total_distance_km = int(total_distance) if total_distance and total_distance > 0 else None

    if enable_income:
        total_income = db.scalar(
            select(func.coalesce(func.sum(Job.income_amount), 0)).where(
                Job.company_id == company_id,
                Job.date >= start_date,
                Job.date <= end_date,
            )
        )
        # MySQL SUM(DECIMAL) => Decimal or numeric; coalesce(0) -> int, normalize
        total_income_dec = Decimal(str(total_income))
        total_expense_dec = Decimal(str(total_expense))
        net_profit = total_income_dec - total_expense_dec
        return DashboardSummary(
            total_trip_count=int(total_trip_count or 0),
            total_income=total_income_dec,
            total_expense=total_expense_dec,
            net_profit=net_profit,
            active_vehicle_count=int(active_vehicle_count or 0),
            total_work_hours=total_work_hours,
            total_fuel_amount=Decimal(str(total_fuel)) if total_fuel else None,
            total_distance_km=total_distance_km,
        )

    # Gelir takibi kapalıysa gelir/net kâr görünmez
    return DashboardSummary(
        total_trip_count=int(total_trip_count or 0),
        total_income=None,
        total_expense=Decimal(str(total_expense)),
        net_profit=None,
        active_vehicle_count=int(active_vehicle_count or 0),
        total_work_hours=total_work_hours,
        total_fuel_amount=Decimal(str(total_fuel)) if total_fuel else None,
        total_distance_km=total_distance_km,
    )

