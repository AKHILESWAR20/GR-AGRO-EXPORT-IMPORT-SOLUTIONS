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
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required."
      });
    }

    // Step 1: Save to database
    await query(
      `INSERT INTO inquiries (name, email, service, message) VALUES ($1, $2, $3, $4)`,
      [name, email, service || "General", message]
    );

    // Step 2: Send auto-reply to CLIENT — independently so it won't block admin mail
    try {
      await sendContactAutoReply(email, name);
      console.log(`✅ Auto-reply sent to client: ${email}`);
    } catch (clientMailErr) {
      // Log but don't fail — still send admin mail
      console.error(`❌ Client auto-reply failed for ${email}:`, clientMailErr.message);
    }

    // Step 3: Send notification to ADMIN — independently
    try {
      await sendContactNotifyAdmin(name, email, message, service || "General");
      console.log(`✅ Admin notification sent`);
    } catch (adminMailErr) {
      console.error(`❌ Admin notification failed:`, adminMailErr.message);
    }

    // Step 4: Always return success if DB save worked
    return res.status(200).json({
      success: true,
      message: "Inquiry submitted! We will get back to you soon.",
    });

  } catch (err) {
    console.error("Contact Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit inquiry."
    });
  }
};

const getAllInquiries = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM inquiries ORDER BY created_at DESC`
    );
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      inquiries: result.rows
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries."
    });
  }
};

module.exports = { submitContact, getAllInquiries };