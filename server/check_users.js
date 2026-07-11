const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function check() {
  try {
    const res = await pool.query('SELECT id, email, nama_lengkap, role, is_active FROM users LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
    const count = await pool.query('SELECT count(*) FROM users');
    console.log('Total users:', count.rows[0].count);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
check();
