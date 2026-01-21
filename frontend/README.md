## Hafriyat Firma Takip (Frontend)

Mobil öncelikli React arayüzü (PWA uyumlu).

### Kurulum

```bash
cd frontend
npm install
cp env.example .env
```

`.env` içindeki `VITE_API_BASE_URL` değerini backend URL’nize göre ayarlayın.

### Çalıştırma

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Notlar

- Login: `phone + password` (aynı telefon birden fazla firmada varsa `company_id` istenir)
- Admin menüleri: Dashboard / İşler / Gider / Rapor
- Araç & Şoför yönetimi sayfaları mevcut; şimdilik navigasyon için URL’ler:
  - `/admin/vehicles`
  - `/admin/drivers`
- Şoför: `/driver/jobs` ve `/driver/new-job`

