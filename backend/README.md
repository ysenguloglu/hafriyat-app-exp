## Hafriyat Firma Takip API (Backend)

Bu klasör FastAPI + MySQL + SQLAlchemy tabanlı backend içindir.

### Kurulum (lokal)

Sanal ortam aktifken:

```bash
pip install -r requirements.txt
cp env.example env
```

`env` dosyasındaki MySQL ayarlarını doldurun.

### Veritabanı şeması

- Ham MySQL şeması: `schema.sql`
- SQLAlchemy modelleri: `app/models/`

### Alembic (önerilen)

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

### Çalıştırma

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
