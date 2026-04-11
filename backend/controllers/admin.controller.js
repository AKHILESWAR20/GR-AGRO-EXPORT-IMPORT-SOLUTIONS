// ─────────────────────────────────────────
// FILE: controllers/admin.controller.js
// SECTION: Admin Dashboard
//   - Dashboard summary stats
//   - Get all clients
//   - Get single client detail
// ─────────────────────────────────────────

const { query } = require("../config/db");


// ─────────────────────────────────────────
// DASHBOARD STATS
// GET /api/admin/dashboard
// Admin only — summary counts for dashboard
// ─────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [clients, orders, shipments, products, inquiries] = await Promise.all([
      query(`SELECT COUNT(*) AS TOTAL FROM USERS WHERE ROLE = 'client'`),
      query(`SELECT COUNT(*) AS TOTAL FROM ORDERS`),
      query(`SELECT COUNT(*) AS TOTAL FROM SHIPMENTS`),
      query(`SELECT COUNT(*) AS TOTAL FROM PRODUCTS`),
      query(`SELECT COUNT(*) AS TOTAL FROM INQUIRIES`),
    ]);

    const recentOrders = await query(
      `SELECT O.ORDER_ID, U.NAME AS CLIENT_NAME, P.NAME AS PRODUCT_NAME,
              O.QUANTITY, O.TOTAL_PRICE, O.STATUS, O.CREATED_AT
       FROM ORDERS O
       JOIN USERS U    ON O.CLIENT_ID  = U.USER_ID
       JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
       ORDER BY O.CREATED_AT DESC
       FETCH FIRST 5 ROWS ONLY`
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalClients:   clients.rows[0].TOTAL,
        totalOrders:    orders.rows[0].TOTAL,
        totalShipments: shipments.rows[0].TOTAL,
        totalProducts:  products.rows[0].TOTAL,
        totalInquiries: inquiries.rows[0].TOTAL,
      },
      recentOrders: recentOrders.rows,
    });

  } catch (err) {
    console.error("Dashboard Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to load dashboard." });
  }
};


// ─────────────────────────────────────────
// GET ALL CLIENTS
// GET /api/admin/clients
// Admin only
// ─────────────────────────────────────────
const getAllClients = async (req, res) => {
  try {
    const result = await query(
      `SELECT USER_ID, NAME, EMAIL, PHONE, COMPANY, CREATED_AT
       FROM USERS WHERE ROLE = 'client'
       ORDER BY CREATED_AT DESC`
    );

    return res.status(200).json({
      success: true,
      count:   result.rows.length,
      clients: result.rows,
    });
  } catch (err) {
    console.error("Get Clients Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch clients." });
  }
};


// ─────────────────────────────────────────
// GET CLIENT DETAIL
// GET /api/admin/clients/:id
// Admin only — full profile + orders
// ─────────────────────────────────────────
const getClientDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const clientResult = await query(
      `SELECT USER_ID, NAME, EMAIL, PHONE, COMPANY, CREATED_AT
       FROM USERS WHERE USER_ID = :id AND ROLE = 'client'`,
      { id }
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found." });
    }

    const ordersResult = await query(
      `SELECT O.ORDER_ID, P.NAME AS PRODUCT_NAME, O.QUANTITY,
              O.TOTAL_PRICE, O.STATUS, O.CREATED_AT
       FROM ORDERS O
       JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
       WHERE O.CLIENT_ID = :id
       ORDER BY O.CREATED_AT DESC`,
      { id }
    );

    return res.status(200).json({
      success: true,
      client: clientResult.rows[0],
      orders: ordersResult.rows,
    });

  } catch (err) {
    console.error("Get Client Detail Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch client detail." });
  }
};


module.exports = { getDashboardStats, getAllClients, getClientDetail };
