from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_company_settings, get_current_user, require_admin
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.job import JobCreate, JobOut, JobUpdate


router = APIRouter(prefix="/jobs", tags=["jobs"])


def _apply_income_visibility(job: Job, *, enable_income_tracking: bool) -> Job:
    if not enable_income_tracking:
        job.income_amount = None
    return job


@router.get("", response_model=list[JobOut])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    settings=Depends(get_company_settings),
) -> list[JobOut]:
    stmt = select(Job).where(Job.company_id == current_user.company_id)
    if current_user.role == "driver":
        stmt = stmt.where(Job.driver_id == current_user.id)
    jobs = db.scalars(stmt.order_by(Job.date.desc(), Job.id.desc())).all()

    enable_income = bool(settings.enable_income_tracking) if settings else False
    return [_apply_income_visibility(j, enable_income_tracking=enable_income) for j in jobs]


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    settings=Depends(get_company_settings),
) -> JobOut:
    stmt = select(Job).where(Job.id == job_id, Job.company_id == current_user.company_id)
    if current_user.role == "driver":
        stmt = stmt.where(Job.driver_id == current_user.id)
    job = db.scalar(stmt)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İş bulunamadı")

    enable_income = bool(settings.enable_income_tracking) if settings else False
    return _apply_income_visibility(job, enable_income_tracking=enable_income)


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    settings=Depends(get_company_settings),
) -> JobOut:
    enable_income = bool(settings.enable_income_tracking) if settings else False
    enable_driver_entry = bool(settings.enable_driver_job_entry) if settings else False

    if payload.income_amount is not None and not enable_income:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gelir takibi bu firma için kapalı")

    # Driver sadece kendi adına ve ayar açık ise kayıt girebilir.
    if current_user.role == "driver":
        if not enable_driver_entry:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Şoför iş girişi bu firma için kapalı")
        driver_id = current_user.id
    else:
        # Admin: driver_id zorunlu
        if payload.driver_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Şoför ID gereklidir")
        driver_id = payload.driver_id

    # Vehicle company kontrolü
    vehicle = db.scalar(
        select(Vehicle).where(
            Vehicle.id == payload.vehicle_id,
            Vehicle.company_id == current_user.company_id,
        )
    )
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz araç ID")

    # Driver company + role kontrolü
    driver = db.scalar(
        select(User).where(
            User.id == driver_id,
            User.company_id == current_user.company_id,
            User.role == "driver",
            User.is_active.is_(True),
        )
    )
    if not driver:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz şoför ID")

    job = Job(
        company_id=current_user.company_id,
        date=payload.date,
        vehicle_id=payload.vehicle_id,
        driver_id=driver_id,
        job_type=payload.job_type.strip(),
        from_location=payload.from_location.strip(),
        to_location=payload.to_location.strip(),
        trip_count=payload.trip_count,
        income_amount=payload.income_amount if enable_income else None,
        fuel_amount=payload.fuel_amount,
        odometer_start=payload.odometer_start,
        odometer_end=payload.odometer_end,
        description=(payload.description.strip() if payload.description else None),
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    db.add(job)
    
    # Eğer bitiş kilometresi girildiyse, aracın mevcut kilometresini güncelle
    if payload.odometer_end is not None:
        vehicle.current_odometer = payload.odometer_end
        db.add(vehicle)
    
    db.commit()
    db.refresh(job)
    return _apply_income_visibility(job, enable_income_tracking=enable_income)


@router.put("/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    payload: JobUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    settings=Depends(get_company_settings),
) -> JobOut:
    enable_income = bool(settings.enable_income_tracking) if settings else False

    job = db.scalar(select(Job).where(Job.id == job_id, Job.company_id == admin_user.company_id))
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İş bulunamadı")

    if payload.income_amount is not None and not enable_income:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gelir takibi bu firma için kapalı")

    if payload.vehicle_id is not None:
        vehicle = db.scalar(
            select(Vehicle).where(Vehicle.id == payload.vehicle_id, Vehicle.company_id == admin_user.company_id)
        )
        if not vehicle:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz araç ID")
        job.vehicle_id = payload.vehicle_id

    if payload.driver_id is not None:
        driver = db.scalar(
            select(User).where(
                User.id == payload.driver_id,
                User.company_id == admin_user.company_id,
                User.role == "driver",
                User.is_active.is_(True),
            )
        )
        if not driver:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz şoför ID")
        job.driver_id = payload.driver_id

    if payload.date is not None:
        job.date = payload.date
    if payload.job_type is not None:
        job.job_type = payload.job_type.strip()
    if payload.from_location is not None:
        job.from_location = payload.from_location.strip()
    if payload.to_location is not None:
        job.to_location = payload.to_location.strip()
    if payload.trip_count is not None:
        job.trip_count = payload.trip_count
    if payload.description is not None:
        job.description = payload.description.strip() if payload.description else None
    if payload.start_time is not None:
        job.start_time = payload.start_time
    if payload.end_time is not None:
        job.end_time = payload.end_time
    if payload.fuel_amount is not None:
        job.fuel_amount = payload.fuel_amount
    if payload.odometer_start is not None:
        job.odometer_start = payload.odometer_start
    if payload.odometer_end is not None:
        job.odometer_end = payload.odometer_end
        # Aracın mevcut kilometresini güncelle
        vehicle = db.scalar(
            select(Vehicle).where(Vehicle.id == job.vehicle_id, Vehicle.company_id == admin_user.company_id)
        )
        if vehicle:
            vehicle.current_odometer = payload.odometer_end
            db.add(vehicle)

    # income (izin varsa)
    if enable_income:
        if payload.income_amount is not None:
            job.income_amount = payload.income_amount
    else:
        job.income_amount = None

    db.commit()
    db.refresh(job)
    return _apply_income_visibility(job, enable_income_tracking=enable_income)

