const { Pool }  = require('pg');
const bcrypt    = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:cHaBSSFaQoLgxcPHfduRcZxyTqQuUvuj@metro.proxy.rlwy.net:12089/railway',
  ssl: { rejectUnauthorized: false }
});

const createAdmin = async () => {
  try {
    const hash = await bcrypt.hash('Admin@2025', 12);

    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ['Gopi Admin', 'gangireddygopinathreddy715@gmail.com', hash]
    );

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email   : gangireddygopinathreddy715@gmail.com');
    console.log('🔑 Password: Admin@2025');
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
  }
};

createAdmin();