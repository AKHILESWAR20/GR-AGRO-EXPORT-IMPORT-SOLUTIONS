const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const { createShipment, trackShipment, getAllShipments, updateShipmentStatus } = require("../controllers/shipment.controller");

router.post("/",                 verifyToken, adminOnly, createShipment);
router.get("/",                  verifyToken, adminOnly, getAllShipments);
router.get("/track/:trackingId", verifyToken, trackShipment);
router.put("/:id/status",        verifyToken, adminOnly, updateShipmentStatus);

module.exports = router;