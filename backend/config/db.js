// ─────────────────────────────────────────
// FILE: config/db.js
// SECTION: PostgreSQL Database Connection
// Using Railway PostgreSQL (Free - No Credit Card)
// ─────────────────────────────────────────

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const initPool = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL DB Connected Successfully");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
    process.exit(1);
  }
};

const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result;
  } catch (err) {
    console.error("❌ DB Query Error:", err.message);
    throw err;
  }
};

module.exports = { initPool, query, pool };
