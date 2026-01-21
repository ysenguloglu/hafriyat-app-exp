from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverOut, DriverUpdate


router = APIRouter(prefix="/admin/drivers", tags=["admin"])


@router.get("", response_model=list[DriverOut])
def list_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[DriverOut]:
    drivers = db.scalars(
        select(User)
        .where(
            User.company_id == current_user.company_id,
            User.role == "driver",
        )
        .order_by(User.is_active.desc(), User.name.asc())
    ).all()
    return drivers


@router.post("", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> DriverOut:
    driver = User(
        company_id=current_user.company_id,
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        password_hash=hash_password(payload.password),
        role="driver",
        is_active=True,
    )
    db.add(driver)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Driver phone already exists")
    db.refresh(driver)
    return driver


@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> DriverOut:
    driver = db.scalar(
        select(User).where(
            User.id == driver_id,
            User.company_id == current_user.company_id,
            User.role == "driver",
        )
    )
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver


@router.put("/{driver_id}", response_model=DriverOut)
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> DriverOut:
    driver = db.scalar(
        select(User).where(
            User.id == driver_id,
            User.company_id == current_user.company_id,
            User.role == "driver",
        )
    )
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    if payload.name is not None:
        driver.name = payload.name.strip()
    if payload.phone is not None:
        driver.phone = payload.phone.strip()
    if payload.is_active is not None:
        driver.is_active = payload.is_active
    if payload.password is not None and payload.password.strip() != "":
        driver.password_hash = hash_password(payload.password)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Driver phone already exists")
    db.refresh(driver)
    return driver

