// ─────────────────────────────────────────
// FILE: config/mailer.js
// SECTION: Email Configuration & Templates
// ─────────────────────────────────────────

const nodemailer = require("nodemailer");
require("dotenv").config();

// ─────────────────────────────────────────
// SMTP TRANSPORTER SETUP
// ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection
transporter.verify((err, success) => {
  if (err) console.error("❌ Mailer Error:", err.message);
  else     console.log("✅ Mailer Ready");
});


// ─────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────

// 1. Welcome email to new client on signup
const sendWelcomeMail = async (clientEmail, clientName) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      clientEmail,
    subject: "Welcome to Gopi Exporting Hub!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#0B1F3A;padding:30px;text-align:center;">
          <h1 style="color:#C9A84C;margin:0;font-size:24px;">Gopi Exporting Hub</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;">Global Trade Solutions</p>
        </div>
        <div style="padding:36px;">
          <h2 style="color:#0B1F3A;">Welcome, ${clientName}! 🎉</h2>
          <p style="color:#555;line-height:1.7;">
            Thank you for registering with <strong>Gopi Exporting Hub</strong>. 
            Your account has been created successfully.
          </p>
          <p style="color:#555;line-height:1.7;">
            You can now browse our products, place inquiries, and track your shipments 
            all from your personal dashboard.
          </p>
          <div style="margin:28px 0;text-align:center;">
            <a href="${process.env.CLIENT_URL}/login" 
               style="background:#C9A84C;color:#0B1F3A;padding:12px 32px;border-radius:4px;
                      text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:1px;">
              LOGIN TO YOUR ACCOUNT
            </a>
          </div>
          <p style="color:#888;font-size:13px;">If you have any questions, contact us at ${process.env.ADMIN_EMAIL}</p>
        </div>
        <div style="background:#f7f2e8;padding:16px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 Gopi Exporting Hub. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};


// 2. Contact form: Auto-reply to client
const sendContactAutoReply = async (clientEmail, clientName) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      clientEmail,
    subject: "We Received Your Inquiry – Gopi Exporting Hub",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#0B1F3A;padding:30px;text-align:center;">
          <h1 style="color:#C9A84C;margin:0;font-size:24px;">Gopi Exporting Hub</h1>
        </div>
        <div style="padding:36px;">
          <h2 style="color:#0B1F3A;">Hello, ${clientName}!</h2>
          <p style="color:#555;line-height:1.7;">
            Thank you for reaching out to us. We have received your inquiry and our team 
            is already reviewing it.
          </p>
          <p style="color:#555;line-height:1.7;">
            <strong>We will get back to you as soon as possible</strong>, usually within 
            24 business hours.
          </p>
          <p style="color:#555;line-height:1.7;">
            In the meantime, feel free to explore our services and products on our website.
          </p>
          <p style="margin-top:28px;color:#888;font-size:13px;">
            Warm regards,<br/>
            <strong style="color:#0B1F3A;">Gopi Exporting Hub Team</strong><br/>
            ${process.env.ADMIN_EMAIL}
          </p>
        </div>
        <div style="background:#f7f2e8;padding:16px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 Gopi Exporting Hub. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};


// 3. Contact form: Notify admin of new inquiry
const sendContactNotifyAdmin = async (clientName, clientEmail, message, service) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      process.env.ADMIN_EMAIL,
    subject: `📩 New Inquiry from ${clientName} – Action Required`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#0B1F3A;padding:24px;">
          <h2 style="color:#C9A84C;margin:0;">New Client Inquiry</h2>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Gopi Exporting Hub – Admin Notification</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#333;font-size:15px;">
            A new inquiry has been submitted. Please review the details below:
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;width:35%;">Client Name</td>
              <td style="padding:12px 16px;color:#555;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Email</td>
              <td style="padding:12px 16px;color:#555;">${clientEmail}</td>
            </tr>
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Service</td>
              <td style="padding:12px 16px;color:#555;">${service}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Message</td>
              <td style="padding:12px 16px;color:#555;">${message}</td>
            </tr>
          </table>
          <div style="margin-top:28px;">
            <a href="${process.env.CLIENT_URL}/admin/inquiries"
               style="background:#C9A84C;color:#0B1F3A;padding:12px 28px;border-radius:4px;
                      text-decoration:none;font-weight:bold;font-size:13px;">
              VIEW IN ADMIN PANEL
            </a>
          </div>
        </div>
      </div>
    `,
  });
};


// 4. Order placed: Notify admin
const sendOrderNotifyAdmin = async (clientName, clientEmail, orderId, productName, quantity) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      process.env.ADMIN_EMAIL,
    subject: `🛒 New Order Placed by ${clientName} – Order #${orderId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#0B1F3A;padding:24px;">
          <h2 style="color:#C9A84C;margin:0;">New Order Received</h2>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Gopi Exporting Hub – Order Notification</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#333;font-size:15px;">
            A new order has been placed. Here are the order details:
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;width:35%;">Order ID</td>
              <td style="padding:12px 16px;color:#555;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Client Name</td>
              <td style="padding:12px 16px;color:#555;">${clientName}</td>
            </tr>
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Client Email</td>
              <td style="padding:12px 16px;color:#555;">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Product</td>
              <td style="padding:12px 16px;color:#555;">${productName}</td>
            </tr>
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Quantity</td>
              <td style="padding:12px 16px;color:#555;">${quantity}</td>
            </tr>
          </table>
          <div style="margin-top:28px;">
            <a href="${process.env.CLIENT_URL}/admin/orders"
               style="background:#C9A84C;color:#0B1F3A;padding:12px 28px;border-radius:4px;
                      text-decoration:none;font-weight:bold;font-size:13px;">
              MANAGE ORDER
            </a>
          </div>
        </div>
      </div>
    `,
  });
};


// 5. Order placed: Confirmation to client
const sendOrderConfirmClient = async (clientEmail, clientName, orderId, productName, quantity) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      clientEmail,
    subject: `✅ Order Confirmed – Order #${orderId} | Gopi Exporting Hub`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#0B1F3A;padding:30px;text-align:center;">
          <h1 style="color:#C9A84C;margin:0;font-size:24px;">Order Confirmed!</h1>
        </div>
        <div style="padding:36px;">
          <h2 style="color:#0B1F3A;">Hi ${clientName},</h2>
          <p style="color:#555;line-height:1.7;">
            Your order has been successfully placed. Our team will process it and keep you updated.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;width:40%;">Order ID</td>
              <td style="padding:12px 16px;color:#555;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Product</td>
              <td style="padding:12px 16px;color:#555;">${productName}</td>
            </tr>
            <tr style="background:#f7f2e8;">
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Quantity</td>
              <td style="padding:12px 16px;color:#555;">${quantity}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:bold;color:#0B1F3A;">Status</td>
              <td style="padding:12px 16px;color:#2d8a4e;font-weight:bold;">Processing</td>
            </tr>
          </table>
          <div style="margin-top:28px;text-align:center;">
            <a href="${process.env.CLIENT_URL}/dashboard/orders"
               style="background:#C9A84C;color:#0B1F3A;padding:12px 28px;border-radius:4px;
                      text-decoration:none;font-weight:bold;font-size:13px;">
              TRACK YOUR ORDER
            </a>
          </div>
        </div>
        <div style="background:#f7f2e8;padding:16px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 Gopi Exporting Hub. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};


module.exports = {
  transporter,
  sendWelcomeMail,
  sendContactAutoReply,
  sendContactNotifyAdmin,
  sendOrderNotifyAdmin,
  sendOrderConfirmClient,
};