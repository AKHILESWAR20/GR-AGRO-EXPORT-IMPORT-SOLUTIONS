// ─────────────────────────────────────────
// FILE: routes/auth.routes.js
// SECTION: Authentication Routes
// ─────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { signup, login, adminLogin } = require("../controllers/auth.controller");

router.post("/signup",       signup);      // POST /api/auth/signup
router.post("/login",        login);       // POST /api/auth/login
router.post("/admin/login",  adminLogin);  // POST /api/auth/admin/login

module.exports = router;
