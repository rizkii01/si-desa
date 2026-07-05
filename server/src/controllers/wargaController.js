const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

const fotoUrl = (filename) => (filename ? `/uploads/profil/${filename}` : null);
const berkasUrls = (value) => (
  value
    ? String(value).split(',').filter(Boolean).map((filename) => `/uploads/${filename}`)
    : []
);

const toProfileResponse = (user) => ({
  ...user,
  foto_profil: fotoUrl(user.foto_profil),
});

const toLetterResponse = (letter) => ({
  ...letter,
  berkas: berkasUrls(letter.berkas_pendukung),
});

const getCurrentUser = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, nik, nama_lengkap FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, foto_profil, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(toProfileResponse(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, no_hp, alamat } = req.body;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    if (no_hp && no_hp.length > 15) {
      return res.status(400).json({ message: 'No HP maksimal 15 karakter' });
    }
    await pool.query(
      'UPDATE users SET email = $1, no_hp = $2, alamat = $3 WHERE id = $4',
      [email || null, no_hp || null, alamat || null, req.user.id]
    );
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

    const [rows] = await pool.query('SELECT foto_profil FROM users WHERE id = $1', [req.user.id]);
    if (rows.length > 0 && rows[0].foto_profil) {
      const oldPath = path.join(__dirname, '..', '..', '..', 'uploads', 'profil', rows[0].foto_profil);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query('UPDATE users SET foto_profil = $1 WHERE id = $2', [req.file.filename, req.user.id]);
    res.json({ foto_profil: fotoUrl(req.file.filename), message: 'Foto berhasil diupload' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.submitLetter = async (req, res) => {
  try {
    const { jenis_layanan, keperluan } = req.body;
    if (!jenis_layanan || !keperluan) {
      return res.status(400).json({ message: 'Jenis layanan dan keperluan harus diisi' });
    }

    const berkas = req.files ? req.files.map(f => f.filename).join(',') : '';

    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    await pool.query(
      'INSERT INTO pengajuan_surat (nik, nama_lengkap, jenis_layanan, keperluan, berkas_pendukung, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.nik, user.nama_lengkap, jenis_layanan, keperluan, berkas, 'Pending']
    );
    res.status(201).json({ message: 'Pengajuan surat berhasil dikirim' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.submitQueue = async (req, res) => {
  try {
    const { tanggal, jenis_layanan } = req.body;
    if (!tanggal || !jenis_layanan) {
      return res.status(400).json({ message: 'Tanggal dan jenis layanan harus diisi' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (tanggal < today) {
      return res.status(400).json({ message: 'Tanggal tidak boleh di masa lalu' });
    }

    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const [existing] = await pool.query(
      'SELECT id FROM pengajuan_antrian WHERE nik = $1 AND tanggal = $2 AND status = $3',
      [user.nik, tanggal, 'Pending']
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Anda sudah memiliki antrian pending di tanggal tersebut' });
    }

    await pool.query(
      'INSERT INTO pengajuan_antrian (nik, nama_lengkap, tanggal, jenis_layanan, status) VALUES ($1, $2, $3, $4, $5)',
      [user.nik, user.nama_lengkap, tanggal, jenis_layanan, 'Pending']
    );
    res.status(201).json({ message: 'Antrian berhasil diajukan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.submitComplaint = async (req, res) => {
  try {
    const { nama_pengadu, isi_aduan } = req.body;
    if (!nama_pengadu || !isi_aduan) {
      return res.status(400).json({ message: 'Nama dan isi aduan harus diisi' });
    }
    if (isi_aduan.length < 20) {
      return res.status(400).json({ message: 'Isi aduan minimal 20 karakter' });
    }

    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    await pool.query(
      'INSERT INTO pengaduan (nik, nama_lengkap, isi_aduan, status) VALUES ($1, $2, $3, $4)',
      [user.nik, nama_pengadu, isi_aduan, 'Baru']
    );
    res.status(201).json({ message: 'Aduan berhasil dikirim' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const [surat] = await pool.query(
      'SELECT id, jenis_layanan, keperluan, berkas_pendukung, status, catatan_admin, tanggal_pengajuan FROM pengajuan_surat WHERE nik = $1 ORDER BY tanggal_pengajuan DESC',
      [user.nik]
    );
    const [antrian] = await pool.query(
      'SELECT id, tanggal, jenis_layanan, nomor_antrian, status FROM pengajuan_antrian WHERE nik = $1 ORDER BY tanggal DESC, created_at DESC',
      [user.nik]
    );
    const [pengaduan] = await pool.query(
      'SELECT id, nama_lengkap, isi_aduan, status, balasan_admin, tanggal_pengaduan FROM pengaduan WHERE nik = $1 ORDER BY tanggal_pengaduan DESC',
      [user.nik]
    );

    res.json({ surat: surat.map(toLetterResponse), antrian, pengaduan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
