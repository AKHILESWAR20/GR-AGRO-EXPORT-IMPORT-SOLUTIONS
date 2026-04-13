const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const { initPool } = require("./config/db");
const authRoutes      = require("./routes/auth.routes");
const productRoutes   = require("./routes/product.routes");
const orderRoutes     = require("./routes/order.routes");
const contactRoutes   = require("./routes/contact.routes");
const uploadRoutes    = require("./routes/upload.routes");
const adminRoutes     = require("./routes/admin.routes");
const shipmentRoutes  = require("./routes/shipment.routes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    "https://gr-agro-export-import-solutions.vercel.app",
    "http://localhost:5500"
  ],
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d"
  })
);
app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/contact",   contactRoutes);
app.use("/api/files",     uploadRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/shipments", shipmentRoutes);

app.get("/", (req, res) => {
  res.json({ status: "✅ Gopi Exporting Hub API is running" });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

initPool().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});
