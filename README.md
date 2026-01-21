# 🚛 Hafriyat Firma Takip Uygulaması

**Multi-tenant SaaS uygulaması** - Lokal hafriyat firmaları için üretime hazır, satılabilir web ve mobil web uyumlu takip sistemi.

## 📋 Özellikler

### 👥 Kullanıcı Rolleri

- **Admin**: Tüm yönetim yetkileri (araç, şoför, iş, gider, raporlar)
- **Şoför**: Sadece kendi işlerini görür ve (firma ayarına göre) kendi adına iş kaydı girebilir

### 🏢 Multi-Tenant Yapı

- Her firmanın verisi tamamen izole
- Tek kod tabanı, tek deploy
- Firma bazlı özelleştirme (feature flags)

### 📊 Ana Modüller

- **Araç Yönetimi**: Plaka, tip, aktif/pasif durumu
- **Şoför Yönetimi**: Telefon, şifre, aktif/pasif durumu
- **İş/Sefer Takibi**: Tarih, araç, şoför, lokasyon, sefer sayısı, gelir (opsiyonel)
- **Gider Takibi**: Tarih, araç, gider tipi, tutar
- **Dashboard**: Tarih aralığı bazlı özet (sefer, gelir, gider, net kâr, aktif araç)
- **Raporlar**: Araç bazlı, şoför bazlı, zaman serisi (günlük/haftalık/aylık)

### 🎛️ Firma Ayarları (Feature Flags)

- `enable_income_tracking`: Gelir takibi açık/kapalı
- `enable_driver_job_entry`: Şoför iş girişi açık/kapalı
- `enable_advanced_reports`: Gelişmiş raporlar (şu an tüm firmalara açık)

## 🛠️ Teknoloji Yığını

- **Backend**: Python 3.12 + FastAPI
- **Veritabanı**: MySQL 8.0+
- **ORM**: SQLAlchemy 2.0
- **Kimlik Doğrulama**: JWT (python-jose)
- **Frontend**: React 18 + TypeScript + Vite
- **Deployment**: Railway (backend + frontend + MySQL)

## 🚀 Hızlı Başlangıç

### Lokal Geliştirme

#### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example env
# env dosyasını düzenle (MySQL bağlantı bilgileri)
```

**Veritabanı kurulumu:**

```bash
# MySQL'de schema.sql'i çalıştır
mysql -u root -p hafriyat < schema.sql

# Veya Alembic ile:
alembic upgrade head
```

**Temel yapı oluşturma (müşteri için):**

```bash
python -m app.db.seed
```

Bu script şunları oluşturur:
- 1 firma (eğer yoksa)
- 1 admin kullanıcı: `05551234567` / `admin123` (eğer yoksa)
- 2 örnek şoför: `05551234568`, `05551234569` / `sifre123` (iş girebilmek için)
- 3 örnek araç: `34ABC123`, `34XYZ456`, `34DEF789` (gider girebilmek için)

**Not**: İş ve gider kayıtları eklenmez - müşteri kendisi girecek.

**Backend'i çalıştır:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

#### 2. Frontend

```bash
cd frontend
npm install
cp env.example .env
# .env dosyasını düzenle: VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Frontend: http://localhost:5173

### Railway Deploy

Detaylı deploy rehberi: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

**Özet:**
1. Railway'de 3 servis oluştur: MySQL, Backend, Frontend
2. Backend Variables: `JWT_SECRET_KEY`, `MYSQL_DSN`, `CORS_ALLOW_ORIGINS`, `SETUP_TOKEN`
3. Frontend Variables: `VITE_API_BASE_URL`
4. İlk kurulum: `POST /setup` endpoint'i ile admin oluştur
5. Örnek veri: `python -m app.db.seed` (Railway console'dan veya lokal MySQL'e bağlanarak)

## 📁 Proje Yapısı

```
.
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API router'ları
│   │   ├── core/        # Config, security
│   │   ├── db/          # DB session, seed
│   │   ├── models/      # SQLAlchemy modelleri
│   │   └── schemas/     # Pydantic schema'ları
│   ├── alembic/         # Migration'lar
│   ├── schema.sql       # MySQL şema
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── auth/        # Auth provider
│   │   ├── components/  # UI component'leri
│   │   ├── pages/       # Sayfa component'leri
│   │   └── routes/      # Route guard'lar
│   └── package.json
└── README.md
```

## 🔐 Güvenlik

- **JWT Authentication**: Tüm endpoint'ler korumalı (login hariç)
- **Role-Based Access Control**: Admin/Driver ayrımı katı şekilde uygulanmış
- **Multi-Tenant İzolasyon**: Sorgu seviyesinde `company_id` kontrolü
- **Password Hashing**: bcrypt ile şifre hash'leme

## 📱 Müşteri Kullanım Akışı

### 1. İlk Kurulum

**Yöntem A: Setup Endpoint (Önerilen)**
```bash
curl -X POST https://<backend-domain>/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setup_token": "SETUP_TOKEN_DEĞERİ",
    "company_name": "Firma Adı",
    "admin_name": "Admin Adı",
    "admin_phone": "05551234567",
    "admin_password": "güvenli_şifre"
  }'
```

**Yöntem B: Seed Script**
```bash
python -m app.db.seed
```
Bu script temel yapıyı oluşturur (firma, admin, örnek araçlar/şoförler).

### 2. Giriş Yap

1. Frontend'de login sayfasına git
2. Admin telefon ve şifre ile giriş yap
3. Dashboard'a yönlendirilirsin

### 3. Veri Girişi

**Gider Kayıtları:**
- Admin → Gider → Yeni Gider
- Tarih, araç seç (veya araç ID gir), gider tipi, tutar
- Kaydet

**İş Kayıtları:**
- Admin → İşler → Yeni İş
- Tarih, araç, şoför, lokasyonlar, sefer sayısı, gelir (opsiyonel)
- Kaydet

### 4. Dashboard ve Raporlar

- **Dashboard**: Tarih aralığı seç → Özet görüntüle (sefer, gelir, gider, net kâr)
- **Raporlar**: Araç bazlı, şoför bazlı, zaman serisi raporları

## 🎯 Önemli Notlar

- **Araç ID'leri**: Seed script çalıştırıldığında örnek araçlar oluşturulur (ID'ler otomatik)
- **Gider eklerken**: Araç dropdown'dan seç veya ID gir
- **Tüm özellikler açık**: Seed script tüm feature flag'leri açık oluşturur
- **Veri girişi**: İş ve gider kayıtları müşteri tarafından girilir (seed script eklemez)

## 📞 Destek

Sorun yaşarsan:
1. Backend loglarını kontrol et
2. Frontend console'u kontrol et (F12)
3. MySQL bağlantısını kontrol et
4. Railway deploy loglarını kontrol et

## 📄 Lisans

Bu proje satılabilir bir SaaS ürünüdür.
