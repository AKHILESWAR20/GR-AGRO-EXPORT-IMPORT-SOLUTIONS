// ─────────────────────────────────────────
// FILE: controllers/contact.controller.js
// SECTION: Contact Form (PostgreSQL)
// ─────────────────────────────────────────

const { query } = require("../config/db");
const { sendContactAutoReply, sendContactNotifyAdmin } = require("../config/mailer");

const submitContact = async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }

    await query(
      `INSERT INTO inquiries (name, email, service, message) VALUES ($1, $2, $3, $4)`,
      [name, email, service || "General", message]
    );

    await sendContactAutoReply(email, name);
    await sendContactNotifyAdmin(name, email, message, service || "General");

    return res.status(200).json({
      success: true,
      message: "Inquiry submitted! We will get back to you soon.",
    });
  } catch (err) {
    console.error("Contact Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to submit inquiry." });
  }
};

const getAllInquiries = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM inquiries ORDER BY created_at DESC`);
    return res.status(200).json({ success: true, count: result.rows.length, inquiries: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch inquiries." });
  }
};

module.exports = { submitContact, getAllInquiries };
