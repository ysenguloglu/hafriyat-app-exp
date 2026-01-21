from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import get_db
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.user import User

router = APIRouter(prefix="/setup", tags=["setup"])


class SetupRequest(BaseModel):
    setup_token: str
    company_name: str
    admin_name: str
    admin_phone: str
    admin_password: str


@router.post("", status_code=status.HTTP_201_CREATED)
def setup(request: SetupRequest, db: Session = Depends(get_db)) -> dict:
    settings = get_settings()

    # Token kontrolü
    if not settings.setup_token or request.setup_token != settings.setup_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geçersiz kurulum token'ı")

    # Sadece hiç company yoksa çalışsın (güvenlik)
    existing = db.scalar(select(Company))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kurulum zaten tamamlanmış")

    # Company oluştur
    company = Company(name=request.company_name.strip())
    db.add(company)
    db.flush()

    # Company settings oluştur (varsayılan kapalı)
    settings_obj = CompanySettings(company_id=company.id)
    db.add(settings_obj)

    # Admin user oluştur
    admin = User(
        company_id=company.id,
        name=request.admin_name.strip(),
        phone=request.admin_phone.strip(),
        password_hash=hash_password(request.admin_password),
        role="admin",
        is_active=True,
    )
    db.add(admin)

    db.commit()

    return {
        "message": "Setup completed",
        "company_id": company.id,
        "admin_id": admin.id,
    }
