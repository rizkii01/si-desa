const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function check() {
  try {
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    console.log('Users columns:', cols.rows.map(r => r.column_name + ' (' + r.data_type + ')').join(', '));
    
    const admin = await pool.query("SELECT id, nik, email, nama_lengkap FROM users WHERE id = 1");
    console.log('Admin:', JSON.stringify(admin.rows[0]));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
check();
