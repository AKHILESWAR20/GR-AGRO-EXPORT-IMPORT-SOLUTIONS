// ─────────────────────────────────────────
// FILE: middleware/auth.js
// SECTION: JWT Authentication Middleware
// ─────────────────────────────────────────

const jwt = require("jsonwebtoken");
require("dotenv").config();

// ─────────────────────────────────────────
// VERIFY TOKEN — Protects any route
// Add this to any route that needs login
// ─────────────────────────────────────────
const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success:false,
      message:"Invalid authorization header"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err){
    return res.status(403).json({
      success:false,
      message:"Invalid or expired token"
    });
  }
};

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
;


// ─────────────────────────────────────────
// ADMIN ONLY — Restricts route to admins
// ─────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admins only.",
  });
};


// ─────────────────────────────────────────
// CLIENT ONLY — Restricts route to clients
// ─────────────────────────────────────────
const clientOnly = (req, res, next) => {
  if (req.user && req.user.role === "client") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Clients only.",
  });
};


module.exports = { verifyToken, adminOnly, clientOnly };
