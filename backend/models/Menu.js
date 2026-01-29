const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"]
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  image: { 
    type: String, 
    required: [true, "Image is required"],
    default: "" 
  },
  description: { 
    type: String, 
    default: "",
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Menu", MenuSchema);
