# e-Desa - Layanan Desa Cemara

Aplikasi manajemen layanan desa terintegrasi berbasis web. Warga dapat mengajukan surat secara digital (Smart Letter), mengambil antrian, dan menyampaikan pengaduan secara online. Admin dapat mengelola data warga, admin, dan seluruh pengajuan layanan.

## 🌟 Fitur Utama

- **Smart Letter Service** - Surat dinamis dengan validasi field berbeda untuk setiap jenis surat
- **Auto-generated Nomor Surat** - Format otomatis (NNN/KODE/BLN-ROMAWI/TAHUN)
- **Notification System** - Notifikasi real-time untuk warga dan admin
- **File Upload** - Upload dokumen pendukung (max 5MB, JPG/PNG/PDF)
- **Multi-role** - Dashboard berbeda untuk warga dan admin
- **Modern Tech Stack** - React 19, Express 5, PostgreSQL

## Tech Stack

### Frontend
- React 19.2.6
- React Router 7.17.0
- Vite 8.0.12
- Tailwind CSS 4.3.1
- Axios 1.17.0
- react-hot-toast 2.6.0

### Backend
- Node.js (CommonJS)
- Express 5.2.1
- JWT (jsonwebtoken 9.0.3)
- bcryptjs 3.0.3
- Multer 2.1.1 (file upload)
- PostgreSQL 8.22.0
- express-validator 7.3.2

### Database
- PostgreSQL

## Struktur Folder

```
si-desa/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/            # API configuration (axios)
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (AuthContext)
│   │   ├── layouts/        # Layout components (Public, Citizen, Admin)
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── citizen/    # Citizen pages
│   │   │   └── public/     # Public pages
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── index.html
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── config/         # Database & migrations config
│   │   │   └── migrations/ # SQL migration files
│   │   ├── controllers/    # Business logic
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── notificationController.js
│   │   │   ├── smartLetterController.js
│   │   │   └── wargaController.js
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   │   ├── letterNumber.js
│   │   │   ├── letterSchemas.js
│   │   │   ├── letterValidation.js
│   │   │   └── referenceNumber.js
│   │   └── index.js        # Main entry point
│   ├── migrations/         # Additional migration files
│   ├── .env.example
│   └── package.json
└── uploads/               # File uploads (profil, smart letter)
```

## Setup

### Prasyarat
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Clone & Install dependencies

```bash
git clone <repo-url> si-desa
cd si-desa

# Backend
cd server
cp .env.example .env
npm install

# Frontend
cd ../client
npm install
```

### 2. Konfigurasi Environment

Edit `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=desa2
JWT_SECRET=isi-dengan-string-acak-minimal-32-karakter
JWT_EXPIRES_IN=7d
```

#### Jika Menggunakan Supabase PostgreSQL

Jika Anda menggunakan Supabase, copy `DATABASE_URL` dari Dashboard Supabase:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project → Project Settings → Database
3. Scroll ke **Connection string**
4. Copy dan paste ke `.env`:
```env
DATABASE_URL=postgresql://postgres:your-password@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

**Catatan penting:**
- Direct connection menggunakan **IPv6** - pastikan jaringan Anda support IPv6
- Jika koneksi gagal, gunakan **Session Pooler** dengan IPv4:
  ```env
  DATABASE_URL=postgresql://postgres:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
  ```

**Troubleshooting DNS:**
Jika muncul error `ENOTFOUND` atau `DNS resolution failed`, coba:
1. Ganti DNS server ke Google DNS (8.8.8.8) atau Cloudflare (1.1.1.1)
2. Run `ipconfig /flushdns` di Windows
3. Pastikan tidak ada firewall yang memblokir port 5432

Test koneksi:
```bash
cd server
node test-db.js
```
JWT_EXPIRES_IN=7d
```

### 3. Database Setup

#### Buat database
```bash
# Windows (Powershell)
createdb desa2

# Atau via psql
psql -U postgres -c "CREATE DATABASE desa2;"
```

