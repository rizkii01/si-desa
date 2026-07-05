const pool = require('../config/db');
const { validateSmartLetterFields } = require('../utils/letterValidation');
const { generateReferenceNumber } = require('../utils/referenceNumber');
const { generateLetterNumber } = require('../utils/letterNumber');
const { LETTER_SCHEMAS } = require('../utils/letterSchemas');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const validateFiles = (files) => {
  const errors = [];
  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      errors.push(`File '${file.originalname}': format tidak didukung (hanya JPG/PNG/PDF)`);
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`File '${file.originalname}': ukuran melebihi 5 MB`);
    }
  }
  return errors;
};

exports.submitSmartLetter = async (req, res) => {
  let client;
  try {
    const { jenis_surat, form_data: formDataRaw } = req.body;
    if (!jenis_surat || !LETTER_SCHEMAS[jenis_surat]) {
      return res.status(400).json({ message: 'Jenis surat tidak valid' });
    }

    let formData;
    try { formData = JSON.parse(formDataRaw); }
    catch { return res.status(400).json({ message: 'form_data harus berupa JSON' }); }

    const fieldErrors = validateSmartLetterFields(jenis_surat, formData);
    if (fieldErrors.length > 0) {
      return res.status(400).json({ message: 'Validasi gagal', errors: fieldErrors });
    }

    const files = req.files || [];
    const fileErrors = validateFiles(files);
    if (fileErrors.length > 0) {
      return res.status(400).json({ message: 'File tidak valid', errors: fileErrors });
    }

    const [userRows] = await pool.query(
      'SELECT id, nik, nama_lengkap FROM users WHERE id = $1', [req.user.id]
    );
    if (userRows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    const user = userRows[0];

    const nomorReferensi = generateReferenceNumber();

    client = await pool.connect();
    await client.query('BEGIN');

    const [ins] = await client.query(
      `INSERT INTO smart_letter_submissions
       (user_id, nik, nama_lengkap, jenis_surat, form_data, nomor_referensi, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Menunggu')`,
      [user.id, user.nik, user.nama_lengkap, jenis_surat,
       JSON.stringify(formData), nomorReferensi]
    );
    const submissionId = ins.rows[0].id;

    if (files.length > 0) {
      const fileValues = files.map(f => [
        submissionId, f.filename, f.originalname, f.mimetype, f.size
      ]);
      const placeholders = fileValues.map((_, i) => `($${i*5+1}, $${i*5+2}, $${i*5+3}, $${i*5+4}, $${i*5+5})`).join(', ');
      await client.query(
        `INSERT INTO smart_letter_files
         (submission_id, filename, original_name, mime_type, file_size)
         VALUES ${placeholders}`,
        fileValues.flat()
      );
    }

    // Notify all admins
    const [admins] = await client.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );
    const schema = LETTER_SCHEMAS[jenis_surat];
    const notifTitle = `Pengajuan ${schema.label} Baru`;
    const notifMsg = `${user.nama_lengkap} mengajukan ${schema.label} (${nomorReferensi})`;
    if (admins.length > 0) {
      const notifValues = admins.map(a => [
        a.id, submissionId, 'new_submission', notifTitle, notifMsg
      ]);
      const notifPlaceholders = notifValues.map((_, i) => `($${i*5+1}, $${i*5+2}, $${i*5+3}, $${i*5+4}, $${i*5+5})`).join(', ');
      await client.query(
        `INSERT INTO notifications
         (user_id, submission_id, type, title, message) VALUES ${notifPlaceholders}`,
        notifValues.flat()
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Pengajuan berhasil dikirim',
      nomor_referensi: nomorReferensi,
      submission_id: submissionId,
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (client) client.release();
  }
};

exports.getSmartLetters = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, jenis_surat, nomor_referensi, nomor_surat, status, alasan_penolakan,
              tanggal_pengajuan, tanggal_disetujui
       FROM smart_letter_submissions
       WHERE user_id = $1
       ORDER BY tanggal_pengajuan DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getSmartLetterDetail = async (req, res) => {
  try {
    const [submission] = await pool.query(
      `SELECT id, user_id, nik, nama_lengkap, jenis_surat, form_data,
              nomor_referensi, nomor_surat, status, alasan_penolakan,
              tanggal_pengajuan, tanggal_disetujui
       FROM smart_letter_submissions
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!submission.length) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }

    const [files] = await pool.query(
      'SELECT id, original_name, mime_type, file_size, uploaded_at FROM smart_letter_files WHERE submission_id = $1',
      [req.params.id]
    );

    res.json({
      ...submission[0],
      files: files.map(f => ({
        ...f,
        url: `/uploads/smart/${f.original_name}`
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAdminSmartLetters = async (req, res) => {
  try {
    let query = `
      SELECT id, nik, nama_lengkap, jenis_surat, nomor_referensi,
             nomor_surat, status, alasan_penolakan, tanggal_pengajuan
      FROM smart_letter_submissions
    `;
    const params = [];
    const conditions = [];

    if (req.query.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(req.query.status);
    }

    if (req.query.jenis_surat) {
      conditions.push(`jenis_surat = $${params.length + 1}`);
      params.push(req.query.jenis_surat);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY tanggal_pengajuan DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAdminSmartLetterDetail = async (req, res) => {
  try {
    const [submission] = await pool.query(
      `SELECT id, user_id, nik, nama_lengkap, jenis_surat, form_data,
              nomor_referensi, nomor_surat, status, alasan_penolakan,
              tanggal_pengajuan, tanggal_disetujui
       FROM smart_letter_submissions
       WHERE id = $1`,
      [req.params.id]
    );

    if (!submission.length) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }

    const [files] = await pool.query(
      'SELECT id, original_name, mime_type, file_size, uploaded_at FROM smart_letter_files WHERE submission_id = $1',
      [req.params.id]
    );

    res.json({
      ...submission[0],
      files: files.map(f => ({
        ...f,
        url: `/uploads/smart/${f.original_name}`
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.approveSmartLetter = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Lock the submission row
    const [sub] = await client.query(
      `SELECT id, user_id, jenis_surat, status, nomor_referensi
       FROM smart_letter_submissions WHERE id = $1 FOR UPDATE`,
      [req.params.id]
    );
    if (!sub.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }
    if (sub[0].status !== 'Menunggu') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Pengajuan sudah berstatus '${sub[0].status}'` });
    }

    const approvalDate = new Date();
    const nomorSurat = await generateLetterNumber(client, sub[0].jenis_surat, approvalDate);

    await client.query(
      `UPDATE smart_letter_submissions
       SET status='Disetujui', nomor_surat=$1, tanggal_disetujui=NOW(), approved_by=$2
       WHERE id=$3`,
      [nomorSurat, req.user.id, sub[0].id]
    );

    const schema = LETTER_SCHEMAS[sub[0].jenis_surat];
    await client.query(
      `INSERT INTO notifications (user_id, submission_id, type, title, message)
       VALUES ($1, $2, 'approved', $3, $4)`,
      [
        sub[0].user_id, sub[0].id,
        `${schema.label} Disetujui`,
        `Pengajuan Anda (${sub[0].nomor_referensi}) telah disetujui. Nomor Surat: ${nomorSurat}`,
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Pengajuan disetujui', nomor_surat: nomorSurat });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (client) client.release();
  }
};

exports.rejectSmartLetter = async (req, res) => {
  const { alasan_penolakan } = req.body;
  if (!alasan_penolakan || String(alasan_penolakan).trim() === '') {
    return res.status(400).json({ message: 'Alasan penolakan wajib diisi' });
  }
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const [sub] = await client.query(
      `SELECT id, user_id, jenis_surat, status, nomor_referensi
       FROM smart_letter_submissions WHERE id = $1 FOR UPDATE`,
      [req.params.id]
    );
    if (!sub.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }
    if (sub[0].status !== 'Menunggu') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Pengajuan sudah berstatus '${sub[0].status}'` });
    }

    await client.query(
      `UPDATE smart_letter_submissions
       SET status='Ditolak', alasan_penolakan=$1, tanggal_disetujui=NOW(), approved_by=$2
       WHERE id=$3`,
      [alasan_penolakan, req.user.id, sub[0].id]
    );

    const schema = LETTER_SCHEMAS[sub[0].jenis_surat];
    await client.query(
      `INSERT INTO notifications (user_id, submission_id, type, title, message)
       VALUES ($1, $2, 'rejected', $3, $4)`,
      [
        sub[0].user_id, sub[0].id,
        `${schema.label} Ditolak`,
        `Pengajuan Anda (${sub[0].nomor_referensi}) ditolak. Alasan: ${alasan_penolakan}`,
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Pengajuan ditolak', alasan_penolakan });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (client) client.release();
  }
};
