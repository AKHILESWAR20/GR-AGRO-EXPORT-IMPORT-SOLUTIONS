// ─────────────────────────────────────────
// FILE: controllers/auth.controller.js
// SECTION: Authentication Logic
//   - Client Signup
//   - Client Login
//   - Admin Login (Owner only via secret key)
// ─────────────────────────────────────────

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { query } = require("../config/db");
const { sendWelcomeMail } = require("../config/mailer");
require("dotenv").config();

// ── Helper: Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.USER_ID, name: user.NAME, email: user.EMAIL, role: user.ROLE },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};


// ─────────────────────────────────────────
// CLIENT SIGNUP
// POST /api/auth/signup
// ─────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    // Check if email already exists
    const existing = await query(
      `SELECT EMAIL FROM USERS WHERE EMAIL = :email`,
      { email }
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new client user
    await query(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, PHONE, COMPANY, ROLE, CREATED_AT)
       VALUES (:name, :email, :password, :phone, :company, 'client', SYSDATE)`,
      { name, email, password: hashedPassword, phone: phone || null, company: company || null }
    );

    // Send welcome email
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


// ─────────────────────────────────────────
// CLIENT LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Find client user only (role = 'client')
    const result = await query(
      `SELECT * FROM USERS WHERE EMAIL = :email AND ROLE = 'client'`,
      { email }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id:      user.USER_ID,
        name:    user.NAME,
        email:   user.EMAIL,
        company: user.COMPANY,
        role:    user.ROLE,
      },
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};


// ─────────────────────────────────────────
// ADMIN LOGIN
// POST /api/auth/admin/login
// — Requires ADMIN_SECRET_KEY (owner only)
// — Admin account is NOT publicly accessible
// ─────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    // Step 1: Validate the secret key (only company owner knows this)
    if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid admin secret key.",
      });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Step 2: Find admin user
    const result = await query(
      `SELECT * FROM USERS WHERE EMAIL = :email AND ROLE = 'admin'`,
      { email }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Admin account not found." });
    }

    const admin = result.rows[0];

    // Step 3: Compare password
    const isMatch = await bcrypt.compare(password, admin.PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: {
        id:    admin.USER_ID,
        name:  admin.NAME,
        email: admin.EMAIL,
        role:  admin.ROLE,
      },
    });

  } catch (err) {
    console.error("Admin Login Error:", err.message);
    return res.status(500).json({ success: false, message: "Admin login failed." });
  }
};


module.exports = { signup, login, adminLogin };
