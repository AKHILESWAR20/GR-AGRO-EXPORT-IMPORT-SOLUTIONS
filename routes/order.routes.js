// ─────────────────────────────────────────
// FILE: routes/order.routes.js
// SECTION: Order Routes
// ─────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly, clientOnly } = require("../middleware/auth");
const {
  placeOrder, getMyOrders, getAllOrders, updateOrderStatus
} = require("../controllers/order.controller");

router.post("/",              verifyToken, clientOnly, placeOrder);          // Client places order
router.get("/my",             verifyToken, clientOnly, getMyOrders);         // Client views own orders
router.get("/",               verifyToken, adminOnly,  getAllOrders);         // Admin views all orders
router.put("/:id/status",     verifyToken, adminOnly,  updateOrderStatus);   // Admin updates status

module.exports = router;
