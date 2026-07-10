require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by -- -------------------------------------------------------- comments to run each section separately
  const statements = sql
    .split('-- --------------------------------------------------------')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('-- ============') && !stmt.startsWith('-- Komentar:'));
  
  for (const statement of statements) {
    // Remove comment lines and empty lines
    const cleanStmt = statement
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .trim();
    
    if (cleanStmt) {
      try {
        await pool.query(cleanStmt);
        console.log(`✓ Executed: ${cleanStmt.substring(0, 50)}...`);
      } catch (err) {
        if (err.code === '42P07') { // Table already exists
          console.log(`→ Skipped (already exists): ${cleanStmt.substring(0, 50)}...`);
        } else {
          console.error(`✗ Error executing: ${cleanStmt.substring(0, 50)}...`);
          console.error(`  ${err.message}`);
          return false;
        }
      }
    }
  }
  
  return true;
}

async function runMigrations() {
  console.log('=== Running Database Migrations ===\n');
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(f => path.join(migrationsDir, f));
  
  let success = true;
  
  for (const migration of migrations) {
    if (fs.existsSync(migration)) {
      console.log(`\nRunning: ${path.basename(migration)}`);
      if (!(await runMigration(migration))) {
        success = false;
        break;
      }
    } else {
      console.log(`\nSkipping: ${path.basename(migration)} (not found)`);
    }
  }
  
  await pool.end();
  
  console.log('\n=== Migration Complete ===');
  if (success) {
    console.log('✓ All migrations executed successfully');
    process.exit(0);
  } else {
    console.log('✗ Migration failed');
    process.exit(1);
  }
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
