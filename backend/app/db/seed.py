"""
Müşteri için temel yapı oluşturma script'i
- Firma + Admin hesabı (eğer yoksa)
- Örnek araçlar (gider girebilmek için)
- Örnek şoförler (iş girebilmek için)
- İş ve gider kayıtları EKLENMEZ (müşteri kendisi girecek)

Kullanım: python -m app.db.seed
"""
from __future__ import annotations

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.user import User
from app.models.vehicle import Vehicle

# Model importları Base.metadata'ya tabloları ekler
from app import models  # noqa: F401


def seed_data():
    """
    Müşteri için temel yapı oluşturur:
    - Firma + Admin (eğer yoksa)
    - Örnek araçlar (gider girebilmek için)
    - Örnek şoförler (iş girebilmek için)
    - İş ve gider kayıtları EKLENMEZ (müşteri kendisi girecek)
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

        # 4. Örnek araçlar (gider girebilmek için)
        existing_vehicles = db.scalars(select(Vehicle).where(Vehicle.company_id == company.id)).all()
        vehicle_plates = {v.plate for v in existing_vehicles}
        vehicles_to_add = []
        vehicle_data = [
            ("34ABC123", "Kamyon"),
            ("34XYZ456", "Tır"),
            ("34DEF789", "Kamyon"),
        ]
        for plate, vtype in vehicle_data:
            if plate not in vehicle_plates:
                vehicles_to_add.append(
                    Vehicle(company_id=company.id, plate=plate, vehicle_type=vtype, is_active=True)
                )
        for vehicle in vehicles_to_add:
            db.add(vehicle)
        db.flush()
        if vehicles_to_add:
            print(f"✅ {len(vehicles_to_add)} örnek araç eklendi (gider girebilmek için)")
        else:
            print(f"ℹ️  Araçlar zaten mevcut ({len(existing_vehicles)} adet)")

        # 5. Örnek şoförler (iş girebilmek için)
        existing_drivers = db.scalars(select(User).where(User.company_id == company.id, User.role == "driver")).all()
        driver_phones = {d.phone for d in existing_drivers}
        drivers_to_add = []
        driver_data = [
            ("Ahmet Yılmaz", "05551234568"),
            ("Mehmet Demir", "05551234569"),
        ]
        for name, phone in driver_data:
            if phone not in driver_phones:
                drivers_to_add.append(
                    User(
                        company_id=company.id,
                        name=name,
                        phone=phone,
                        password_hash=hash_password("sifre123"),
                        role="driver",
                        is_active=True,
                    )
                )
        for driver in drivers_to_add:
            db.add(driver)
        db.flush()
        if drivers_to_add:
            print(f"✅ {len(drivers_to_add)} örnek şoför eklendi (iş girebilmek için)")
        else:
            print(f"ℹ️  Şoförler zaten mevcut ({len(existing_drivers)} adet)")

        db.commit()
        print("\n🎉 Temel yapı hazır!")
        print("\n📝 Müşteri şimdi yapabilir:")
        print("   • Giriş yap (admin hesabı ile)")
        print("   • Gider kayıtları girebilir")
        print("   • İş kayıtları girebilir")
        print("   • Dashboard'da özeti görüntüleyebilir")
        print("   • Raporlara bakabilir")
        
        # Mevcut verileri göster
        final_drivers = db.scalars(select(User).where(User.company_id == company.id, User.role == "driver")).all()
        final_vehicles = db.scalars(select(Vehicle).where(Vehicle.company_id == company.id)).all()
        final_admin = db.scalar(select(User).where(User.company_id == company.id, User.role == "admin"))
        
        print("\n📋 Giriş Bilgileri:")
        if final_admin:
            print(f"   Admin: {final_admin.phone} / admin123")
        if final_drivers:
            print(f"   Şoförler: {', '.join(d.phone for d in final_drivers[:2])} / sifre123")
        if final_vehicles:
            print(f"\n🚗 Araçlar (ID): {', '.join(f'{v.plate} ({v.id})' for v in final_vehicles[:3])}")
        if final_drivers:
            print(f"👤 Şoförler (ID): {', '.join(f'{d.name} ({d.id})' for d in final_drivers[:2])}")

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
