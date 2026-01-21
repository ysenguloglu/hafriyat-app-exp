from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.user import User
from app.schemas.auth import CurrentUser, LoginRequest, Token


router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    company_name: str
    admin_name: str
    admin_phone: str
    admin_password: str


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> Token:
    """Yeni firma ve admin kullanıcı oluşturur"""
    # Telefon numarası kontrolü
    existing_user = db.scalar(select(User).where(User.phone == payload.admin_phone.strip()))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu telefon numarası zaten kayıtlı")

    # Firma oluştur
    company = Company(name=payload.company_name.strip())
    db.add(company)
    db.flush()

    # Firma ayarları oluştur (tüm özellikler açık)
    settings = CompanySettings(
        company_id=company.id,
        enable_income_tracking=True,
        enable_driver_job_entry=True,
        enable_advanced_reports=True,
        enable_future_modules=False,
    )
    db.add(settings)

    # Admin kullanıcı oluştur
    admin = User(
        company_id=company.id,
        name=payload.admin_name.strip(),
        phone=payload.admin_phone.strip(),
        password_hash=hash_password(payload.admin_password),
        role="admin",
        is_active=True,
    )
    db.add(admin)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu telefon numarası zaten kayıtlı")

    # Token oluştur ve döndür
    token = create_access_token(subject=str(admin.id), company_id=admin.company_id, role=admin.role)
    return Token(access_token=token)


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
