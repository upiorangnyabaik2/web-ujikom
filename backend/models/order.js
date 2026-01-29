const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [
    {
      menuId: String,
      name: String,
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      image: String
    }
  ],
  total: { 
    type: Number, 
    required: true,
    min: [0, "Total cannot be negative"]
  },
  status: { 
    type: String, 
    enum: ["pending", "processing", "ready", "completed", "cancelled"],
    default: "pending" 
  },
  paymentMethod: { 
    type: String, 
    enum: ["xendit", "transfer", "cod"],
    default: "xendit" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "verified", "failed"],
    default: "pending" 
  },
  
  // Recipient info
  recipientName: { 
    type: String, 
    required: true,
    trim: true
  },
  recipientPhone: { 
    type: String, 
    required: true,
    trim: true
  },
  recipientAddress: { 
    type: String, 
    required: true,
    trim: true
  },
  notes: { 
    type: String, 
    default: "",
    trim: true
  },
  
  // Xendit info (if payment method is xendit)
  xenditInvoiceId: String,
  xenditInvoiceStatus: String,
  
  // Bank info (if payment method is transfer)
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String,
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
