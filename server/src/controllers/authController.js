const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

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
  created_at: user.created_at,
});

const getAttemptKey = (req, nik) => `${req.ip}:${nik || 'unknown'}`;

const isBlocked = (key) => {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;
  if (Date.now() - attempt.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return attempt.count >= MAX_LOGIN_ATTEMPTS;
};

const recordFailedAttempt = (key) => {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || now - attempt.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }
  attempt.count += 1;
};

const parseDate = (str) => {
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{2})-(\d{2})-(\d{4})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{2})(\d{2})(\d{4})$/,
  ];
  for (const fmt of formats) {
    const m = str.match(fmt);
    if (m) {
      const [_, a, b, c] = m;
      if (fmt === formats[0] || fmt === formats[2] || fmt === formats[4]) {
        return `${a}-${b}-${c}`;
      }
      return `${c}-${b}-${a}`;
    }
  }
  return null;
};

exports.login = async (req, res) => {
  try {
    const { nik, password } = req.body;
    const attemptKey = getAttemptKey(req, nik);

    if (!nik || !password) {
      return res.status(400).json({ message: 'NIK dan Tanggal Lahir harus diisi' });
    }
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ message: 'NIK harus 16 digit angka' });
    }

    const tanggalLahir = parseDate(password);
    if (!tanggalLahir) {
      return res.status(400).json({ message: 'Format tanggal lahir tidak valid' });
    }
    if (isBlocked(attemptKey)) {
      return res.status(429).json({ message: 'Terlalu banyak percobaan login. Coba lagi beberapa menit lagi' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE nik = ?',
      [nik]
    );

    if (rows.length === 0 || !(await bcrypt.compare(tanggalLahir, rows[0].password_hash))) {
      recordFailedAttempt(attemptKey);
      return res.status(401).json({ message: 'NIK atau Tanggal Lahir tidak ditemukan' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, nik: user.nik, nama: user.nama_lengkap, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: toUserResponse(user),
    });
    loginAttempts.delete(attemptKey);
  } catch (err) {
    console.error('LOGIN ERROR:', err.message, err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, foto_profil, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(toUserResponse(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
