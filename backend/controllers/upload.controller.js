// ─────────────────────────────────────────
// FILE: controllers/upload.controller.js
// SECTION: File Upload (PostgreSQL)
// ─────────────────────────────────────────

const { query } = require("../config/db");
const fs   = require("fs");
const path = require("path");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const { orderId, docType } = req.body;
    await query(
      `INSERT INTO documents (order_id, file_name, file_url, file_size, doc_type, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [orderId||null, req.file.originalname, `/uploads/${req.file.filename}`, req.file.size, docType||"General", req.user.id]
    );
    return res.status(201).json({ success: true, message: "File uploaded successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Upload failed." });
  }
};

const getFilesByOrder = async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, u.name AS uploaded_by_name FROM documents d
       JOIN users u ON d.uploaded_by=u.user_id WHERE d.order_id=$1`,
      [req.params.orderId]
    );
    return res.status(200).json({ success: true, count: result.rows.length, files: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch files." });
  }
};

const deleteFile = async (req, res) => {
  try {
    const result = await query(`SELECT file_url FROM documents WHERE doc_id=$1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "File not found." });
    const filePath = path.join(__dirname, "../", result.rows[0].file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await query(`DELETE FROM documents WHERE doc_id=$1`, [req.params.id]);
    return res.status(200).json({ success: true, message: "File deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete file." });
  }
};

module.exports = { uploadFile, getFilesByOrder, deleteFile };
