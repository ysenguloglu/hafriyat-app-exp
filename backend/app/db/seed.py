"""
Müşteri için temel yapı oluşturma script'i
- Sadece firma + Admin hesabı oluşturur (eğer yoksa)
- Örnek veri EKLENMEZ - müşteri kendi araçlarını, şoförlerini, işlerini ve giderlerini girer

Kullanım: python -m app.db.seed

Not: Normalde setup endpoint'i kullanılmalı. Bu script sadece test/demo için.
"""
from __future__ import annotations

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.user import User

# Model importları Base.metadata'ya tabloları ekler
from app import models  # noqa: F401


def seed_data():
    """
    Sadece firma + admin oluşturur (eğer yoksa).
    Örnek veri eklenmez - müşteri kendi araçlarını, şoförlerini, işlerini ve giderlerini girer.
    """
    db = SessionLocal()
    try:
        # Firma var mı kontrol et
        company = db.scalar(select(Company))
        if not company:
            print("🌱 İlk kurulum - firma ve admin oluşturuluyor...")
            # 1. Firma oluştur
            company = Company(name="Örnek Hafriyat Firması")
            db.add(company)
            db.flush()
            print(f"✅ Firma oluşturuldu: {company.name} (ID: {company.id})")

            # 2. Firma ayarları (tüm özellikler açık - müşteri kullanabilsin)
            settings = CompanySettings(
                company_id=company.id,
                enable_income_tracking=True,
                enable_driver_job_entry=True,
                enable_advanced_reports=True,
                enable_future_modules=False,
            )
            db.add(settings)
            print("✅ Firma ayarları oluşturuldu (tüm özellikler açık)")

            # 3. Admin kullanıcı
            admin = User(
                company_id=company.id,
                name="Admin Kullanıcı",
                phone="05551234567",
                password_hash=hash_password("admin123"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.flush()
            print(f"✅ Admin kullanıcı oluşturuldu: {admin.phone} / şifre: admin123")
        else:
            print(f"ℹ️  Mevcut firma kullanılıyor: {company.name} (ID: {company.id})")
            # Admin kontrolü
            existing_admin = db.scalar(select(User).where(User.company_id == company.id, User.role == "admin"))
            if not existing_admin:
                admin = User(
                    company_id=company.id,
                    name="Admin Kullanıcı",
                    phone="05551234567",
                    password_hash=hash_password("admin123"),
                    role="admin",
                    is_active=True,
                )
                db.add(admin)
                db.flush()
                print(f"✅ Admin kullanıcı eklendi: {admin.phone} / şifre: admin123")
            else:
                print(f"ℹ️  Admin zaten mevcut: {existing_admin.phone}")

        db.commit()
        print("\n🎉 Temel yapı hazır!")
        print("\n📝 Müşteri şimdi yapabilir:")
        print("   • Giriş yap (admin hesabı ile)")
        print("   • Araç ekle (Araçlar sayfası)")
        print("   • Şoför ekle (Şoförler sayfası)")
        print("   • Gider kayıtları girebilir")
        print("   • İş kayıtları girebilir")
        print("   • Dashboard'da özeti görüntüleyebilir")
        print("   • Raporlara bakabilir")
        
        # Admin bilgisini göster
        final_admin = db.scalar(select(User).where(User.company_id == company.id, User.role == "admin"))
        if final_admin:
            print(f"\n📋 Giriş Bilgileri:")
            print(f"   Admin: {final_admin.phone} / admin123")

    except Exception as e:
        db.rollback()
        print(f"❌ Hata: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Tablolar yoksa oluştur
    Base.metadata.create_all(bind=engine)
    seed_data()
