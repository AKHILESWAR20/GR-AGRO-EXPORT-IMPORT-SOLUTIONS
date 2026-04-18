// ─────────────────────────────────────────
// FILE: routes/auth.routes.js
// SECTION: Authentication Routes
// ─────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { signup, login, adminLogin, forgotPassword } = require("../controllers/auth.controller");

router.post("/signup",           signup);          // POST /api/auth/signup
router.post("/login",            login);           // POST /api/auth/login
router.post("/admin/login",      adminLogin);      // POST /api/auth/admin/login
router.post("/forgot-password",  forgotPassword);  // POST /api/auth/forgot-password

module.exports = router;