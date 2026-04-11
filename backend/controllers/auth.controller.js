// ─────────────────────────────────────────
// FILE: controllers/auth.controller.js
// SECTION: Authentication (PostgreSQL version)
// ─────────────────────────────────────────

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { query } = require("../config/db");
const { sendWelcomeMail } = require("../config/mailer");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ── CLIENT SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required." });
    }

    const existing = await query(`SELECT email FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await query(
      `INSERT INTO users (name, email, password, phone, company, role)
       VALUES ($1, $2, $3, $4, $5, 'client')`,
      [name, email, hashedPassword, phone || null, company || null]
    );

    await sendWelcomeMail(email, name);

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to Gopi Exporting Hub.",
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    return res.status(500).json({ success: false, message: "Signup failed. Please try again." });
  }
};

// ── CLIENT LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND role = 'client'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user    = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user.user_id, name: user.name, email: user.email, company: user.company, role: user.role },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ success: false, message: "Login failed." });
  }
};

// ── ADMIN LOGIN
const adminLogin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: "Access denied. Invalid admin secret key." });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND role = 'admin'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Admin account not found." });
    }

    const admin   = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: { id: admin.user_id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("Admin Login Error:", err.message);
    return res.status(500).json({ success: false, message: "Admin login failed." });
  }
};

module.exports = { signup, login, adminLogin };
