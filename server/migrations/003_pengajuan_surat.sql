-- Migration: pengajuan_surat table
CREATE TABLE IF NOT EXISTS pengajuan_surat (
  id SERIAL PRIMARY KEY,
  nik VARCHAR(16) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_layanan VARCHAR(50) NOT NULL,
  keperluan TEXT NOT NULL,
  berkas_pendukung TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Diproses', 'Selesai', 'Ditolak')),
  catatan_admin TEXT,
  tanggal_pengajuan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nik) REFERENCES users(nik) ON DELETE CASCADE
);

CREATE INDEX idx_pengajuan_surat_nik ON pengajuan_surat(nik);
CREATE INDEX idx_pengajuan_surat_status ON pengajuan_surat(status);
