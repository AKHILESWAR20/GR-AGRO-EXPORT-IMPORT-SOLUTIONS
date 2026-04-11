// ─────────────────────────────────────────
// FILE: controllers/shipment.controller.js
// SECTION: Shipment Tracking
//   - Create shipment (Admin)
//   - Update shipment status (Admin)
//   - Track shipment (Client)
//   - Get all shipments (Admin)
// ─────────────────────────────────────────

const { query } = require("../config/db");


// ─────────────────────────────────────────
// CREATE SHIPMENT
// POST /api/shipments
// Admin only — linked to an order
// ─────────────────────────────────────────
const createShipment = async (req, res) => {
  try {
    const { orderId, trackingId, carrier, origin, destination, estimatedDelivery } = req.body;

    if (!orderId || !trackingId) {
      return res.status(400).json({ success: false, message: "Order ID and tracking ID are required." });
    }

    await query(
      `INSERT INTO SHIPMENTS (ORDER_ID, TRACKING_ID, CARRIER, ORIGIN, DESTINATION, STATUS, ESTIMATED_DELIVERY, CREATED_AT)
       VALUES (:orderId, :trackingId, :carrier, :origin, :destination, 'In Transit', TO_DATE(:estimatedDelivery,'YYYY-MM-DD'), SYSDATE)`,
      { orderId, trackingId, carrier: carrier || null, origin: origin || null, destination: destination || null, estimatedDelivery: estimatedDelivery || null }
    );

    return res.status(201).json({ success: true, message: "Shipment created successfully." });
  } catch (err) {
    console.error("Create Shipment Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to create shipment." });
  }
};


// ─────────────────────────────────────────
// TRACK SHIPMENT
// GET /api/shipments/track/:trackingId
// Client — track their own shipment by tracking ID
// ─────────────────────────────────────────
const trackShipment = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const result = await query(
      `SELECT S.SHIPMENT_ID, S.TRACKING_ID, S.CARRIER, S.ORIGIN, S.DESTINATION,
              S.STATUS, S.ESTIMATED_DELIVERY, S.CREATED_AT,
              O.ORDER_ID, P.NAME AS PRODUCT_NAME, O.QUANTITY
       FROM SHIPMENTS S
       JOIN ORDERS O   ON S.ORDER_ID   = O.ORDER_ID
       JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
       WHERE S.TRACKING_ID = :trackingId`,
      { trackingId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Shipment not found. Check your tracking ID." });
    }

    return res.status(200).json({ success: true, shipment: result.rows[0] });
  } catch (err) {
    console.error("Track Shipment Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to track shipment." });
  }
};


// ─────────────────────────────────────────
// GET ALL SHIPMENTS
// GET /api/shipments
// Admin only
// ─────────────────────────────────────────
const getAllShipments = async (req, res) => {
  try {
    const result = await query(
      `SELECT S.*, U.NAME AS CLIENT_NAME, P.NAME AS PRODUCT_NAME
       FROM SHIPMENTS S
       JOIN ORDERS O   ON S.ORDER_ID   = O.ORDER_ID
       JOIN USERS U    ON O.CLIENT_ID  = U.USER_ID
       JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
       ORDER BY S.CREATED_AT DESC`
    );

    return res.status(200).json({ success: true, count: result.rows.length, shipments: result.rows });
  } catch (err) {
    console.error("Get All Shipments Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch shipments." });
  }
};


// ─────────────────────────────────────────
// UPDATE SHIPMENT STATUS
// PUT /api/shipments/:id/status
// Admin only
// ─────────────────────────────────────────
const updateShipmentStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Transit", "Out for Delivery", "Delivered", "On Hold", "Returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    await query(
      `UPDATE SHIPMENTS SET STATUS = :status WHERE SHIPMENT_ID = :id`,
      { status, id }
    );

    return res.status(200).json({ success: true, message: `Shipment status updated to "${status}".` });
  } catch (err) {
    console.error("Update Shipment Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update shipment." });
  }
};


module.exports = { createShipment, trackShipment, getAllShipments, updateShipmentStatus };