#### Jalankan migration
```bash
# Jalankan migration utama (users, pengajuan, antrian, pengaduan)
psql -U postgres -d desa2 -f server/src/config/migrations/001_smart_letter_service.sql

# Jalankan migration smart letter & notification
psql -U postgres -d desa2 -f server/migrations/002_smart_letter_notifications.sql
```

### 4. Jalankan Aplikasi

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Jenis Surat (Smart Letter)

Sistem mendukung 7 jenis surat dengan validasi field berbeda:

| Kode | Nama Surat | Field Khusus | Berkas Wajib |
|------|-----------|--------------|--------------|
| **SKD** | Surat Keterangan Domisili | tujuan_domisili, lama_tinggal | KTP, Kartu Keluarga |
| **SP** | Surat Pindah | arah_pindah, alamat_asal/tujuan | KTP, Kartu Keluarga, Surat Pengantar RT |
| **SKK** | Surat Keterangan Kelahiran/Kematian | sub_jenis (Kelahiran/Kematian) | KTP, Kartu Keluarga |
| **SKTM** | Surat Keterangan Tidak Mampu | penghasilan_per_bulan, jumlah_tanggungan | KTP, Kartu Keluarga, Surat Pengantar RT |
| **SKU** | Surat Keterangan Usaha | nama_usaha, omzet_per_bulan | KTP, Foto Tempat Usaha |
| **SPN** | Surat Pengantar Nikah | nama_calon_pasangan, tanggal_rencana_nikah | KTP Pemohon, Kartu Keluarga |
| **SPORADIK** | Surat Sporadik / Riwayat Tanah | lokasi_tanah, luas_tanah, batas-batas | KTP |

### Format Nomor Surat
```
NNN/KODE/BLN-ROMAWI/TAHUN
```
Contoh: `001/SKTM/VII/2026`, `012/SKD/I/2027`

- **NNN**: Nomor urut 3 digit (auto-increment)
- **KODE**: Kode jenis surat (SKD, SP, SKK, dll)
- **BLN-ROMAWI**: Bulan dalam angka Romawi (I-XII)
- **TAHUN**: Tahun approval (4 digit)

## Tabel Database

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data pengguna (admin & warga) |
| `smart_letter_submissions` | Pengajuan surat dinamis |
| `smart_letter_files` | File pendukung pengajuan |
| `notifications` | Notifikasi untuk warga & admin |
| `letter_number_sequences` | Sequence nomor surat per jenis/bulan/tahun |

### Tabel Lainnya (legacy)
- `pengajuan_surat` — Surat statis (lama)
- `pengajuan_antrian` — Antrian layanan
- `pengaduan` — Pengaduan warga

### Detail Tabel Smart Letter

**smart_letter_submissions**
- `id` — Primary key
- `user_id` — Foreign key ke users
- `nik`, `nama_lengkap` — Data warga
- `jenis_surat` — SKD, SP, SKK, SKTM, SKU, SPN, SPORADIK
- `form_data` — JSONB (field dinamis)
- `nomor_referensi` — REF-YYYYMMDD-XXXXXX (unique)
- `nomor_surat` — Auto-generated setelah approval
- `status` — Menunggu, Disetujui, Ditolak
- `alasan_penolakan` — Text (jika ditolak)
- `created_at`, `updated_at`

## API Routes

### Authentication
| Method | Route | Deskripsi | Auth |
|--------|-------|-----------|------|
| POST | `/api/auth/login` | Login (NIK + Tanggal Lahir) | No |
| GET | `/api/auth/me` | Profile user saat ini | Yes |

### Warga Routes
| Method | Route | Deskripsi | Auth |
|--------|-------|-----------|------|
| GET | `/api/warga/profile` | Lihat profil warga | Yes |
| PUT | `/api/warga/profile` | Update profil (email, no_hp, alamat) | Yes |
| POST | `/api/warga/profile/photo` | Upload foto profil | Yes |
| POST | `/api/warga/smart-letter` | Ajukan surat dinamis | Yes |
| GET | `/api/warga/smart-letters` | Riwayat pengajuan surat | Yes |
| GET | `/api/warga/smart-letters/:id` | Detail pengajuan + files | Yes |
| GET | `/api/warga/notifications` | Daftar notifikasi | Yes |
| GET | `/api/warga/notifications/unread-count` | Jumlah notifikasi belum dibaca | Yes |
| PUT | `/api/warga/notifications/:id/read` | Tandai sebagai dibaca | Yes |
| PUT | `/api/warga/notifications/read-all` | Tandai semua sebagai dibaca | Yes |

