const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function setup() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    
    const res = await pool.query(
      "UPDATE users SET email = 'admin@e-desa.com', password_hash = $1, is_active = true, must_change_password = false WHERE nik = '1212121212121212' RETURNING id, nik, email, nama_lengkap, role",
      [hash]
    );
    console.log('Admin updated:', JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
setup();
