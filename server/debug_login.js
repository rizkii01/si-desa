const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'desa2'
  });

  const [rows] = await pool.query('SELECT id, nik, tanggal_lahir, password_hash FROM users');
  for (const r of rows) {
    const rawDate = r.tanggal_lahir instanceof Date
      ? r.tanggal_lahir.toISOString().split('T')[0]
      : String(r.tanggal_lahir);
    console.log('id=' + r.id + ' nik=' + r.nik + ' rawDate=' + rawDate);
    const match = await bcrypt.compare(rawDate, r.password_hash);
    console.log('  match with rawDate: ' + match);
    
    // Also try comparing with some variations
    for (const test of [rawDate, r.tanggal_lahir, '1990-01-01']) {
      if (test) {
        const m = await bcrypt.compare(String(test), r.password_hash);
        if (m) console.log('  MATCHED with: ' + test);
      }
    }
  }
  await pool.end();
  console.log('done');
})();
