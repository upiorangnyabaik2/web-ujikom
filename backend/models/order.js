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
  status: { type: String, default: "Pending" }, // Pending, Accepted, Delivered, Cancelled
  paymentMethod: { type: String, default: "xendit" }, // xendit, transfer, cod
  paymentStatus: { type: String, default: "pending" }, // pending, paid, verified, failed
  
  // Recipient info
  recipientName: String,
  recipientPhone: String,
  recipientAddress: String,
  notes: String,
  
  // Xendit info (if payment method is xendit)
  xenditInvoiceId: String,
  xenditInvoiceStatus: String,
  
  // Bank info (if payment method is transfer)
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String,
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
