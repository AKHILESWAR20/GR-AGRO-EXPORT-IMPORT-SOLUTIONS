// ─────────────────────────────────────────
// FILE: controllers/order.controller.js
// SECTION: Order Management
//   - Place order (Client)
//   - Get my orders (Client)
//   - Get all orders (Admin)
//   - Update order status (Admin)
// ─────────────────────────────────────────

const { query } = require("../config/db");
const { sendOrderNotifyAdmin, sendOrderConfirmClient } = require("../config/mailer");


// ─────────────────────────────────────────
// PLACE ORDER
// POST /api/orders
// Client only — triggers emails to admin & client
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
 

    // Fetch product details
    const productResult = await query(
      `SELECT NAME, PRICE FROM PRODUCTS WHERE PRODUCT_ID = :id`,
      { id: productId }
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const product    = productResult.rows[0];
    const totalPrice = product.PRICE * quantityNum;

    // Insert order
   const orderResult = await query(
  `INSERT INTO orders (client_id, product_id, quantity, total_price, notes, status)
   VALUES ($1,$2,$3,$4,$5,'Processing') RETURNING order_id`,
  [clientId, productId, quantity, totalPrice, notes||null]
);

    const orderId = orderResult.outBinds.orderId[0];

    // Send emails
    await sendOrderNotifyAdmin(clientName, clientEmail, orderId, product.NAME, quantity);
    await sendOrderConfirmClient(clientEmail, clientName, orderId, product.NAME, quantity);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation sent to your email.",
      orderId,
    });

  } catch (err) {
    console.error("Place Order Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};


// ─────────────────────────────────────────
// GET MY ORDERS
// GET /api/orders/my
// Client — sees only their own orders
// ─────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const clientId = req.user.id;

    const result = await query(
      `SELECT O.ORDER_ID, P.NAME AS PRODUCT_NAME, O.QUANTITY, O.TOTAL_PRICE,
              O.STATUS, O.NOTES, O.CREATED_AT
       FROM ORDERS O
       JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
       WHERE O.CLIENT_ID = :clientId
       ORDER BY O.CREATED_AT DESC`,
      { clientId }
    );

    return res.status(200).json({
      success: true,
      count:  result.rows.length,
      orders: result.rows,
    });
  } catch (err) {
    console.error("Get My Orders Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};


// ─────────────────────────────────────────
// GET ALL ORDERS
// GET /api/orders
// Admin only
// ─────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const result = await query(
      `SELECT O.ORDER_ID, U.NAME AS CLIENT_NAME, U.EMAIL AS CLIENT_EMAIL,
              P.NAME AS PRODUCT_NAME, O.QUANTITY, O.TOTAL_PRICE,
              O.STATUS, O.NOTES, O.CREATED_AT
       FROM ORDERS O
       JOIN USERS U    ON O.CLIENT_ID   = U.USER_ID
       JOIN PRODUCTS P ON O.PRODUCT_ID  = P.PRODUCT_ID
       ORDER BY O.CREATED_AT DESC`
    );

    return res.status(200).json({
      success: true,
      count:  result.rows.length,
      orders: result.rows,
    });
  } catch (err) {
    console.error("Get All Orders Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};


// ─────────────────────────────────────────
// UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// Admin only
// ─────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    await query(
      `UPDATE ORDERS SET STATUS = :status WHERE ORDER_ID = :id`,
      { status, id }
    );

    return res.status(200).json({ success: true, message: `Order status updated to "${status}".` });
  } catch (err) {
    console.error("Update Order Status Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update order status." });
  }
};


module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
