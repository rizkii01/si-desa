require("dotenv").config();

const pool = require("./src/config/db");

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ Berhasil terhubung ke Supabase");
    console.log(result.rows);
  } catch (err) {
    console.error("❌ Gagal koneksi");
    console.error(err);
  } finally {
    await pool.end();
  }
})();
