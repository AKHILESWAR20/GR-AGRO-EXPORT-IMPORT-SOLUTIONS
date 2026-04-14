// ─────────────────────────────────────────
// FILE: config/db.js
// SECTION: PostgreSQL Database Connection (Railway)
// ─────────────────────────────────────────

const { Pool } = require("pg");
require("dotenv").config();

// Create connection pool using Railway DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection on startup
pool.connect()
  .then(client => {
    console.log("✅ PostgreSQL Connected Successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
    process.exit(1);
  });

// ─────────────────────────────────────────
// QUERY HELPER
// Usage: await query("SELECT * FROM users WHERE id=$1", [1])
// ─────────────────────────────────────────
const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error("❌ DB Query Error:", err.message);
    throw err;
  }
};

module.exports = { query,pool };