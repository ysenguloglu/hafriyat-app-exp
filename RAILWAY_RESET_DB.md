# Railway Veritabanını Sıfırdan Oluşturma

## Yöntem 1: Script ile (Önerilen)

```bash
./backend/reset_database.sh
```

Veya direkt MySQL komutu:

```bash
mysql -h shuttle.proxy.rlwy.net \
      -u root \
      -p \
      --port 24245 \
      --protocol=TCP \
      railway < backend/reset_database.sql
```

## Yöntem 2: Manuel

1. Railway console'a bağlan:
```bash
mysql -h shuttle.proxy.rlwy.net -u root -p --port 24245 --protocol=TCP railway
```

2. SQL komutlarını çalıştır:
```sql
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS company_settings;
DROP TABLE IF EXISTS companies;

SET FOREIGN_KEY_CHECKS = 1;
```

3. Çıkış yap ve schema.sql'i çalıştır:
```bash
mysql -h shuttle.proxy.rlwy.net -u root -p --port 24245 --protocol=TCP railway < backend/schema.sql
```

## Yöntem 3: Railway Console'dan

Railway dashboard'dan MySQL console'a gir ve `reset_database.sql` dosyasının içeriğini çalıştır.

## Seed Data Ekleme

Veritabanı oluşturulduktan sonra temel yapıyı oluşturmak için:

```bash
# Railway console'dan
python -m app.db.seed

# Veya backend servisinde
cd backend && python -m app.db.seed
```

Bu komut:
- Bir firma oluşturur
- Firma ayarlarını oluşturur (tüm özellikler açık)
- Admin kullanıcı oluşturur (telefon: 05551234567, şifre: admin123)

## Notlar

⚠️ **DİKKAT**: Bu işlem tüm verileri siler! Sadece development/test ortamında kullanın.

✅ Production'da migration kullanın:
```bash
mysql -h shuttle.proxy.rlwy.net -u root -p --port 24245 --protocol=TCP railway < backend/migrations/add_odometer_tracking.sql
```
