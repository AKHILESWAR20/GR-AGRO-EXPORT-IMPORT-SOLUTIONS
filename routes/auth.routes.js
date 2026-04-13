// ─────────────────────────────────────────
// FILE: routes/auth.routes.js
// SECTION: Authentication Routes
// ─────────────────────────────────────────
const rateLimit = require("express-rate-limit");
const express = require("express");
const router  = express.Router();
const { signup, login, adminLogin } = require("../controllers/auth.controller");

// Rate limiting for authentication routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  statusCode: 429,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});
router.post("/signup",        signup);      // POST /api/auth/signup
router.post("/login",        loginLimiter, login);       // POST /api/auth/login
router.post("/admin/login",  loginLimiter, adminLogin);  // POST /api/auth/admin/login

module.exports = router;
