// ─────────────────────────────────────────
// FILE: controllers/admin.controller.js
// SECTION: Admin Dashboard (PostgreSQL)
// ─────────────────────────────────────────

const { query } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const [clients, orders, shipments, products, inquiries, recentOrders] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM users WHERE role='client'`),
      query(`SELECT COUNT(*) AS total FROM orders`),
      query(`SELECT COUNT(*) AS total FROM shipments`),
      query(`SELECT COUNT(*) AS total FROM products`),
      query(`SELECT COUNT(*) AS total FROM inquiries`),
      query(
        `SELECT o.order_id, u.name AS client_name, p.name AS product_name,
                o.quantity, o.total_price, o.status, o.created_at
         FROM orders o JOIN users u ON o.client_id=u.user_id JOIN products p ON o.product_id=p.product_id
         ORDER BY o.created_at DESC LIMIT 5`
      ),
    ]);
    return res.status(200).json({
      success: true,
      stats: {
        totalClients:   parseInt(clients.rows[0].total),
        totalOrders:    parseInt(orders.rows[0].total),
        totalShipments: parseInt(shipments.rows[0].total),
        totalProducts:  parseInt(products.rows[0].total),
        totalInquiries: parseInt(inquiries.rows[0].total),
      },
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load dashboard." });
  }
};

const getAllClients = async (req, res) => {
  try {
    const result = await query(
      `SELECT user_id, name, email, phone, company, created_at FROM users WHERE role='client' ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, count: result.rows.length, clients: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch clients." });
  }
};

const getClientDetail = async (req, res) => {
  try {
    const clientResult = await query(
      `SELECT user_id, name, email, phone, company, created_at FROM users WHERE user_id=$1 AND role='client'`,
      [req.params.id]
    );
    if (clientResult.rows.length === 0) return res.status(404).json({ success: false, message: "Client not found." });
    const ordersResult = await query(
      `SELECT o.order_id, p.name AS product_name, o.quantity, o.total_price, o.status, o.created_at
       FROM orders o JOIN products p ON o.product_id=p.product_id
       WHERE o.client_id=$1 ORDER BY o.created_at DESC`,
      [req.params.id]
    );
    return res.status(200).json({ success: true, client: clientResult.rows[0], orders: ordersResult.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch client." });
  }
};

module.exports = { getDashboardStats, getAllClients, getClientDetail };
