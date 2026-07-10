const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const logger = require('../utils/logger');

const fotoUrl = (filename) => (filename ? `/uploads/profil/${filename}` : null);

const toUserResponse = (user) => ({
  id: user.id,
  nik: user.nik,
  nama_lengkap: user.nama_lengkap,
  email: user.email || null,
  no_hp: user.no_hp || null,
  alamat: user.alamat || null,
  tempat_lahir: user.tempat_lahir || null,
  tanggal_lahir: user.tanggal_lahir || null,
  jenis_kelamin: user.jenis_kelamin || null,
  foto_profil: fotoUrl(user.foto_profil),
  role: user.role,
  must_change_password: user.must_change_password,
  created_at: user.created_at,
});

exports.login = async (req, res) => {
  try {
    const { nik, password } = req.body;

    const {rows} = await pool.query(
      'SELECT * FROM users WHERE nik = $1',
      [nik]
    );

    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan. Hubungi admin desa.' });
    }

    if (user.tanggal_lahir) {
      const today = new Date();
      const birth = new Date(user.tanggal_lahir);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age < 17) {
        return res.status(403).json({ message: 'Akun hanya bisa diakses oleh warga berusia 17 tahun ke atas.' });
      }
    }

    const token = jwt.sign(
      { id: user.id, nik: user.nik, nama: user.nama_lengkap, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    logger.error('LOGIN ERROR: ' + err.message, { stack: err.stack });
    res.status(500).json({ message: 'Gagal login, coba lagi', error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, foto_profil, role, must_change_password, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(toUserResponse(rows[0]));
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Gagal memuat profil', error: err.message });
  }
};
