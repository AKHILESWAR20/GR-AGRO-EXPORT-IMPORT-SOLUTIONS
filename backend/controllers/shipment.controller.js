// ─────────────────────────────────────────
// FILE: controllers/shipment.controller.js
// SECTION: Shipments (PostgreSQL)
// ─────────────────────────────────────────

const { query } = require("../config/db");

const createShipment = async (req, res) => {
  try {
    const { orderId, trackingId, carrier, origin, destination, estimatedDelivery } = req.body;
    if (!orderId || !trackingId) return res.status(400).json({ success: false, message: "Order ID and tracking ID required." });
    await query(
      `INSERT INTO shipments (order_id, tracking_id, carrier, origin, destination, status, estimated_delivery)
       VALUES ($1,$2,$3,$4,$5,'In Transit',$6)`,
      [orderId, trackingId, carrier||null, origin||null, destination||null, estimatedDelivery||null]
    );
    return res.status(201).json({ success: true, message: "Shipment created." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create shipment." });
  }
};

const trackShipment = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, p.name AS product_name, o.quantity
       FROM shipments s JOIN orders o ON s.order_id=o.order_id JOIN products p ON o.product_id=p.product_id
       WHERE s.tracking_id=$1`,
      [req.params.trackingId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Shipment not found." });
    return res.status(200).json({ success: true, shipment: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to track shipment." });
  }
};

const getAllShipments = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, u.name AS client_name, p.name AS product_name
       FROM shipments s JOIN orders o ON s.order_id=o.order_id
       JOIN users u ON o.client_id=u.user_id JOIN products p ON o.product_id=p.product_id
       ORDER BY s.created_at DESC`
    );
    return res.status(200).json({ success: true, count: result.rows.length, shipments: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch shipments." });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Pending","In Transit","Out for Delivery","Delivered","On Hold","Returned"];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status." });
    await query(`UPDATE shipments SET status=$1 WHERE shipment_id=$2`, [status, req.params.id]);
    return res.status(200).json({ success: true, message: `Shipment status updated to "${status}".` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update shipment." });
  }
};

module.exports = { createShipment, trackShipment, getAllShipments, updateShipmentStatus };
