const pool = require('../config/db');
const { generatePdf } = require('../services/letterService');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { validateSmartLetterFields } = require('../utils/letterValidation');
const { generateReferenceNumber } = require('../utils/referenceNumber');
const { generateLetterNumber } = require('../utils/letterNumber');
const { LETTER_SCHEMAS } = require('../utils/letterSchemas');
const { logActivity } = require('../utils/activityLogger');

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

    const { rows: userRows } = await pool.query(
      'SELECT id, nik, nama_lengkap FROM users WHERE id = $1', [req.user.id]
    );
    if (userRows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    const user = userRows[0];

    const nomorReferensi = generateReferenceNumber();

    client = await pool.connect();
    await client.query('BEGIN');

    const { rows: insRows } = await client.query(
      `INSERT INTO smart_letter_submissions
       (user_id, nik, nama_lengkap, jenis_surat, form_data, nomor_referensi, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Menunggu')
       RETURNING id`,
      [user.id, user.nik, user.nama_lengkap, jenis_surat,
       JSON.stringify(formData), nomorReferensi]
    );
    const submissionId = insRows[0].id;

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
    const { rows: admins } = await client.query(
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

    const schemaName = LETTER_SCHEMAS[jenis_surat]?.label || jenis_surat;
    await logActivity(req.user.id, 'letter_submitted', 'smart_letter', submissionId,
      `Mengajukan ${schemaName} (${nomorReferensi})`);

    res.status(201).json({
      message: 'Pengajuan berhasil dikirim',
      nomor_referensi: nomorReferensi,
      submission_id: submissionId,
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (client) client.release();
  }
};

exports.getSmartLetters = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM smart_letter_submissions WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].total);

    const { rows } = await pool.query(
      `SELECT id, jenis_surat, nomor_referensi, nomor_surat, status, alasan_penolakan, tanggal_pengajuan, tanggal_disetujui, generated_file_path
        FROM smart_letter_submissions
        WHERE user_id = $1
        ORDER BY tanggal_pengajuan DESC
        LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getSmartLetterDetail = async (req, res) => {
  try {
    const { rows: submission } = await pool.query(
      `SELECT id, user_id, nik, nama_lengkap, jenis_surat, form_data,
              nomor_referensi, nomor_surat, status, alasan_penolakan,
              tanggal_pengajuan, tanggal_disetujui, generated_file_path
       FROM smart_letter_submissions
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!submission.length) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }

    const { rows: files } = await pool.query(
      'SELECT id, filename, original_name, mime_type, file_size, uploaded_at FROM smart_letter_files WHERE submission_id = $1',
      [req.params.id]
    );

    res.json({
      ...submission[0],
      files: files.map(f => ({
        ...f,
        url: `/uploads/${f.filename}`
      }))
    });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAdminSmartLetters = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) AS total FROM smart_letter_submissions';
    let query = `
      SELECT id, nik, nama_lengkap, jenis_surat, nomor_referensi,
             nomor_surat, status, alasan_penolakan, tanggal_pengajuan, generated_file_path
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
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      countQuery += whereClause;
      query += whereClause;
    }

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    query += ' ORDER BY tanggal_pengajuan DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAdminSmartLetterDetail = async (req, res) => {
  try {
    const { rows: submission } = await pool.query(
      `SELECT id, user_id, nik, nama_lengkap, jenis_surat, form_data,
              nomor_referensi, nomor_surat, status, alasan_penolakan,
              tanggal_pengajuan, tanggal_disetujui, generated_file_path
       FROM smart_letter_submissions
       WHERE id = $1`,
      [req.params.id]
    );

    if (!submission.length) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }

    const { rows: files } = await pool.query(
      'SELECT id, filename, original_name, mime_type, file_size, uploaded_at FROM smart_letter_files WHERE submission_id = $1',
      [req.params.id]
    );

    res.json({
      ...submission[0],
      files: files.map(f => ({
        ...f,
        url: `/uploads/${f.filename}`
      }))
    });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.approveSmartLetter = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Lock the submission row
    const { rows: sub } = await client.query(
      `SELECT id, user_id, nik, nama_lengkap, jenis_surat, form_data, status, nomor_referensi
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

    const { rows: userRows } = await client.query(
      `SELECT tempat_lahir, tanggal_lahir, jenis_kelamin, alamat
       FROM users WHERE id = $1`,
      [sub[0].user_id]
    );
    const userDetail = userRows[0] || {};
    const wargaData = {
      nik: sub[0].nik,
      nama_lengkap: sub[0].nama_lengkap,
      tempat_lahir: userDetail.tempat_lahir,
      tanggal_lahir: userDetail.tanggal_lahir,
      jenis_kelamin: userDetail.jenis_kelamin,
      alamat: userDetail.alamat,
    };

    const approvalDate = new Date();
    const nomorSurat = req.body.nomor_surat || await generateLetterNumber(client, sub[0].jenis_surat, approvalDate);

    // Generate PDF using PDFKit official rendering
    const formData = typeof sub[0].form_data === 'string' ? JSON.parse(sub[0].form_data) : sub[0].form_data;
    const pdfBuffer = await generatePdf(sub[0].jenis_surat, nomorSurat, wargaData, formData);
    
    // Save PDF to uploads/smart/pdfs
    const pdfDir = path.join(__dirname, '..', '..', '..', 'uploads', 'smart', 'pdfs');
    await fs.promises.mkdir(pdfDir, { recursive: true });
    const pdfFilename = `letter_${sub[0].id}_${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFilename);
    await fs.promises.writeFile(pdfPath, pdfBuffer);
    const relativePdfPath = `/uploads/smart/pdfs/${pdfFilename}`;

    await client.query(
      `UPDATE smart_letter_submissions
       SET status='Disetujui', nomor_surat=$1, tanggal_disetujui=NOW(), approved_by=$2, generated_file_path=$3
       WHERE id=$4`,
      [nomorSurat, req.user.id, relativePdfPath, sub[0].id]
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

    const approveSchema = LETTER_SCHEMAS[sub[0].jenis_surat];
    await logActivity(req.user.id, 'letter_approved', 'smart_letter', sub[0].id,
      `Menyetujui ${approveSchema?.label || sub[0].jenis_surat} untuk ${sub[0].nama_lengkap} (${nomorSurat})`);

    res.json({ message: 'Pengajuan disetujui', nomor_surat: nomorSurat, pdf_url: relativePdfPath });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    logger.error(err.message, { stack: err.stack });
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

    const { rows: sub } = await client.query(
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

    const rejectSchema = LETTER_SCHEMAS[sub[0].jenis_surat];
    await logActivity(req.user.id, 'letter_rejected', 'smart_letter', sub[0].id,
      `Menolak ${rejectSchema?.label || sub[0].jenis_surat} untuk warga (${alasan_penolakan.slice(0, 100)})`);

    res.json({ message: 'Pengajuan ditolak', alasan_penolakan });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    if (client) client.release();
  }
};
