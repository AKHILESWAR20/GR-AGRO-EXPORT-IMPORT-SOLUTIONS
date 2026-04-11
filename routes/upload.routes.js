const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const upload  = require("../middleware/upload");
const { uploadFile, getFilesByOrder, deleteFile } = require("../controllers/upload.controller");

router.post("/upload",   verifyToken, upload.single("file"), uploadFile);
router.get("/:orderId",  verifyToken, getFilesByOrder);
router.delete("/:id",    verifyToken, adminOnly, deleteFile);

module.exports = router;