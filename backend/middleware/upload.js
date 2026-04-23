// ─────────────────────────────────────────
// FILE: middleware/upload.js
// SECTION: Multer + Cloudinary Upload
// ─────────────────────────────────────────

const multer    = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ── Cloudinary storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "gr-agro/products",
    allowed_formats: ["jpg","jpeg","png","webp"],
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  },
});

// ── Cloudinary storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "gr-agro/documents",
    allowed_formats: ["jpg","jpeg","png","pdf"],
    resource_type:   "auto",
  },
});

// ── Local fallback for non-image files
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs   = require("fs");
    const path = require("path");
    const dir  = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}-${file.originalname}`);
  },
});

const uploadProduct  = multer({ storage: productStorage });
const uploadDocument = multer({ storage: documentStorage });
const uploadLocal    = multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Default export for backward compatibility
const upload = multer({ storage: productStorage });

module.exports = upload;
module.exports.uploadProduct  = uploadProduct;
module.exports.uploadDocument = uploadDocument;
module.exports.uploadLocal    = uploadLocal;