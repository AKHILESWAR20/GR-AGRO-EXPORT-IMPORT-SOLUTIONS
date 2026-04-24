// ─────────────────────────────────────────
// FILE: middleware/upload.js
// ─────────────────────────────────────────

const multer     = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder:   "gr-agro/products",
      format:   "jpg",
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    };
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder:        "gr-agro/documents",
      resource_type: "auto",
    };
  },
});

const upload         = multer({ storage: productStorage });
const uploadDocument = multer({ storage: documentStorage });

module.exports         = upload;
module.exports.upload  = upload;
module.exports.uploadDocument = uploadDocument;