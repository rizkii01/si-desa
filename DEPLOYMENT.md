# ============================================
# DEPLOYMENT GUIDE - e-Desa
# IDCloudHost VPS + Docker + Supabase
# ============================================

## Overview

| Layer       | Service                  | Cost              | Status     |
|-------------|--------------------------|-------------------|------------|
| Frontend    | Vercel                   | Free              | ✅ Deployed|
| Backend     | IDCloudHost VPS (Docker) | Rp 87.000/bulan   | 🔄 Pending |
| Database    | Supabase PostgreSQL      | Free              | ✅ Active  |
| Domain      | IDCloudHost (.my.id)     | Gratis            | 🔄 Pending |

---

## Phase 3: Beli VPS di IDCloudHost

### Langkah-langkah:

1. **Login ke IDCloudHost**
   - Buka https://idcloudhost.com
   - Login atau daftar akun

2. **Beli VPS**
   - Pilih **VPS** → **Cloud VPS**
   - Pilih **Basic Standard** (Rp 87.000/bulan)
     - 2 vCPU
     - 2 GB RAM
     - 20 GB NVMe Storage
     - Bandwidth 2 TB
   - Pilih **Location: Jakarta**
   - Pilih **OS: Ubuntu 22.04 LTS**
   - Pilih **Password** (simpan!)
   - Klik **Order** dan bayar

3. **Dapatkan IP Address**
   - Setelah VPS aktif, login ke dashboard
   - Catat **IP Address** (contoh: `103.xxx.xxx.xxx`)

4. **Daftarkan Domain**
   - Di dashboard IDCloudHost, klik **Domain**
   - Pilih **Domain Baru**
   - Ketik nama domain (contoh: `sesa-cemara.my.id`)
   - Pilih **.my.id** (gratis)
   - Klik **Order**

5. **Pointing DNS**
   - Buka **DNS Management** di dashboard
   - Tambahkan记录:
     | Type | Name | Value              | TTL   |
     |------|------|--------------------|-------|
     | A    | @    | `IP_VPS_KAMU`      | 300   |
     | A    | api  | `IP_VPS_KAMU`      | 300   |

---

## Phase 4: Setup VPS

### 4.1 SSH ke VPS

```bash
ssh root@IP_VPS_KAMU
```

Masukkan password yang dibuat saat beli VPS.

### 4.2 Update System

```bash
apt update && apt upgrade -y
```

### 4.3 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Tambahkan user ke docker group
usermod -aG docker $USER

# Logout dan login lagi agar group aktif
exit
```

SSH lagi ke VPS setelah logout.

### 4.4 Install Docker Compose

```bash
apt install docker-compose -y
```

### 4.5 Clone Repository

```bash
# Buat direktori aplikasi
mkdir -p /var/www/si-desa
cd /var/www

# Clone repository
git clone https://github.com/username/si-desa.git

# Masuk ke direktori server
cd si-desa/server
```

### 4.6 Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env
nano .env
```

Isi file `.env` dengan konfigurasi:

```env
# Server
PORT=5000
NODE_ENV=production

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://si-desa-roan.vercel.app
```

**CATATAN:** Ganti `DATABASE_URL` dengan connection string dari Supabase.

### 4.7 Setup Nginx Config

```bash
# Buat direktori nginx
mkdir -p nginx/conf.d

# Edit nginx.conf
nano nginx/nginx.conf
```

Ganti `api.yourdomain.my.id` dengan domain kamu di:
- `server_name`

```bash
# Edit default.conf
nano nginx/conf.d/default.conf
```

Ganti semua `api.yourdomain.my.id` dengan domain kamu.

### 4.8 Build & Run Docker

```bash
# Kembali ke direktori utama
cd /var/www/si-desa

# Build images
docker-compose build

# Jalankan semua services
docker-compose up -d

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs -f
```

### 4.9 Setup SSL dengan Certbot

```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Dapatkan SSL certificate
certbot --nginx -d api.yourdomain.my.id

# Auto-renew SSL
certbot renew --dry-run
```

**CATATAN:** Pastikan DNS sudah propagated sebelum menjalankan certbot.

### 4.10 Test Backend

```bash
# Test API
curl https://api.yourdomain.my.id/

# Test login
curl -X POST https://api.yourdomain.my.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@e-desa.com","password":"password123"}'
```

---

## Phase 5: Setup Supabase

### 5.1 Login ke Supabase

1. Buka https://supabase.com
2. Login
3. Pilih project **si-desa**

### 5.2 Jalankan Migrations

1. Buka **SQL Editor** di dashboard Supabase
2. Jalankan file migrasi satu per satu:
   - `001_smart_letter_service.sql`
   - `002_add_letter_type.sql`
   - `003_add_processed_status.sql`
   - `004_add_smart_letter_access_control.sql`
   - `005_add_resident_profile_access.sql`
   - `006_add_smart_letter_notifications.sql`
   - `007_warga_complete.sql`

### 5.3 Buat Admin User

Jalankan query di SQL Editor:

```sql
-- Buat admin user
INSERT INTO users (email, password_hash, nama_lengkap, role)
VALUES (
  'admin@e-desa.com',
  '$2b$10$hashed_password',  -- Generate hash dari bcrypt
  'Admin Desa',
  'admin'
);
```

**CATATAN:** Generate password hash menggunakan:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10, (err, hash) => console.log(hash));"
```

---

## Phase 6: Update Frontend

### 6.1 Update vercel.json

Ganti `api.sesa-cemara.my.id` dengan domain VPS kamu:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.yourdomain.my.id/api/:path*" },
    { "source": "/uploads/:path*", "destination": "https://api.yourdomain.my.id/uploads/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 6.2 Push ke Git

```bash
# Commit semua perubahan
git add .
git commit -m "feat: add deployment config for IDCloudHost VPS"

# Push ke GitHub
git push origin main
```

Vercel akan otomatis rebuild frontend.

---

## Phase 7: Testing

### 7.1 Test Login

1. Buka https://si-desa-roan.vercel.app/login
2. Login dengan:
   - Email: `admin@e-desa.com`
   - Password: `password123`

### 7.2 Test Fitur

- [ ] Login berhasil
- [ ] Dashboard admin bisa diakses
- [ ] Data warga bisa diambil
- [ ] Surat pintar bisa dibuat
- [ ] Profil bisa diupload

### 7.3 Test di Mobile

1. Buka di Chrome mobile
2. Login
3. Test semua fitur

---

## Troubleshooting

### Error 502 Bad Gateway

```bash
# Cek apakah backend running
docker-compose ps

# Lihat logs
docker-compose logs server

# Restart backend
docker-compose restart server
```

### Error CORS

```bash
# Pastikan CORS sudah benar di server/src/index.js
# Harusnya sudah benal karena sudah di-fix
```

### Error SSL

```bash
# Cek SSL certificate
certbot certificates

# Renew SSL
certbot renew
```

### Error Database

```bash
# Test connection ke Supabase
psql $DATABASE_URL

# Cek apakah tables sudah ada
\dt
```

---

## Cost Summary

| Service               | Cost            |
|-----------------------|-----------------|
| IDCloudHost VPS       | Rp 87.000/bulan |
| Domain .my.id         | Gratis          |
| Vercel                | Gratis          |
| Supabase              | Gratis          |
| **Total**             | **Rp 87.000/bulan** |

---

## Support

Jika ada masalah:
1. Cek logs: `docker-compose logs -f`
2. Cek status: `docker-compose ps`
3. Restart: `docker-compose restart`
4. Stop: `docker-compose down`
5. Start: `docker-compose up -d`
