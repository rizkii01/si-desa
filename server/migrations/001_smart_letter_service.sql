-- ============================================================
-- Migration: Initial Smart Letter Service Schema
-- Database: PostgreSQL (Supabase)
-- Date: 2026-07-05
-- ============================================================

-- --------------------------------------------------------
-- Tabel: users (jika belum ada)
-- Catatan: Jika tabel users sudah ada di database Anda,
--          abaikan bagian ini
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nik VARCHAR(16) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  no_hp VARCHAR(20),
  alamat TEXT,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  password_hash VARCHAR(255) NOT NULL,
  foto_profil VARCHAR(255),
  jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  role VARCHAR(10) NOT NULL DEFAULT 'warga' CHECK (role IN ('admin', 'warga')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 
-- CREATE INDEX idx_users_nik ON users(nik);
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_role ON users(role);

-- --------------------------------------------------------
-- Tabel: letter_number_sequences
--    Menyimpan sequence nomor surat per jenis/bulan/tahun
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS letter_number_sequences (
  jenis_surat VARCHAR(20) NOT NULL CHECK (jenis_surat IN ('SKD','SP','SKK','SKTM','SKU','SPN','SPORADIK')),
  bulan SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun SMALLINT NOT NULL,
  sequence_number SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (jenis_surat, bulan, tahun)
);

-- --------------------------------------------------------
-- Tabel: smart_letter_submissions
--    Pengajuan surat dinamis (smart letter)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS smart_letter_submissions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  nik VARCHAR(16) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_surat VARCHAR(20) NOT NULL CHECK (jenis_surat IN ('SKD','SP','SKK','SKTM','SKU','SPN','SPORADIK')),
  form_data JSONB NOT NULL,
  nomor_referensi VARCHAR(30) NOT NULL UNIQUE,
  nomor_surat VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Disetujui', 'Ditolak')),
  alasan_penolakan TEXT DEFAULT NULL,
  tanggal_pengajuan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tanggal_disetujui TIMESTAMPTZ DEFAULT NULL,
  approved_by INT DEFAULT NULL
);

CREATE INDEX idx_smart_user_id ON smart_letter_submissions(user_id);
CREATE INDEX idx_smart_status ON smart_letter_submissions(status);
CREATE INDEX idx_smart_jenis_surat ON smart_letter_submissions(jenis_surat);
CREATE INDEX idx_smart_nomor_referensi ON smart_letter_submissions(nomor_referensi);

-- Constraints handled in earlier migration; removed to avoid duplication

-- --------------------------------------------------------
-- Tabel: smart_letter_files
--    File pendukung untuk smart letter submissions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS smart_letter_files (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_files_submission_id ON smart_letter_files(submission_id);
-- Constraint fk_files_submission already created in previous migrations; no action needed.

-- --------------------------------------------------------
-- Tabel: notifications
--    Notifikasi untuk warga dan admin
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  submission_id INT DEFAULT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user_id ON notifications(user_id);
CREATE INDEX idx_notif_is_read ON notifications(is_read);
CREATE INDEX idx_notif_created_at ON notifications(created_at);

ALTER TABLE notifications
  ADD CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_notif_submission FOREIGN KEY (submission_id) REFERENCES smart_letter_submissions(id) ON DELETE SET NULL;

-- ============================================================
-- Komentar:
-- 1. Gunakan JSONB untuk form_data untuk query JSON yang efisien
-- 2. Gunakan TIMESTAMPTZ untuk semua kolom datetime
-- 3. Gunakan BOOLEAN untuk is_read (bukan TINYINT)
-- 4. Gunakan SERIAL untuk auto-increment primary keys
-- 5. Gunakan VARCHAR dengan CHECK constraint untuk ENUM-like behavior
-- ============================================================
