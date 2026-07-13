const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { logActivity } = require('../utils/activityLogger');

const fotoUrl = (filename) => (filename ? `/uploads/profil/${filename}` : null);

const toProfileResponse = (user) => ({
  ...user,
  foto_profil: fotoUrl(user.foto_profil),
});

const getCurrentUser = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, nik, nama_lengkap FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

exports.getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, foto_profil, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(toProfileResponse(rows[0]));
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, no_hp, alamat } = req.body;
    await pool.query(
      'UPDATE users SET email = $1, no_hp = $2, alamat = $3 WHERE id = $4',
      [email || null, no_hp || null, alamat || null, req.user.id]
    );
    await logActivity(req.user.id, 'profile_updated', 'profile', req.user.id,
      'Memperbarui data profil (email, no HP, alamat)');
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

    const { rows } = await pool.query('SELECT foto_profil FROM users WHERE id = $1', [req.user.id]);
    if (rows.length > 0 && rows[0].foto_profil) {
      const oldPath = path.join(__dirname, '..', '..', '..', 'uploads', 'profil', rows[0].foto_profil);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query('UPDATE users SET foto_profil = $1 WHERE id = $2', [req.file.filename, req.user.id]);
    res.json({ foto_profil: fotoUrl(req.file.filename), message: 'Foto berhasil diupload' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Antrian masih dipertahankan untuk kompatibilitas
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

    const { rows: existing } = await pool.query(
      'SELECT id FROM pengajuan_antrian WHERE nik = $1 AND tanggal = $2 AND status = $3',
      [user.nik, tanggal, 'Pending']
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Anda sudah memiliki antrian pending di tanggal tersebut' });
    }

    const { rows: countRows } = await pool.query(
      'SELECT COALESCE(MAX(nomor_antrian), 0) + 1 AS next_nomor FROM pengajuan_antrian WHERE tanggal = $1',
      [tanggal]
    );
    const nomorAntrian = countRows[0].next_nomor;

    const { rows: insRows } = await pool.query(
      'INSERT INTO pengajuan_antrian (nik, nama_lengkap, tanggal, jenis_layanan, nomor_antrian, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user.nik, user.nama_lengkap, tanggal, jenis_layanan, nomorAntrian, 'Pending']
    );

    const { rows: admins } = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (admins.length > 0) {
      const notifValues = admins.map(a => [a.id, 'new_queue', 'Antrian Baru', `${user.nama_lengkap} mengajukan antrian ${jenis_layanan} tanggal ${tanggal} (No. ${nomorAntrian})`]);
      const placeholders = notifValues.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(', ');
      await pool.query(`INSERT INTO notifications (user_id, type, title, message) VALUES ${placeholders}`, notifValues.flat());
    }

    await logActivity(req.user.id, 'queue_submitted', 'queue', insRows[0].id,
      `Mengajukan antrian ${jenis_layanan} tanggal ${tanggal} (No. ${nomorAntrian})`);

    res.status(201).json({ message: 'Antrian berhasil diajukan', nomor_antrian: nomorAntrian });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Pengaduan masih dipertahankan untuk kompatibilitas
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

    const { rows: admins } = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (admins.length > 0) {
      const notifValues = admins.map(a => [a.id, 'new_complaint', 'Pengaduan Baru', `${user.nama_lengkap} mengirim pengaduan baru: "${isi_aduan.slice(0, 80)}..."`]);
      const placeholders = notifValues.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(', ');
      await pool.query(`INSERT INTO notifications (user_id, type, title, message) VALUES ${placeholders}`, notifValues.flat());
    }

    await logActivity(req.user.id, 'complaint_submitted', 'complaint', null,
      `Mengirim pengaduan: "${isi_aduan.slice(0, 100)}"`);

    res.status(201).json({ message: 'Aduan berhasil dikirim' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password_lama, password_baru } = req.body;

    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (!(await bcrypt.compare(password_lama, rows[0].password_hash))) {
      return res.status(400).json({ message: 'Password lama salah' });
    }

    const hashedBaru = await bcrypt.hash(password_baru, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2',
      [hashedBaru, req.user.id]
    );

    await logActivity(req.user.id, 'password_changed', 'profile', req.user.id,
      'Mengubah password');

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const { rows: antrian } = await pool.query(
      'SELECT id, tanggal, jenis_layanan, nomor_antrian, status FROM pengajuan_antrian WHERE nik = $1 ORDER BY tanggal DESC, created_at DESC',
      [user.nik]
    );
    const { rows: pengaduan } = await pool.query(
      'SELECT id, nama_lengkap, isi_aduan, status, balasan_admin, tanggal_pengaduan FROM pengaduan WHERE nik = $1 ORDER BY tanggal_pengaduan DESC',
      [user.nik]
    );

    res.json({ antrian, pengaduan });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getActivityHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM activity_history WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].total);

    const { rows } = await pool.query(
      `SELECT id, action, entity_type, entity_id, description, metadata, created_at
       FROM activity_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
