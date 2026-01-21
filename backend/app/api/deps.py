from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.company_settings import CompanySettings
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        company_id = int(payload.get("company_id"))
        role = str(payload.get("role"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz kimlik doğrulama bilgileri")

    user = db.scalar(select(User).where(User.id == user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı aktif değil")

    # Token içindeki firma/rol bilgisi ile DB kaydı uyuşmalı (sert kontrol)
    if user.company_id != company_id or user.role != role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz kimlik doğrulama bilgileri")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için admin yetkisi gereklidir")
    return current_user


def require_driver(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "driver":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlem için şoför yetkisi gereklidir")
    return current_user


def get_company_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CompanySettings | None:
    # Ayar kaydı yoksa tüm özellikler kapalı kabul edilir.
    return db.scalar(select(CompanySettings).where(CompanySettings.company_id == current_user.company_id))


# require_advanced_reports kaldırıldı - raporlar her şirkete açık
