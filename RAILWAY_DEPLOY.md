## Railway Deploy (Monorepo: backend + frontend)

Bu repo iki servis olarak deploy edilir:
- **Backend** (FastAPI) → Root Directory: `backend`
- **Frontend** (React) → Root Directory: `frontend`

### 1) Railway’de servisleri oluştur

- New Project → Deploy from GitHub Repo
- Aynı repodan 2 servis:
  - **Service A (backend)**: Root Directory = `backend`
  - **Service B (frontend)**: Root Directory = `frontend`

> Alternatif: Dockerfile algılansın istersen her serviste Dockerfile kullanılacak şekilde bırakıldı.

### 2) MySQL ekle

- Project → Add → Database → **MySQL**
- Railway MySQL bağlantı URL’sini backend servisine env olarak ver:
  - `MYSQL_DSN` = `mysql+pymysql://USER:PASS@HOST:PORT/DB?charset=utf8mb4`

### 3) Backend env (zorunlu)

Backend servisine:
- `JWT_SECRET_KEY` (**zorunlu, güçlü bir değer**)
- `JWT_ALGORITHM` = `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` = `10080` (opsiyonel)
- `CORS_ALLOW_ORIGINS` = frontend domain’leri (virgülle)
  - ör: `https://your-frontend.railway.app`
- `MYSQL_DSN` (yukarıdaki gibi)

Start:
- Procfile veya Dockerfile zaten `0.0.0.0:$PORT` ile başlatır.

### 4) Frontend env (zorunlu)

Frontend servisine:
- `VITE_API_BASE_URL` = backend URL
  - ör: `https://your-backend.railway.app`

Start:
- `npm run build` + `npm run start` (Procfile ile)

### 5) CORS

Frontend domain’i değiştiğinde backend’de `CORS_ALLOW_ORIGINS` güncelle.

