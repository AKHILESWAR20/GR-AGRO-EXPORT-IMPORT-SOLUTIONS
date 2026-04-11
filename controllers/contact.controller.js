// ─────────────────────────────────────────
// FILE: controllers/contact.controller.js
// SECTION: Contact Form
//   - Submit inquiry (Public)
//   - Sends auto-reply to client
//   - Sends notification to admin
//   - Get all inquiries (Admin)
// ─────────────────────────────────────────

const { query } = require("../config/db");
const { sendContactAutoReply, sendContactNotifyAdmin } = require("../config/mailer");


// ─────────────────────────────────────────
// SUBMIT CONTACT FORM
// POST /api/contact
// Public — no login required
// ─────────────────────────────────────────
const submitContact = async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }

    // Save inquiry to DB
    await query(
      `INSERT INTO INQUIRIES (NAME, EMAIL, SERVICE, MESSAGE, CREATED_AT)
       VALUES (:name, :email, :service, :message, SYSDATE)`,
      { name, email, service: service || "General", message }
    );

    // Send auto-reply to client
    await sendContactAutoReply(email, name);

    // Notify admin
    await sendContactNotifyAdmin(name, email, message, service || "General");

    return res.status(200).json({
      success: true,
      message: "Your inquiry has been submitted. We will get back to you soon!",
    });

  } catch (err) {
    console.error("Contact Form Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to submit inquiry." });
  }
};


// ─────────────────────────────────────────
// GET ALL INQUIRIES
// GET /api/contact
// Admin only
// ─────────────────────────────────────────
const getAllInquiries = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM INQUIRIES ORDER BY CREATED_AT DESC`
    );

    return res.status(200).json({
      success: true,
      count:     result.rows.length,
      inquiries: result.rows,
    });
  } catch (err) {
    console.error("Get Inquiries Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch inquiries." });
  }
};


module.exports = { submitContact, getAllInquiries };
