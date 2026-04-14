// ─────────────────────────────────────────
// FILE: controllers/product.controller.js
// SECTION: Product Management
//   - Get all products (Public)
//   - Get single product (Public)
//   - Add product (Admin only)
//   - Update product (Admin only)
//   - Delete product (Admin only)
// ─────────────────────────────────────────

const { query } = require("../config/db");

// ─────────────────────────────────────────
// GET ALL PRODUCTS
// GET /api/products
// Public — clients & visitors can view
// ─────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const result = await query(
      `SELECT PRODUCT_ID, NAME, CATEGORY, DESCRIPTION, PRICE, UNIT, 
              ORIGIN_COUNTRY, STOCK_STATUS, IMAGE_URL, CREATED_AT
       FROM PRODUCTS
       ORDER BY CREATED_AT DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
  } catch (err) {
    console.error("Get Products Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};


// ─────────────────────────────────────────
// GET SINGLE PRODUCT
// GET /api/products/:id
// ─────────────────────────────────────────
const getProduct = async (req, res) => {
  try {
   const result = await query(
  `SELECT * FROM products WHERE product_id = $1`,
  [id]
);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error("Get Product Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};


// ─────────────────────────────────────────
// ADD PRODUCT
// POST /api/products
// Admin only
// ─────────────────────────────────────────
const addProduct = async (req, res) => {
  try {
    const { name, category, description, price, unit, originCountry, stockStatus } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category and price are required." });
    }

    // If image uploaded via multer
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    await query(
      `INSERT INTO PRODUCTS (NAME, CATEGORY, DESCRIPTION, PRICE, UNIT, ORIGIN_COUNTRY, STOCK_STATUS, IMAGE_URL, CREATED_AT)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
      [ 
        name,
        category,
        description || null,
        parseFloat(price),
        unit || null,
        originCountry || null,
        stockStatus || "Available",
        imageUrl,
      ]
    );

    return res.status(201).json({ success: true, message: "Product added successfully." });
  } catch (err) {
    console.error("Add Product Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to add product." });
  }
};


// ─────────────────────────────────────────
// UPDATE PRODUCT
// PUT /api/products/:id
// Admin only
// ─────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, unit, originCountry, stockStatus } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const fields = [];
    const binds  = { id };

    if (name)          { fields.push("NAME = :name");                   binds.name = name; }
    if (category)      { fields.push("CATEGORY = :category");           binds.category = category; }
    if (description)   { fields.push("DESCRIPTION = :description");     binds.description = description; }
    if (price)         { fields.push("PRICE = :price");                 binds.price = parseFloat(price); }
    if (unit)          { fields.push("UNIT = :unit");                   binds.unit = unit; }
    if (originCountry) { fields.push("ORIGIN_COUNTRY = :originCountry");binds.originCountry = originCountry; }
    if (stockStatus)   { fields.push("STOCK_STATUS = :stockStatus");    binds.stockStatus = stockStatus; }
    if (imageUrl)      { fields.push("IMAGE_URL = :imageUrl");          binds.imageUrl = imageUrl; }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update." });
    }

    await query(
      `UPDATE PRODUCTS SET ${fields.join(", ")} WHERE PRODUCT_ID = :id`,
      binds
    );

    return res.status(200).json({ success: true, message: "Product updated successfully." });
  } catch (err) {
    console.error("Update Product Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update product." });
  }
};


// ─────────────────────────────────────────
// DELETE PRODUCT
// DELETE /api/products/:id
// Admin only
// ─────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await query(`DELETE FROM PRODUCTS WHERE PRODUCT_ID = :id`, { id });

    return res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    console.error("Delete Product Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};


module.exports = { getAllProducts, getProduct, addProduct, updateProduct, deleteProduct };
