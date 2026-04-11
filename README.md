# Gopi Exporting Hub — Backend Setup Guide

## 📁 Project Structure
```
gopi-backend/
├── server.js                  ← Main entry point
├── .env.example               ← Copy to .env and fill values
├── package.json               ← Dependencies
├── config/
│   ├── db.js                  ← Oracle DB connection
│   └── mailer.js              ← Email templates (Nodemailer)
├── middleware/
│   ├── auth.js                ← JWT authentication
│   └── upload.js              ← File upload (Multer)
├── controllers/
│   ├── auth.controller.js     ← Signup, Client Login, Admin Login
│   ├── product.controller.js  ← Product CRUD
│   ├── order.controller.js    ← Order management + emails
│   ├── shipment.controller.js ← Shipment tracking
│   ├── contact.controller.js  ← Contact form + emails
│   ├── upload.controller.js   ← File upload/download
│   └── admin.controller.js    ← Admin dashboard
├── routes/
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── order.routes.js
│   └── other.routes.js
├── database/
│   └── schema.sql             ← Run this in Oracle SQL
└── uploads/                   ← Auto-created for file storage
```

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Setup Oracle Database
- Open Oracle SQL Developer
- Run `database/schema.sql`
- Generate bcrypt hash for admin password and update the INSERT

### 4. Setup Gmail App Password
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Generate a password for "Mail"
- Use that in MAIL_PASS in .env

### 5. Start Server
```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

## 🔐 API Endpoints

| Method | Endpoint                      | Access       |
|--------|-------------------------------|--------------|
| POST   | /api/auth/signup              | Public       |
| POST   | /api/auth/login               | Public       |
| POST   | /api/auth/admin/login         | Owner only   |
| GET    | /api/products                 | Public       |
| POST   | /api/products                 | Admin        |
| PUT    | /api/products/:id             | Admin        |
| DELETE | /api/products/:id             | Admin        |
| POST   | /api/orders                   | Client       |
| GET    | /api/orders/my                | Client       |
| GET    | /api/orders                   | Admin        |
| PUT    | /api/orders/:id/status        | Admin        |
| POST   | /api/shipments                | Admin        |
| GET    | /api/shipments/track/:id      | Client       |
| PUT    | /api/shipments/:id/status     | Admin        |
| POST   | /api/contact                  | Public       |
| GET    | /api/contact                  | Admin        |
| POST   | /api/files/upload             | Admin+Client |
| GET    | /api/files/:orderId           | Admin+Client |
| DELETE | /api/files/:id                | Admin        |
| GET    | /api/admin/dashboard          | Admin        |
| GET    | /api/admin/clients            | Admin        |
