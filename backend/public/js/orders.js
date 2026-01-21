const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      menuId: String,
      name: String,
      qty: Number,
      price: Number,
      image: String
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: "Pending" } // Pending, Accepted, Delivered, Cancelled
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
