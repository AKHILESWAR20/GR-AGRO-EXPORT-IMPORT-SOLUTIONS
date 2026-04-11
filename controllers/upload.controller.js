// ─────────────────────────────────────────
// FILE: controllers/upload.controller.js
// SECTION: File Upload & Management
//   - Upload file (Admin & Client)
//   - Get files by order (Client/Admin)
//   - Delete file (Admin)
// ─────────────────────────────────────────

const { query } = require("../config/db");
const fs   = require("fs");
const path = require("path");


// ─────────────────────────────────────────
// UPLOAD FILE
// POST /api/files/upload
// Admin & Client — attach file to an order
// ─────────────────────────────────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { orderId, docType } = req.body;
    const uploadedBy = req.user.id;
    const fileUrl    = `/uploads/${req.file.filename}`;
    const fileName   = req.file.originalname;
    const fileSize   = req.file.size;

    await query(
      `INSERT INTO DOCUMENTS (ORDER_ID, FILE_NAME, FILE_URL, FILE_SIZE, DOC_TYPE, UPLOADED_BY, CREATED_AT)
       VALUES (:orderId, :fileName, :fileUrl, :fileSize, :docType, :uploadedBy, SYSDATE)`,
      {
        orderId:    orderId    || null,
        fileName,
        fileUrl,
        fileSize,
        docType:    docType    || "General",
        uploadedBy,
      }
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      file: { name: fileName, url: fileUrl, size: fileSize },
    });

  } catch (err) {
    console.error("Upload Error:", err.message);
    return res.status(500).json({ success: false, message: "File upload failed." });
  }
};


// ─────────────────────────────────────────
// GET FILES BY ORDER
// GET /api/files/:orderId
// ─────────────────────────────────────────
const getFilesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      `SELECT D.*, U.NAME AS UPLOADED_BY_NAME
       FROM DOCUMENTS D
       JOIN USERS U ON D.UPLOADED_BY = U.USER_ID
       WHERE D.ORDER_ID = :orderId
       ORDER BY D.CREATED_AT DESC`,
      { orderId }
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      files: result.rows,
    });
  } catch (err) {
    console.error("Get Files Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch files." });
  }
};


// ─────────────────────────────────────────
// DELETE FILE
// DELETE /api/files/:id
// Admin only
// ─────────────────────────────────────────
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT FILE_URL FROM DOCUMENTS WHERE DOC_ID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    const fileUrl  = result.rows[0].FILE_URL;
    const filePath = path.join(__dirname, "../", fileUrl);

    // Remove from disk if exists
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await query(`DELETE FROM DOCUMENTS WHERE DOC_ID = :id`, { id });

    return res.status(200).json({ success: true, message: "File deleted successfully." });
  } catch (err) {
    console.error("Delete File Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete file." });
  }
};


module.exports = { uploadFile, getFilesByOrder, deleteFile };
