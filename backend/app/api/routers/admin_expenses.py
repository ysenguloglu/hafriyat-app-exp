from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.expense import Expense
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseUpdate


router = APIRouter(prefix="/admin/expenses", tags=["admin"])


@router.get("", response_model=list[ExpenseOut])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[ExpenseOut]:
    expenses = db.scalars(
        select(Expense)
        .where(Expense.company_id == current_user.company_id)
        .order_by(Expense.date.desc(), Expense.id.desc())
    ).all()
    return expenses


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> ExpenseOut:
    vehicle = db.scalar(
        select(Vehicle).where(Vehicle.id == payload.vehicle_id, Vehicle.company_id == current_user.company_id)
    )
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vehicle_id")

    exp = Expense(
        company_id=current_user.company_id,
        date=payload.date,
        vehicle_id=payload.vehicle_id,
        expense_type=payload.expense_type.strip(),
        amount=payload.amount,
        description=(payload.description.strip() if payload.description else None),
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> ExpenseOut:
    exp = db.scalar(
        select(Expense).where(Expense.id == expense_id, Expense.company_id == current_user.company_id)
    )
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return exp


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> ExpenseOut:
    exp = db.scalar(
        select(Expense).where(Expense.id == expense_id, Expense.company_id == current_user.company_id)
    )
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    if payload.vehicle_id is not None:
        vehicle = db.scalar(
            select(Vehicle).where(Vehicle.id == payload.vehicle_id, Vehicle.company_id == current_user.company_id)
        )
        if not vehicle:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vehicle_id")
        exp.vehicle_id = payload.vehicle_id

    if payload.date is not None:
        exp.date = payload.date
    if payload.expense_type is not None:
        exp.expense_type = payload.expense_type.strip()
    if payload.amount is not None:
        exp.amount = payload.amount
    if payload.description is not None:
        exp.description = payload.description.strip() if payload.description else None

    db.commit()
    db.refresh(exp)
    return exp

