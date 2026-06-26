const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const berkasUrls = (value) => (
  value
    ? String(value).split(',').filter(Boolean).map((filename) => `/uploads/${filename}`)
    : []
);

const toLetterResponse = (letter) => ({
  ...letter,
  berkas: berkasUrls(letter.berkas_pendukung),
});

exports.getDashboard = async (req, res) => {
  try {
    const [warga] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'warga'");
    const [surat] = await pool.query(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = 'Diproses' THEN 1 ELSE 0 END) AS diproses FROM pengajuan_surat WHERE status IN ('Pending', 'Diproses')"
    );
    const [antrian] = await pool.query("SELECT COUNT(*) AS total FROM pengajuan_antrian WHERE status = 'Pending'");
    const [pengaduan] = await pool.query("SELECT COUNT(*) AS total FROM pengaduan WHERE status IN ('Baru', 'Diproses')");

    res.json({
      total_warga: warga[0].total,
      surat: surat[0],
      antrian_pending: antrian[0].total,
      pengaduan_aktif: pengaduan[0].total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getResidents = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nik, nama_lengkap, email, no_hp, created_at FROM users WHERE role = 'warga' ORDER BY nama_lengkap ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getResident = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? AND role = 'warga'", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Warga tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createResident = async (req, res) => {
  try {
    const { nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin } = req.body;
    if (!nik || !nama_lengkap || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({ message: 'NIK, nama, tanggal lahir, dan jenis kelamin harus diisi' });
    }
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ message: 'NIK harus 16 digit angka' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE nik = ?', [nik]);
    if (existing.length > 0) return res.status(400).json({ message: 'NIK sudah terdaftar' });

    const hashedDate = await bcrypt.hash(tanggal_lahir, 10);
    await pool.query(
      "INSERT INTO users (nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, password_hash, jenis_kelamin, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'warga')",
      [nik, nama_lengkap, email || null, no_hp || null, alamat || null, tempat_lahir || null, tanggal_lahir, hashedDate, jenis_kelamin]
    );
    res.status(201).json({ message: 'Warga berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateResident = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { nik, nama_lengkap, email, no_hp, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin } = req.body;
    const { id } = req.params;

    await conn.beginTransaction();

    const [currentRows] = await conn.query("SELECT nik, tanggal_lahir FROM users WHERE id = ? AND role = 'warga' FOR UPDATE", [id]);
    if (currentRows.length === 0) {
      await conn.rollback();
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
      const [dup] = await conn.query('SELECT id FROM users WHERE nik = ? AND id != ?', [nik, id]);
      if (dup.length > 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'NIK sudah digunakan warga lain' });
      }
    }

    if (dateChanged) {
      await conn.query(
        'UPDATE users SET nik = ?, nama_lengkap = ?, email = ?, no_hp = ?, alamat = ?, tempat_lahir = ?, tanggal_lahir = ?, password_hash = ?, jenis_kelamin = ? WHERE id = ?',
        [nik, nama_lengkap, email || null, no_hp || null, alamat || null, tempat_lahir || null, tanggal_lahir, finalPasswordHash, jenis_kelamin, id]
      );
    } else {
      await conn.query(
        'UPDATE users SET nik = ?, nama_lengkap = ?, email = ?, no_hp = ?, alamat = ?, tempat_lahir = ?, jenis_kelamin = ? WHERE id = ?',
        [nik, nama_lengkap, email || null, no_hp || null, alamat || null, tempat_lahir || null, jenis_kelamin, id]
      );
    }
    if (nik && nik !== oldNik) {
      await conn.query('UPDATE pengajuan_surat SET nik = ? WHERE nik = ?', [nik, oldNik]);
      await conn.query('UPDATE pengajuan_antrian SET nik = ? WHERE nik = ?', [nik, oldNik]);
      await conn.query('UPDATE pengaduan SET nik = ? WHERE nik = ?', [nik, oldNik]);
    }
    await conn.commit();
    res.json({ message: 'Data warga berhasil diperbarui' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (conn) conn.release();
  }
};

exports.deleteResident = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role = 'warga'", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Warga tidak ditemukan' });
    res.json({ message: 'Warga berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nik, nama_lengkap, email, no_hp, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { nik, nama_lengkap, email, no_hp, tanggal_lahir, jenis_kelamin } = req.body;
    if (!nik || !nama_lengkap || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({ message: 'NIK, nama, tanggal lahir, dan jenis kelamin harus diisi' });
    }
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ message: 'NIK harus 16 digit angka' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE nik = ?', [nik]);
    if (existing.length > 0) return res.status(400).json({ message: 'NIK sudah terdaftar' });

    const hashedDate = await bcrypt.hash(tanggal_lahir, 10);
    await pool.query(
      "INSERT INTO users (nik, nama_lengkap, email, no_hp, tanggal_lahir, password_hash, jenis_kelamin, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'admin')",
      [nik, nama_lengkap, email || null, no_hp || null, tanggal_lahir, hashedDate, jenis_kelamin]
    );
    res.status(201).json({ message: 'Admin berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }
    const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role = 'admin'", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' });
    res.json({ message: 'Admin berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getLetters = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT ps.*, w.nama_lengkap, w.no_hp FROM pengajuan_surat ps JOIN users w ON ps.nik = w.nik ORDER BY ps.tanggal_pengajuan DESC'
    );
    res.json(rows.map(toLetterResponse));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateLetterStatus = async (req, res) => {
  try {
    const { status, catatan_admin } = req.body;
    const validStatus = ['Pending', 'Diproses', 'Selesai', 'Ditolak'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    await pool.query(
      'UPDATE pengajuan_surat SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin || null, req.params.id]
    );
    res.json({ message: 'Status surat berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getQueues = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT pa.*, w.nama_lengkap, w.no_hp FROM pengajuan_antrian pa JOIN users w ON pa.nik = w.nik ORDER BY pa.tanggal ASC, pa.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
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
      const [dup] = await pool.query(
        'SELECT id FROM pengajuan_antrian WHERE nomor_antrian = ? AND tanggal = (SELECT tanggal FROM pengajuan_antrian WHERE id = ?) AND id != ?',
        [nomor_antrian, req.params.id, req.params.id]
      );
      if (dup.length > 0) return res.status(400).json({ message: 'Nomor antrian sudah digunakan untuk tanggal ini' });
    }

    await pool.query(
      'UPDATE pengajuan_antrian SET nomor_antrian = ?, status = ? WHERE id = ?',
      [nomor_antrian || null, status, req.params.id]
    );
    res.json({ message: 'Antrian berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, w.nama_lengkap AS nama_warga, w.no_hp FROM pengaduan p LEFT JOIN users w ON p.nik = w.nik ORDER BY p.tanggal_pengaduan DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
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
      'UPDATE pengaduan SET status = ?, balasan_admin = ? WHERE id = ?',
      [status, balasan_admin || null, req.params.id]
    );
    res.json({ message: 'Aduan berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
