from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleOut, VehicleUpdate


router = APIRouter(prefix="/admin/vehicles", tags=["admin"])


@router.get("", response_model=list[VehicleOut])
def list_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[VehicleOut]:
    vehicles = db.scalars(
        select(Vehicle)
        .where(Vehicle.company_id == current_user.company_id)
        .order_by(Vehicle.is_active.desc(), Vehicle.plate.asc())
    ).all()
    return vehicles


@router.post("", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> VehicleOut:
    vehicle = Vehicle(
        company_id=current_user.company_id,
        plate=payload.plate.strip(),
        vehicle_type=payload.vehicle_type.strip(),
        is_active=True,
    )
    db.add(vehicle)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vehicle plate already exists")
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> VehicleOut:
    vehicle = db.scalar(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.company_id == current_user.company_id)
    )
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> VehicleOut:
    vehicle = db.scalar(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.company_id == current_user.company_id)
    )
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    if payload.plate is not None:
        vehicle.plate = payload.plate.strip()
    if payload.vehicle_type is not None:
        vehicle.vehicle_type = payload.vehicle_type.strip()
    if payload.is_active is not None:
        vehicle.is_active = payload.is_active

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vehicle plate already exists")
    db.refresh(vehicle)
    return vehicle

