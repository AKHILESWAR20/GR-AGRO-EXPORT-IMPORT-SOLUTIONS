// ─────────────────────────────────────────
// FILE: config/db.js
// SECTION: Oracle Database Connection Pool
// ─────────────────────────────────────────

const oracledb = require("oracledb");
require("dotenv").config();

// Return results as objects (not arrays)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

// ─────────────────────────────────────────
// INITIALIZE CONNECTION POOL
// ─────────────────────────────────────────
const initPool = async () => {
  try {
    pool = await oracledb.createPool({
      user:          process.env.DB_USER,
      password:      process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin:       2,
      poolMax:       10,
      poolIncrement: 1,
    });
    console.log("✅ Oracle DB Pool Created Successfully");
  } catch (err) {
    console.error("❌ Oracle DB Connection Failed:", err.message);
    process.exit(1);
  }
};

// ─────────────────────────────────────────
// EXECUTE QUERY HELPER
// Usage: await query("SELECT * FROM USERS WHERE ID = :id", { id: 1 })
// ─────────────────────────────────────────
const query = async (sql, binds = {}, opts = {}) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error("❌ DB Query Error:", err.message);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = { initPool, query };
