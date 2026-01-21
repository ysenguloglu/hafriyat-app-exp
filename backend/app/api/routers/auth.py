from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import CurrentUser, LoginRequest, Token


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    # Multi-tenant güvenliği: aynı telefon birden fazla firmada olabilir.
    stmt = select(User).where(User.phone == payload.phone, User.is_active.is_(True))
    if payload.company_id is not None:
        stmt = stmt.where(User.company_id == payload.company_id)

    candidates = db.scalars(stmt).all()
    if not candidates:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect phone or password")

    if len(candidates) > 1 and payload.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="company_id is required for this phone number",
        )

    user = candidates[0]

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect phone or password")

    token = create_access_token(subject=str(user.id), company_id=user.company_id, role=user.role)
    return Token(access_token=token)


@router.get("/me", response_model=CurrentUser)
def me(current_user: User = Depends(get_current_user)) -> CurrentUser:
    return CurrentUser(
        id=current_user.id,
        company_id=current_user.company_id,
        name=current_user.name,
        phone=current_user.phone,
        role=current_user.role,
    )