### Admin Routes
| Method | Route | Deskripsi | Auth |
|--------|-------|-----------|------|
| GET | `/api/admin/dashboard` | Statistik dashboard | Yes (admin) |
| GET | `/api/admin/residents` | Daftar warga | Yes (admin) |
| POST | `/api/admin/residents` | Tambah warga baru | Yes (admin) |
| GET | `/api/admin/residents/:id` | Detail warga | Yes (admin) |
| PUT | `/api/admin/residents/:id` | Update warga | Yes (admin) |
| DELETE | `/api/admin/residents/:id` | Hapus warga | Yes (admin) |
| GET | `/api/admin/admins` | Daftar admin | Yes (admin) |
| POST | `/api/admin/admins` | Tambah admin | Yes (admin) |
| DELETE | `/api/admin/admins/:id` | Hapus admin | Yes (admin) |
| GET | `/api/admin/smart-letters` | Daftar pengajuan surat | Yes (admin) |
| PUT | `/api/admin/smart-letters/:id/approve` | Approve surat | Yes (admin) |
| PUT | `/api/admin/smart-letters/:id/reject` | Reject surat | Yes (admin) |
| GET | `/api/admin/smart-letters/:id` | Detail pengajuan + files | Yes (admin) |
| GET | `/api/admin/notifications` | Daftar notifikasi | Yes (admin) |
| GET | `/api/admin/notifications/unread-count` | Jumlah notifikasi belum dibaca | Yes (admin) |
| PUT | `/api/admin/notifications/:id/read` | Tandai sebagai dibaca | Yes (admin) |

### Request Body Examples

**Login**
```json
{
  "nik": "3171XXXXXXXXXX",
  "tanggal_lahir": "2000-01-15"
}
```

**Submit Smart Letter**
```json
{
  "jenis_surat": "SKTM",
  "form_data": {
    "penghasilan_per_bulan": "3000000",
    "jumlah_tanggungan": "4",
    "keperluan_sktm": "Beasiswa",
    "keterangan_ekonomi": "Penghasilan tidak tetap..."
  }
}
```

**Approve Letter**
```json
{
  "alasan_penolakan": "Berkas tidak lengkap"  // Optional, wajib jika reject
}
```

## Utility Functions

### Letter Number Generator
Format: `NNN/KODE/BLN-ROMAWI/TAHUN`
- Auto-increment sequence per jenis/bulan/tahun
- Roman numeral month (I-XII)
- Atomic database operations

### Reference Number Generator
Format: `REF-YYYYMMDD-XXXXXX`
- Date-based prefix
- Random 6-char hex suffix
- Unique per submission

### Letter Schemas
Setiap jenis surat memiliki:
- `label` — Nama lengkap surat
- `fields` — Array field dinamis (required, type, options, conditional)
- `berkasRequired` — Berkas wajib
- `berkasOptional` — Berkas opsional

### Validation
- Required field checking
- Conditional field validation (showWhen logic)
- File format validation (JPG/PNG/PDF)
- File size limit (5MB)

## Development

### Run Tests
```bash
# Backend
cd server
npm test

# Frontend (jika sudah ada test setup)
cd client
npm test
```

### Lint
```bash
# Frontend
cd client
npm run lint
```

## Troubleshooting

### Database Connection Error
Pastikan PostgreSQL berjalan dan kredensial di `.env` sudah benar:
```bash
# Test koneksi
psql -U postgres -d desa2 -h localhost
```

### JWT Error
Pastikan `JWT_SECRET` di `.env` sudah diisi dengan string minimal 32 karakter.

### File Upload Issues
Pastikan folder `uploads` bisa diakses dan memiliki permission yang benar.

## Kontribusi

1. Fork repository
2. Buat branch fitur baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## Lisensi

ISC
