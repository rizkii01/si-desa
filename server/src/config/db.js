const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger'); // Memuat variabel environment dari file .env

// ==========================================
// 1. KONFIGURASI KONEKSI DATABASE
// ==========================================
const pool = new Pool({
  // Untuk Supabase, cara termudah adalah menggunakan Connection String
  connectionString: process.env.DATABASE_URL,
  
  // ATAU jika Anda memasukkan detail secara terpisah di .env:
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT || 5432,
});



// ==========================================
// 3. TEST KONEKSI (Opsional tapi disarankan)
// ==========================================
pool.connect((err, client, release) => {
  if (err) {
    logger.error('Gagal koneksi ke PostgreSQL: ' + err.stack);
  }
  logger.info('Berhasil terhubung ke database PostgreSQL (Supabase)');
  release();
});

module.exports = pool;