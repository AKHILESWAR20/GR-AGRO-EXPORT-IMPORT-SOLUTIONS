// ─────────────────────────────────────────
// FILE: controllers/product.controller.js
// SECTION: Products (PostgreSQL)
// ─────────────────────────────────────────

const { query } = require("../config/db");

const getAllProducts = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM products ORDER BY created_at DESC`);
    return res.status(200).json({ success: true, count: result.rows.length, products: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

const getProduct = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM products WHERE product_id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, product: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, description, price, unit, originCountry, stockStatus } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category and price are required." });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    await query(
      `INSERT INTO products (name, category, description, price, unit, origin_country, stock_status, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [name, category, description||null, parseFloat(price), unit||null, originCountry||null, stockStatus||"Available", imageUrl]
    );
    return res.status(201).json({ success: true, message: "Product added successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add product." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, unit, originCountry, stockStatus } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fields = []; const values = []; let i = 1;
    if (name)          { fields.push(`name=$${i++}`);           values.push(name); }
    if (category)      { fields.push(`category=$${i++}`);       values.push(category); }
    if (description)   { fields.push(`description=$${i++}`);    values.push(description); }
    if (price)         { fields.push(`price=$${i++}`);          values.push(parseFloat(price)); }
    if (unit)          { fields.push(`unit=$${i++}`);           values.push(unit); }
    if (originCountry) { fields.push(`origin_country=$${i++}`); values.push(originCountry); }
    if (stockStatus)   { fields.push(`stock_status=$${i++}`);   values.push(stockStatus); }
    if (imageUrl)      { fields.push(`image_url=$${i++}`);      values.push(imageUrl); }
    if (fields.length === 0) return res.status(400).json({ success: false, message: "No fields to update." });
    values.push(id);
    await query(`UPDATE products SET ${fields.join(",")} WHERE product_id=$${i}`, values);
    return res.status(200).json({ success: true, message: "Product updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update product." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await query(`DELETE FROM products WHERE product_id=$1`, [req.params.id]);
    return res.status(200).json({ success: true, message: "Product deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};

module.exports = { getAllProducts, getProduct, addProduct, updateProduct, deleteProduct };
