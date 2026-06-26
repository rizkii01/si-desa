# e-Desa

Aplikasi manajemen layanan desa terintegrasi. Warga dapat mengajukan surat, mengambil antrian, dan menyampaikan pengaduan secara online. Admin dapat mengelola data warga, admin, dan seluruh pengajuan.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, React Router 7, Axios, Tailwind CSS 4, Vite 8 |
| Backend | Node.js, Express 5, JWT, bcryptjs, Multer, mysql2 |
| Database | MySQL |

## Struktur Folder

```
desa2/
├── client/         # Frontend (React + Vite)
├── server/         # Backend (Express)
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── uploads/        # File uploads (profil/, berkas)
```

## Setup

### Prasyarat
- Node.js 18+
- MySQL server

### 1. Clone & Install dependencies

```bash
git clone <repo-url> desa2
cd desa2

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
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=desa2
JWT_SECRET=isi-dengan-string-acak
```

### 3. Database

Buat database dan jalankan migration (manual — buat tabel sesuai struktur di bawah).

### 4. Jalankan

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Frontend berjalan di `http://localhost:5173`, backend di `http://localhost:5000`.

## Tabel Database

- **users** — `id`, `nik`, `nama_lengkap`, `email`, `no_hp`, `alamat`, `tempat_lahir`, `tanggal_lahir`, `password_hash`, `foto_profil`, `jenis_kelamin` (Laki-laki/Perempuan), `role` (admin/warga), `created_at`
- **pengajuan_surat** — `id`, `nik`, `nama_lengkap`, `tanggal_pengajuan`, `jenis_layanan`, `keperluan`, `berkas_pendukung`, `status` (Pending/Diproses/Selesai/Ditolak), `catatan_admin`
- **pengajuan_antrian** — `id`, `nik`, `nama_lengkap`, `tanggal`, `jenis_layanan`, `nomor_antrian`, `status` (Pending/Terverifikasi/Selesai)
- **pengaduan** — `id`, `nik`, `nama_lengkap`, `isi_aduan`, `tanggal_pengaduan`, `status` (Baru/Diproses/Selesai), `balasan_admin`

## API Routes

### Auth
| Method | Route | Deskripsi |
|--------|-------|-----------|
| POST | `/api/auth/login` | Login (NIK + Tanggal Lahir) |
| GET | `/api/auth/me` | Profile user saat ini |

### Warga (role: warga)
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/api/warga/profile` | Lihat profil |
| PUT | `/api/warga/profile` | Update profil (email, no_hp, alamat) |
| POST | `/api/warga/profile/photo` | Upload foto profil |
| POST | `/api/warga/submissions/letters` | Ajukan surat |
| POST | `/api/warga/submissions/queues` | Ambil antrian |
| POST | `/api/warga/submissions/complaints` | Buat aduan |
| GET | `/api/warga/submissions/history` | Riwayat pengajuan |

### Admin (role: admin)
| Method | Route | Deskripsi |
|--------|-------|-----------|
| GET | `/api/admin/dashboard` | Statistik dashboard |
| GET/POST | `/api/admin/residents` | CRUD warga |
| GET/PUT/DELETE | `/api/admin/residents/:id` | Detail/update/hapus warga |
| GET/POST/DELETE | `/api/admin/admins` | CRUD admin |
| GET/PUT | `/api/admin/submissions/letters` | Kelola pengajuan surat |
| GET/PUT | `/api/admin/submissions/queues` | Kelola antrian |
| GET/PUT | `/api/admin/submissions/complaints` | Kelola aduan |
