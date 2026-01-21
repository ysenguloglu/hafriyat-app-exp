## Hafriyat Firma Takip API (Backend)

FastAPI + MySQL + SQLAlchemy tabanlı backend.

### Kurulum

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example env
# env dosyasını düzenle
```

### Veritabanı

**Schema SQL ile:**
```bash
mysql -u root -p hafriyat < schema.sql
```

**Alembic ile (önerilen):**
```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

### Örnek Veri (Demo için)

```bash
python -m app.db.seed
```

Bu script:
- 1 firma + admin kullanıcı (`05551234567` / `admin123`)
- 2 şoför (`05551234568`, `05551234569` / `sifre123`)
- 3 araç (ID: 1, 2, 3)
- Son 30 gün için örnek iş ve gider kayıtları

### Çalıştırma

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API Docs: http://localhost:8000/docs
