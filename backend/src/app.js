const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (temporary monorepo mode)
const publicPath = path.join(__dirname, "..", "public");
const uploadsPath = path.join(__dirname, "..", "uploads");

app.use(express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));

// Mock payment endpoint for local testing
app.get("/mock-payment", (req, res) => {
  const orderId = req.query.orderId;
  const status = req.query.status || "success";

  if (status === "success") {
    return res.redirect(`/order-success.html?orderId=${orderId}&mock=true`);
  }

  return res.redirect(`/order-failed.html?orderId=${orderId}&mock=true`);
});

app.get("/order-success", (req, res) => {
  res.sendFile(path.join(publicPath, "order-success.html"));
});

app.get("/order-failed", (req, res) => {
  res.sendFile(path.join(publicPath, "order-failed.html"));
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

module.exports = app;
