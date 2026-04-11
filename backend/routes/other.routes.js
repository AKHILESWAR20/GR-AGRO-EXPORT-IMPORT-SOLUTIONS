// ─────────────────────────────────────────
// FILE: routes/shipment.routes.js
// SECTION: Shipment Routes
// ─────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const {
  createShipment, trackShipment, getAllShipments, updateShipmentStatus
} = require("../controllers/shipment.controller");

router.post("/",                  verifyToken, adminOnly, createShipment);         // Admin creates shipment
router.get("/",                   verifyToken, adminOnly, getAllShipments);         // Admin views all
router.get("/track/:trackingId",  verifyToken,            trackShipment);          // Client tracks
router.put("/:id/status",         verifyToken, adminOnly, updateShipmentStatus);   // Admin updates status

module.exports = router;


// ─────────────────────────────────────────
// FILE: routes/contact.routes.js
// SECTION: Contact Form Routes
// ─────────────────────────────────────────
const contactRouter = express.Router();
const { submitContact, getAllInquiries } = require("../controllers/contact.controller");

contactRouter.post("/",  submitContact);                          // Public — submit form
contactRouter.get("/",   verifyToken, adminOnly, getAllInquiries); // Admin views all

module.exports.contactRouter = contactRouter;


// ─────────────────────────────────────────
// FILE: routes/upload.routes.js
// SECTION: File Upload Routes
// ─────────────────────────────────────────
const uploadRouter = express.Router();
const upload = require("../middleware/upload");
const { uploadFile, getFilesByOrder, deleteFile } = require("../controllers/upload.controller");

uploadRouter.post("/upload",       verifyToken, upload.single("file"), uploadFile);    // Admin & Client
uploadRouter.get("/:orderId",      verifyToken, getFilesByOrder);                      // Admin & Client
uploadRouter.delete("/:id",        verifyToken, adminOnly, deleteFile);               // Admin only

module.exports.uploadRouter = uploadRouter;


// ─────────────────────────────────────────
// FILE: routes/admin.routes.js
// SECTION: Admin Dashboard Routes
// ─────────────────────────────────────────
const adminRouter = express.Router();
const { getDashboardStats, getAllClients, getClientDetail } = require("../controllers/admin.controller");

adminRouter.get("/dashboard",      verifyToken, adminOnly, getDashboardStats);  // Dashboard stats
adminRouter.get("/clients",        verifyToken, adminOnly, getAllClients);       // All clients
adminRouter.get("/clients/:id",    verifyToken, adminOnly, getClientDetail);    // Single client

module.exports.adminRouter = adminRouter;
