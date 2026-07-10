-- Migration: Create tables for pengaduan and pengajuan_antrian
-- Database: PostgreSQL (Supabase)
-- Date: 2026-07-07

-- --------------------------------------------------------
-- Tabel: pengaduan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengaduan (
  id SERIAL PRIMARY KEY,
  nik VARCHAR(16) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL, -- nama pengadu
  isi_aduan TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Baru' CHECK (status IN ('Baru', 'Diproses', 'Selesai')),
  balasan_admin TEXT DEFAULT NULL,
  tanggal_pengaduan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pengaduan_user_nik FOREIGN KEY (nik) REFERENCES users(nik) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pengaduan_nik ON pengaduan(nik);
CREATE INDEX IF NOT EXISTS idx_pengaduan_status ON pengaduan(status);

-- --------------------------------------------------------
-- Tabel: pengajuan_antrian
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengajuan_antrian (
  id SERIAL PRIMARY KEY,
  nik VARCHAR(16) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  jenis_layanan VARCHAR(50) NOT NULL,
  nomor_antrian INT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Terverifikasi', 'Selesai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_antrian_user_nik FOREIGN KEY (nik) REFERENCES users(nik) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_antrian_nik ON pengajuan_antrian(nik);
CREATE INDEX IF NOT EXISTS idx_antrian_tanggal ON pengajuan_antrian(tanggal);
CREATE INDEX IF NOT EXISTS idx_antrian_status ON pengajuan_antrian(status);
