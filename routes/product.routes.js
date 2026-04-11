// ─────────────────────────────────────────
// FILE: routes/product.routes.js
// SECTION: Product Routes
// ─────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getAllProducts, getProduct, addProduct, updateProduct, deleteProduct
} = require("../controllers/product.controller");

router.get("/",           getAllProducts);                               // Public
router.get("/:id",        getProduct);                                  // Public
router.post("/",          verifyToken, adminOnly, upload.single("image"), addProduct);    // Admin
router.put("/:id",        verifyToken, adminOnly, upload.single("image"), updateProduct); // Admin
router.delete("/:id",     verifyToken, adminOnly, deleteProduct);       // Admin

module.exports = router;
