# Panduan Migrasi MySQL ke PostgreSQL

## File-file yang Perlu Diubah

### 1. Database Configuration
**File:** `server/src/config/db.js`

```javascript
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
```

### 2. Environment Configuration
**File:** `server/.env.example`

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=desa2
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

### 3. Dependencies
**File:** `server/package.json`

Pastikan dependencies menggunakan `pg` bukan `mysql2`:

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-validator": "^7.3.2",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.1.1",
    "pg": "^8.22.0",
    "pg-format": "^1.0.4"
  }
}
```

### 4. Install Dependencies
```bash
cd server
npm install
```

## Perubahan Query Syntax

### MySQL → PostgreSQL

1. **Placeholder parameters:**
   - MySQL: `?` 
   - PostgreSQL: `$1`, `$2`, `$3`, ...

2. **Result object:**
   - MySQL: `result.affectedRows`, `result.insertId`
   - PostgreSQL: `result.rowCount`, `result.rows[0].id`

3. **Array destructuring:**
   - MySQL: `const { row } = await pool.query(...)` → `rows` adalah array
   - PostgreSQL: `const {row} = await pool.query(...)` → `rows` adalah array

4. **Transaction:**
   - MySQL: `pool.getConnection()` → `conn.beginTransaction()` → `conn.commit()` → `conn.release()`
   - PostgreSQL: `pool.connect()` → `client.query('BEGIN')` → `client.query('COMMIT')` → `client.release()`

5. **Boolean values:**
   - MySQL: `0` dan `1`
   - PostgreSQL: `false` dan `true`

## Contoh Perubahan Query

### Sebelum (MySQL):
```javascript
const {row} = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### Sesudah (PostgreSQL):
```javascript
const {row} = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Transaction MySQL:
```javascript
const conn = await pool.getConnection();
await conn.beginTransaction();
await conn.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
await conn.commit();
conn.release();
```

### Transaction PostgreSQL:
```javascript
const client = await pool.connect();
await client.query('BEGIN');
await client.query('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
await client.query('COMMIT');
client.release();
```

## Langkah-Langkah Migrasi

1. **Backup database MySQL Anda**
2. **Install PostgreSQL**
3. **Update semua file sesuai panduan di atas**
4. **Install dependencies baru:** `npm install`
5. **Buat database PostgreSQL:** `createdb desa2`
6. **Jalankan migration:** `psql -U postgres -d desa2 -f server/src/config/migrations/001_smart_letter_service.sql`
7. **Migrate data dari MySQL ke PostgreSQL** (gunakan tool seperti pgloader atau export/import manual)
8. **Test aplikasi**

## Migration SQL Files

File migration sudah diperbarui untuk PostgreSQL di:
- `server/src/config/migrations/001_smart_letter_service.sql`
- `server/migrations/002_smart_letter_notifications.sql`

## Troubleshooting

### Error: Cannot find module 'mysql2/promise'
**Solusi:** File `db.js` masih menggunakan `mysql2`. Ganti dengan kode PostgreSQL di atas.

### Error: syntax error at or near "?"
**Solusi:** Query masih menggunakan placeholder `?`. Ganti dengan `$1`, `$2`, dll.

### Error: result.affectedRows is undefined
**Solusi:** Gunakan `result.rowCount` untuk PostgreSQL.

### Error: Cannot read property 'insertId' of undefined
**Solusi:** Untuk mendapatkan ID yang baru diinsert, gunakan `RETURNING id`:
```javascript
const result = await pool.query('INSERT INTO users (...) VALUES (...) RETURNING id', [values]);
const newId = result.rows[0].id;
```
