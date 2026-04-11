const express = require("express");
const router  = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const { submitContact, getAllInquiries } = require("../controllers/contact.controller");

router.post("/",  submitContact);
router.get("/",   verifyToken, adminOnly, getAllInquiries);

module.exports = router;