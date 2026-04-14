// ─────────────────────────────────────────
// FILE: controllers/order.controller.js
// SECTION: Order Management
// ─────────────────────────────────────────

const { query } = require("../config/db");
const { sendOrderNotifyAdmin, sendOrderConfirmClient } = require("../config/mailer");


// ─────────────────────────────────────────
// PLACE ORDER
// POST /api/orders
// ─────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;

    const productIdNum = parseInt(productId);
    const quantityNum  = parseInt(quantity);

    const clientId    = req.user.id;
    const clientName  = req.user.name;
    const clientEmail = req.user.email;

    if (!productIdNum || !quantityNum) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity."
      });
    }

    // Fetch product
    const productResult = await query(
      `SELECT name, price FROM products WHERE product_id = $1`,
      [productIdNum]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    const product = productResult.rows[0];
    const totalPrice = product.price * quantityNum;

    // Insert order
    const orderResult = await query(
      `INSERT INTO orders (client_id, product_id, quantity, total_price, notes, status)
       VALUES ($1,$2,$3,$4,$5,'Processing')
       RETURNING order_id`,
      [clientId, productIdNum, quantityNum, totalPrice, notes || null]
    );

    const orderId = orderResult.rows[0].order_id;

    // Send emails
    await sendOrderNotifyAdmin(clientName, clientEmail, orderId, product.name, quantityNum);
    await sendOrderConfirmClient(clientEmail, clientName, orderId, product.name, quantityNum);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation sent to your email.",
      orderId
    });

  } catch (err) {
    console.error("Place Order Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to place order."
    });
  }
};


// ─────────────────────────────────────────
// GET MY ORDERS
// ─────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const clientId = req.user.id;

    const result = await query(
      `SELECT o.order_id,
              p.name AS product_name,
              o.quantity,
              o.total_price,
              o.status,
              o.notes,
              o.created_at
       FROM orders o
       JOIN products p ON o.product_id = p.product_id
       WHERE o.client_id = $1
       ORDER BY o.created_at DESC`,
      [clientId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      orders: result.rows
    });

  } catch (err) {
    console.error("Get My Orders Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders."
    });
  }
};


// ─────────────────────────────────────────
// GET ALL ORDERS
// ─────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {

    const result = await query(
      `SELECT o.order_id,
              u.name AS client_name,
              u.email AS client_email,
              p.name AS product_name,
              o.quantity,
              o.total_price,
              o.status,
              o.notes,
              o.created_at
       FROM orders o
       JOIN users u ON o.client_id = u.user_id
       JOIN products p ON o.product_id = p.product_id
       ORDER BY o.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      orders: result.rows
    });

  } catch (err) {
    console.error("Get All Orders Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders."
    });
  }
};


// ─────────────────────────────────────────
// UPDATE ORDER STATUS
// ─────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Processing",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value."
      });
    }

    await query(
      `UPDATE orders SET status = $1 WHERE order_id = $2`,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`
    });

  } catch (err) {
    console.error("Update Order Status Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status."
    });
  }
};


module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};