#!/bin/bash
# Veritabanını sıfırdan oluşturma scripti
# Railway MySQL bağlantı bilgileri

echo "🗑️  Tüm tablolar siliniyor ve veritabanı sıfırdan oluşturuluyor..."
echo ""

mysql -h shuttle.proxy.rlwy.net \
      -u root \
      -p \
      --port 24245 \
      --protocol=TCP \
      railway < backend/reset_database.sql

echo ""
echo "✅ Veritabanı sıfırdan oluşturuldu!"
echo ""
echo "📝 Şimdi seed script'ini çalıştırabilirsin:"
echo "   python -m app.db.seed"
