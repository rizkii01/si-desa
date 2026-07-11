const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const logger = require('../utils/logger');

exports.getDashboard = async (req, res) => {
  try {
    const { rows: wargaRows } = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'warga'");
    const { rows: antrianRows } = await pool.query("SELECT COUNT(*) AS total FROM pengajuan_antrian WHERE status = 'Pending'");
    const { rows: pengaduanRows } = await pool.query("SELECT COUNT(*) AS total FROM pengaduan WHERE status IN ('Baru', 'Diproses')");
    const { rows: smartSurat } = await pool.query("SELECT COUNT(*) AS total FROM smart_letter_submissions WHERE status = 'Menunggu'");

    res.json({
      total_warga: wargaRows[0].total,
      antrian_pending: antrianRows[0].total,
      pengaduan_aktif: pengaduanRows[0].total,
      smart_letter_pending: smartSurat[0].total,
    });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};



exports.getResidents = async (req, res) => {
  try {
    const { rt, rw, search, status_keluarga } = req.query;
    let query = "SELECT id, nik, nama_lengkap, no_kk, rt, rw, status_keluarga, tempat_lahir, tanggal_lahir, jenis_kelamin, is_active, created_at FROM users WHERE role = 'warga'";
    const params = [];
    const conditions = [];

    if (rt) {
      conditions.push(`rt = $${params.length + 1}`);
      params.push(rt);
    }
    if (rw) {
      conditions.push(`rw = $${params.length + 1}`);
      params.push(rw);
    }
    if (status_keluarga) {
      conditions.push(`status_keluarga = $${params.length + 1}`);
      params.push(status_keluarga);
    }
    if (search) {
      conditions.push(`(nama_lengkap ILIKE $${params.length + 1} OR nik ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY nama_lengkap ASC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getResident = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir,
              jenis_kelamin, no_kk, rt, rw, status_keluarga, agama, pekerjaan,
              pendidikan_terakhir, status_perkawinan, nama_ayah, nama_ibu,
              kewarganegaraan, is_active, must_change_password, created_at
       FROM users WHERE id = $1 AND role = 'warga'`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Warga tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createResident = async (req, res) => {
  try {
    const { nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
            no_kk, rt, rw, status_keluarga, agama, pekerjaan, pendidikan_terakhir, status_perkawinan,
            nama_ayah, nama_ibu, kewarganegaraan } = req.body;
    if (!nik || !nama_lengkap || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({ message: 'NIK, nama, tanggal lahir, dan jenis kelamin harus diisi' });
    }
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE nik = $1', [nik]);
    if (existing.length > 0) return res.status(400).json({ message: 'NIK sudah terdaftar' });

    const hashedDate = await bcrypt.hash(tanggal_lahir, 10);
    await pool.query(
      `INSERT INTO users (nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, password_hash, jenis_kelamin, role, must_change_password,
        no_kk, rt, rw, status_keluarga, agama, pekerjaan, pendidikan_terakhir, status_perkawinan, nama_ayah, nama_ibu, kewarganegaraan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'warga', true,
        $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [nik, nama_lengkap, email || null, no_hp || null, alamat || null, tempat_lahir || null, tanggal_lahir, hashedDate, jenis_kelamin,
        no_kk || null, rt || null, rw || null, status_keluarga || null, agama || null, pekerjaan || null, pendidikan_terakhir || null,
        status_perkawinan || null, nama_ayah || null, nama_ibu || null, kewarganegaraan || 'WNI']
    );
    res.status(201).json({ message: 'Warga berhasil ditambahkan' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateResident = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
            no_kk, rt, rw, status_keluarga, agama, pekerjaan, pendidikan_terakhir, status_perkawinan,
            nama_ayah, nama_ibu, kewarganegaraan } = req.body;
    const { id } = req.params;

    await client.query('BEGIN');

    const { rows: currentRows } = await client.query("SELECT nik, tanggal_lahir FROM users WHERE id = $1 AND role = 'warga' FOR UPDATE", [id]);
    if (currentRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }
    const oldNik = currentRows[0].nik;
    const dbDate = currentRows[0].tanggal_lahir;
    const dbDateStr = dbDate instanceof Date
      ? dbDate.getFullYear() + '-' + String(dbDate.getMonth() + 1).padStart(2, '0') + '-' + String(dbDate.getDate()).padStart(2, '0')
      : String(dbDate);
    const dateChanged = tanggal_lahir && tanggal_lahir !== dbDateStr;
    const finalPasswordHash = dateChanged
      ? await bcrypt.hash(tanggal_lahir, 10)
      : undefined;

    if (nik) {
      const { rows: dup } = await client.query('SELECT id FROM users WHERE nik = $1 AND id != $2', [nik, id]);
      if (dup.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'NIK sudah digunakan warga lain' });
      }
    }

    if (dateChanged) {
      await client.query(
        `UPDATE users SET nik=$1, nama_lengkap=$2, email=$3, no_hp=$4, alamat=$5, tempat_lahir=$6, tanggal_lahir=$7, password_hash=$8, jenis_kelamin=$9,
         no_kk=$10, rt=$11, rw=$12, status_keluarga=$13, agama=$14, pekerjaan=$15, pendidikan_terakhir=$16, status_perkawinan=$17, nama_ayah=$18, nama_ibu=$19, kewarganegaraan=$20
         WHERE id=$21`,
        [nik, nama_lengkap, email || null, no_hp || null, alamat || null, tempat_lahir || null, tanggal_lahir, finalPasswordHash, jenis_kelamin,
         no_kk || null, rt || null, rw || null, status_keluarga || null, agama || null, pekerjaan || null, pendidikan_terakhir || null,
         status_perkawinan || null, nama_ayah || null, nama_ibu || null, kewarganegaraan || 'WNI', id]
      );
    } else {
      await client.query(
        `UPDATE users SET nik=$1, nama_lengkap=$2, email=$3, no_hp=$4, alamat=$5, tempat_lahir=$6, jenis_kelamin=$7,
         no_kk=$8, rt=$9, rw=$10, status_keluarga=$11, agama=$12, pekerjaan=$13, pendidikan_terakhir=$14, status_perkawinan=$15, nama_ayah=$16, nama_ibu=$17, kewarganegaraan=$18
         WHERE id=$19`,
        [nik, nama_lengkap, email || null, no_hp || null, alamat || null, tempat_lahir || null, jenis_kelamin,
         no_kk || null, rt || null, rw || null, status_keluarga || null, agama || null, pekerjaan || null, pendidikan_terakhir || null,
         status_perkawinan || null, nama_ayah || null, nama_ibu || null, kewarganegaraan || 'WNI', id]
      );
    }
    if (nik && nik !== oldNik) {
      await client.query('UPDATE pengajuan_antrian SET nik = $1 WHERE nik = $2', [nik, oldNik]);
      await client.query('UPDATE pengaduan SET nik = $1 WHERE nik = $2', [nik, oldNik]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Data warga berhasil diperbarui' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (client) client.release();
  }
};

exports.deactivateResident = async (req, res) => {
  try {
    const result = await pool.query("UPDATE users SET is_active = false WHERE id = $1 AND role = 'warga'", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Warga tidak ditemukan' });
    res.json({ message: 'Akun warga berhasil dinonaktifkan' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, nik, nama_lengkap, email, no_hp, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { nik, nama_lengkap, email, no_hp, tanggal_lahir, jenis_kelamin } = req.body;
    if (!nik || !nama_lengkap || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({ message: 'NIK, nama, tanggal lahir, dan jenis kelamin harus diisi' });
    }
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE nik = $1', [nik]);
    if (existing.length > 0) return res.status(400).json({ message: 'NIK sudah terdaftar' });

    const hashedDate = await bcrypt.hash(tanggal_lahir, 10);
    await pool.query(
      "INSERT INTO users (nik, nama_lengkap, email, no_hp, tanggal_lahir, password_hash, jenis_kelamin, role, must_change_password) VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin', true)",
      [nik, nama_lengkap, email || null, no_hp || null, tanggal_lahir, hashedDate, jenis_kelamin]
    );
    res.status(201).json({ message: 'Admin berhasil ditambahkan' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deactivateAdmin = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menonaktifkan akun sendiri' });
    }
    const result = await pool.query("UPDATE users SET is_active = false WHERE id = $1 AND role = 'admin'", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' });
    res.json({ message: 'Admin berhasil dinonaktifkan' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Antrian masih dipertahankan untuk kompatibilitas
exports.getQueues = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT pa.*, w.nama_lengkap, w.no_hp FROM pengajuan_antrian pa JOIN users w ON pa.nik = w.nik ORDER BY pa.tanggal ASC, pa.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateQueue = async (req, res) => {
  try {
    const { nomor_antrian, status } = req.body;
    const validStatus = ['Pending', 'Terverifikasi', 'Selesai'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    if (nomor_antrian) {
      const { rows: dup } = await pool.query(
        'SELECT id FROM pengajuan_antrian WHERE nomor_antrian = $1 AND tanggal = (SELECT tanggal FROM pengajuan_antrian WHERE id = $2) AND id != $3',
        [nomor_antrian, req.params.id, req.params.id]
      );
      if (dup.length > 0) return res.status(400).json({ message: 'Nomor antrian sudah digunakan untuk tanggal ini' });
    }

    await pool.query(
      'UPDATE pengajuan_antrian SET nomor_antrian = $1, status = $2 WHERE id = $3',
      [nomor_antrian || null, status, req.params.id]
    );
    res.json({ message: 'Antrian berhasil diperbarui' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// [DEPRECATED] Pengaduan masih dipertahankan untuk kompatibilitas
exports.getComplaints = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, w.nama_lengkap AS nama_warga, w.no_hp FROM pengaduan p LEFT JOIN users w ON p.nik = w.nik ORDER BY p.tanggal_pengaduan DESC'
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { status, balasan_admin } = req.body;
    const validStatus = ['Baru', 'Diproses', 'Selesai'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    await pool.query(
      'UPDATE pengaduan SET status = $1, balasan_admin = $2 WHERE id = $3',
      [status, balasan_admin || null, req.params.id]
    );
    res.json({ message: 'Aduan berhasil diperbarui' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
