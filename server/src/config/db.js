const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger'); // Memuat variabel environment dari file .env

// ==========================================
// 1. KONFIGURASI KONEKSI DATABASE
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});



// ==========================================
// 3. TEST KONEKSI (Opsional tapi disarankan)
// ==========================================
pool.connect((err, client, release) => {
  if (err) {
    logger.error('Gagal koneksi ke PostgreSQL: ' + err.stack);
    return;
  }
  logger.info('Berhasil terhubung ke database PostgreSQL (Supabase)');
  release();
});

module.exports = pool;