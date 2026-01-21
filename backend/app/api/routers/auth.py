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
    # Telefon numarasına göre kullanıcı bul (aynı telefon birden fazla firmada varsa ilkini al)
    user = db.scalar(select(User).where(User.phone == payload.phone, User.is_active.is_(True)))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telefon veya şifre hatalı")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telefon veya şifre hatalı")

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
