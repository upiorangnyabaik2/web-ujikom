const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      console.warn("Warning: No MongoDB URI found in .env (MONGO_URI or MONGODB_URI)");
      console.warn("Using default: mongodb://localhost:27017/foodonline");
    }
    await mongoose.connect(mongoURI || "mongodb://localhost:27017/foodonline", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
