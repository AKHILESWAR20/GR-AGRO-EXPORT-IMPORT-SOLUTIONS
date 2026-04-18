// ─────────────────────────────────────────
// FILE: controllers/auth.controller.js
// SECTION: Authentication (PostgreSQL)
// ─────────────────────────────────────────

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const { query } = require("../config/db");
const { sendWelcomeMail, transporter } = require("../config/mailer");
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

    try { await sendWelcomeMail(email, name); } catch(e) { console.error("Welcome mail error:", e.message); }

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to GR Global Agro.",
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

// ── FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Check if user exists
    const result = await query(
      `SELECT user_id, name, email FROM users WHERE email = $1 AND role = 'client'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address."
      });
    }

    const user  = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in DB
    await query(
      `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3`,
      [token, expiry, user.user_id]
    );

    // Build reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`;

    // Send reset email
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: "Password Reset Request – GR Global Agro",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#0B1F3A;padding:30px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:24px;">GR Global Agro</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;">Password Reset Request</p>
          </div>
          <div style="padding:36px;">
            <h2 style="color:#0B1F3A;">Hi ${user.name},</h2>
            <p style="color:#555;line-height:1.7;">
              We received a request to reset your password. Click the button below.
              This link is valid for <strong>1 hour</strong>.
            </p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${resetLink}"
                 style="background:#C9A84C;color:#0B1F3A;padding:14px 36px;border-radius:4px;
                        text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:1px;">
                RESET MY PASSWORD
              </a>
            </div>
            <p style="color:#888;font-size:13px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
          <div style="background:#f7f2e8;padding:16px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0;">© 2025 GR Global Agro. All rights reserved.</p>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent! Check your email inbox."
    });

  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to send reset email. Please try again." });
  }
};

module.exports = { signup, login, adminLogin, forgotPassword };