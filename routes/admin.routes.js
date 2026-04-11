const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const { getDashboardStats, getAllClients, getClientDetail } = require("../controllers/admin.controller");

router.get("/dashboard",    verifyToken, adminOnly, getDashboardStats);
router.get("/clients",      verifyToken, adminOnly, getAllClients);
router.get("/clients/:id",  verifyToken, adminOnly, getClientDetail);

module.exports = router;