## Railway Deploy (Monorepo: backend + frontend)

Bu repo iki servis olarak deploy edilir:
- **Backend** (FastAPI) → Root Directory: `backend`
- **Frontend** (React) → Root Directory: `frontend`

### 1) Railway'de servisleri oluştur

- New Project → Deploy from GitHub Repo
- Aynı repodan 2 servis:
  - **Service A (backend)**: Root Directory = `backend`
  - **Service B (frontend)**: Root Directory = `frontend`

> Alternatif: Dockerfile algılansın istersen her serviste Dockerfile kullanılacak şekilde bırakıldı.

### 2) MySQL ekle

- Project → Add → Database → **MySQL**
- Railway MySQL bağlantı URL'sini backend servisine env olarak ver:
  - `MYSQL_DSN` = `mysql+pymysql://USER:PASS@HOST:PORT/DB?charset=utf8mb4`

### 3) Backend env (zorunlu)

Backend servisine:
- `JWT_SECRET_KEY` (**zorunlu, güçlü bir değer**)
- `JWT_ALGORITHM` = `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` = `10080` (opsiyonel)
- `CORS_ALLOW_ORIGINS` = frontend domain'leri (virgülle)
  - ör: `https://your-frontend.railway.app`
- `MYSQL_DSN` (yukarıdaki gibi)
- `SETUP_TOKEN` = güçlü bir değer (ilk admin oluşturmak için)

Start:
- Procfile veya Dockerfile zaten `0.0.0.0:$PORT` ile başlatır.

### 4) Frontend env (zorunlu)

Frontend servisine:
- `VITE_API_BASE_URL` = backend URL
  - ör: `https://your-backend.railway.app`

Start:
- `npm run build` + `npm run start` (Procfile ile)

### 5) İlk Kurulum

Backend deploy olduktan sonra:

```bash
curl -X POST https://<backend-domain>/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setup_token": "SETUP_TOKEN_DEĞERİ",
    "company_name": "İlk Firma",
    "admin_name": "Admin",
    "admin_phone": "05551234567",
    "admin_password": "admin123"
  }'
```

### 6) CORS

Frontend domain'i oluşunca backend'de `CORS_ALLOW_ORIGINS` güncelle ve backend'i restart et.

### 7) Temel Yapı Oluşturma (Müşteri için)

Railway backend servisinde **Console** aç:

```bash
python -m app.db.seed
```

Bu script şunları oluşturur:
- 1 firma (eğer yoksa)
- Admin: `05551234567` / `admin123` (eğer yoksa)
- 2 örnek şoför: `05551234568`, `05551234569` / `sifre123` (iş girebilmek için)
- 3 örnek araç: `34ABC123`, `34XYZ456`, `34DEF789` (gider girebilmek için)

**Not**: İş ve gider kayıtları eklenmez - müşteri kendisi girecek.

**Alternatif**: Setup endpoint'i ile müşteri kendi admin hesabını oluşturabilir (önerilen).
