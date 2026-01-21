require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));


// SERVE FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));

// Mock Payment Endpoint untuk testing (tanpa Xendit API key)
app.get("/mock-payment", (req, res) => {
  const orderId = req.query.orderId;
  const status = req.query.status || "success";
  
  // Redirect to success or failed page
  if (status === "success") {
    res.redirect(`/order-success.html?orderId=${orderId}&mock=true`);
  } else {
    res.redirect(`/order-failed.html?orderId=${orderId}&mock=true`);
  }
});

// Fallback to index.html untuk SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// LISTEN
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running at http://localhost:${PORT}`));