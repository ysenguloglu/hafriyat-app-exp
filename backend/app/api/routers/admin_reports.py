from __future__ import annotations

import calendar
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin, require_advanced_reports
from app.db.session import get_db
from app.models.expense import Expense
from app.models.job import Job
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.reports import DriverJobSummaryRow, TimeSeriesRow, VehicleReportRow


router = APIRouter(prefix="/admin/reports", tags=["admin"])


def _date_range_or_400(start_date: date, end_date: date) -> None:
    if start_date > end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date must be <= end_date")


def _to_decimal(x: Any) -> Decimal:
    return Decimal(str(x or 0))


def _validate_vehicle_id(db: Session, *, company_id: int, vehicle_id: int) -> None:
    exists = db.scalar(select(func.count()).select_from(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.company_id == company_id))
    if not exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vehicle_id")


def _validate_driver_id(db: Session, *, company_id: int, driver_id: int) -> None:
    exists = db.scalar(
        select(func.count())
        .select_from(User)
        .where(
            User.id == driver_id,
            User.company_id == company_id,
            User.role == "driver",
        )
    )
    if not exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid driver_id")


@router.get("/vehicles", response_model=list[VehicleReportRow])
def report_vehicles(
    start_date: date = Query(...),
    end_date: date = Query(...),
    vehicle_id: int | None = Query(default=None),
    driver_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    settings=Depends(require_advanced_reports),
) -> list[VehicleReportRow]:
    _date_range_or_400(start_date, end_date)
    company_id = admin_user.company_id

    if vehicle_id is not None:
        _validate_vehicle_id(db, company_id=company_id, vehicle_id=vehicle_id)
    if driver_id is not None:
        _validate_driver_id(db, company_id=company_id, driver_id=driver_id)

    enable_income = bool(settings.enable_income_tracking)

    job_stmt = (
        select(
            Job.vehicle_id.label("vehicle_id"),
            func.coalesce(func.sum(Job.trip_count), 0).label("total_trip_count"),
            func.coalesce(func.sum(Job.income_amount), 0).label("total_income"),
        )
        .where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
        )
        .group_by(Job.vehicle_id)
    )
    if vehicle_id is not None:
        job_stmt = job_stmt.where(Job.vehicle_id == vehicle_id)
    if driver_id is not None:
        job_stmt = job_stmt.where(Job.driver_id == driver_id)
    job_sub = job_stmt.subquery()

    exp_stmt = (
        select(
            Expense.vehicle_id.label("vehicle_id"),
            func.coalesce(func.sum(Expense.amount), 0).label("total_expense"),
        )
        .where(
            Expense.company_id == company_id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
        .group_by(Expense.vehicle_id)
    )
    if vehicle_id is not None:
        exp_stmt = exp_stmt.where(Expense.vehicle_id == vehicle_id)
    exp_sub = exp_stmt.subquery()

    vehicles_stmt = select(
        Vehicle.id,
        Vehicle.plate,
        Vehicle.vehicle_type,
        func.coalesce(job_sub.c.total_trip_count, 0).label("total_trip_count"),
        func.coalesce(job_sub.c.total_income, 0).label("total_income"),
        func.coalesce(exp_sub.c.total_expense, 0).label("total_expense"),
    ).where(Vehicle.company_id == company_id)
    if vehicle_id is not None:
        vehicles_stmt = vehicles_stmt.where(Vehicle.id == vehicle_id)

    vehicles_stmt = (
        vehicles_stmt.outerjoin(job_sub, job_sub.c.vehicle_id == Vehicle.id)
        .outerjoin(exp_sub, exp_sub.c.vehicle_id == Vehicle.id)
        .order_by(Vehicle.is_active.desc(), Vehicle.plate.asc())
    )

    rows = db.execute(vehicles_stmt).all()
    out: list[VehicleReportRow] = []
    for r in rows:
        total_trip_count = int(r.total_trip_count or 0)
        total_expense = _to_decimal(r.total_expense)

        if enable_income:
            total_income = _to_decimal(r.total_income)
            net_profit = total_income - total_expense
            out.append(
                VehicleReportRow(
                    vehicle_id=int(r.id),
                    plate=r.plate,
                    vehicle_type=r.vehicle_type,
                    total_trip_count=total_trip_count,
                    total_income=total_income,
                    total_expense=total_expense,
                    net_profit=net_profit,
                )
            )
        else:
            out.append(
                VehicleReportRow(
                    vehicle_id=int(r.id),
                    plate=r.plate,
                    vehicle_type=r.vehicle_type,
                    total_trip_count=total_trip_count,
                    total_income=None,
                    total_expense=total_expense,
                    net_profit=None,
                )
            )
    return out


@router.get("/drivers", response_model=list[DriverJobSummaryRow])
def report_drivers(
    start_date: date = Query(...),
    end_date: date = Query(...),
    driver_id: int | None = Query(default=None),
    vehicle_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    settings=Depends(require_advanced_reports),
) -> list[DriverJobSummaryRow]:
    _date_range_or_400(start_date, end_date)
    company_id = admin_user.company_id

    if driver_id is not None:
        _validate_driver_id(db, company_id=company_id, driver_id=driver_id)
    if vehicle_id is not None:
        _validate_vehicle_id(db, company_id=company_id, vehicle_id=vehicle_id)

    enable_income = bool(settings.enable_income_tracking)

    job_stmt = (
        select(
            Job.driver_id.label("driver_id"),
            func.count(Job.id).label("job_count"),
            func.coalesce(func.sum(Job.trip_count), 0).label("total_trip_count"),
            func.coalesce(func.sum(Job.income_amount), 0).label("total_income"),
        )
        .where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
        )
        .group_by(Job.driver_id)
    )
    if driver_id is not None:
        job_stmt = job_stmt.where(Job.driver_id == driver_id)
    if vehicle_id is not None:
        job_stmt = job_stmt.where(Job.vehicle_id == vehicle_id)
    job_sub = job_stmt.subquery()

    drivers_stmt = select(
        User.id,
        User.name,
        User.phone,
        func.coalesce(job_sub.c.job_count, 0).label("job_count"),
        func.coalesce(job_sub.c.total_trip_count, 0).label("total_trip_count"),
        func.coalesce(job_sub.c.total_income, 0).label("total_income"),
    ).where(
        User.company_id == company_id,
        User.role == "driver",
    )
    if driver_id is not None:
        drivers_stmt = drivers_stmt.where(User.id == driver_id)

    drivers_stmt = drivers_stmt.outerjoin(job_sub, job_sub.c.driver_id == User.id).order_by(User.is_active.desc(), User.name.asc())
    rows = db.execute(drivers_stmt).all()

    out: list[DriverJobSummaryRow] = []
    for r in rows:
        if enable_income:
            total_income = _to_decimal(r.total_income)
        else:
            total_income = None
        out.append(
            DriverJobSummaryRow(
                driver_id=int(r.id),
                name=r.name,
                phone=r.phone,
                job_count=int(r.job_count or 0),
                total_trip_count=int(r.total_trip_count or 0),
                total_income=total_income,
            )
        )
    return out


def _period_bounds_from_key(granularity: str, key: Any) -> Tuple[date, date]:
    if granularity == "daily":
        d: date = key
        return d, d
    if granularity == "monthly":
        # key: 'YYYY-MM-01'
        d = datetime.strptime(str(key), "%Y-%m-%d").date()
        last_day = calendar.monthrange(d.year, d.month)[1]
        return d, date(d.year, d.month, last_day)
    if granularity == "weekly":
        # key: YEARWEEK with mode 3 => ISO week. Example: 202604
        yw = int(key)
        year = yw // 100
        week = yw % 100
        start = date.fromisocalendar(year, week, 1)
        end = start + timedelta(days=6)
        return start, end
    raise ValueError("invalid granularity")


@router.get("/time-series", response_model=list[TimeSeriesRow])
def report_time_series(
    start_date: date = Query(...),
    end_date: date = Query(...),
    granularity: str = Query(..., pattern="^(daily|weekly|monthly)$"),
    vehicle_id: int | None = Query(default=None),
    driver_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    settings=Depends(require_advanced_reports),
) -> list[TimeSeriesRow]:
    _date_range_or_400(start_date, end_date)
    company_id = admin_user.company_id

    if vehicle_id is not None:
        _validate_vehicle_id(db, company_id=company_id, vehicle_id=vehicle_id)
    if driver_id is not None:
        _validate_driver_id(db, company_id=company_id, driver_id=driver_id)

    enable_income = bool(settings.enable_income_tracking)

    if granularity == "daily":
        job_key = Job.date
        exp_key = Expense.date
    elif granularity == "weekly":
        job_key = func.yearweek(Job.date, 3)
        exp_key = func.yearweek(Expense.date, 3)
    else:  # monthly
        job_key = func.date_format(Job.date, "%Y-%m-01")
        exp_key = func.date_format(Expense.date, "%Y-%m-01")

    job_stmt = (
        select(
            job_key.label("k"),
            func.coalesce(func.sum(Job.trip_count), 0).label("total_trip_count"),
            func.coalesce(func.sum(Job.income_amount), 0).label("total_income"),
        )
        .where(
            Job.company_id == company_id,
            Job.date >= start_date,
            Job.date <= end_date,
        )
        .group_by("k")
    )
    if vehicle_id is not None:
        job_stmt = job_stmt.where(Job.vehicle_id == vehicle_id)
    if driver_id is not None:
        job_stmt = job_stmt.where(Job.driver_id == driver_id)

    exp_stmt = (
        select(
            exp_key.label("k"),
            func.coalesce(func.sum(Expense.amount), 0).label("total_expense"),
        )
        .where(
            Expense.company_id == company_id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
        .group_by("k")
    )
    if vehicle_id is not None:
        exp_stmt = exp_stmt.where(Expense.vehicle_id == vehicle_id)
    # driver_id filtrelemesi giderlere uygulanmaz (giderler araç bazlıdır)

    jobs = db.execute(job_stmt).all()
    exps = db.execute(exp_stmt).all()

    job_map: Dict[Any, Dict[str, Any]] = {r.k: {"trip": int(r.total_trip_count or 0), "income": _to_decimal(r.total_income)} for r in jobs}
    exp_map: Dict[Any, Dict[str, Any]] = {r.k: {"expense": _to_decimal(r.total_expense)} for r in exps}
    keys = sorted(set(job_map.keys()) | set(exp_map.keys()))

    out: list[TimeSeriesRow] = []
    for k in keys:
        period_start, period_end = _period_bounds_from_key(granularity, k)
        trip = int(job_map.get(k, {}).get("trip", 0))
        expense = _to_decimal(exp_map.get(k, {}).get("expense", 0))

        if enable_income:
            income = _to_decimal(job_map.get(k, {}).get("income", 0))
            net_profit = income - expense
            out.append(
                TimeSeriesRow(
                    granularity=granularity,  # type: ignore[arg-type]
                    period_start=period_start,
                    period_end=period_end,
                    total_trip_count=trip,
                    total_income=income,
                    total_expense=expense,
                    net_profit=net_profit,
                )
            )
        else:
            out.append(
                TimeSeriesRow(
                    granularity=granularity,  # type: ignore[arg-type]
                    period_start=period_start,
                    period_end=period_end,
                    total_trip_count=trip,
                    total_income=None,
                    total_expense=expense,
                    net_profit=None,
                )
            )

    return out

