require("dotenv").config();
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Menu = require("../src/models/Menu");
const bcrypt = require("bcryptjs");

(async () => {
  await connectDB();

  // create admin
  const adminEmail = "admin@local";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash("admin123", 10);
    admin = await User.create({ name: "Admin", email: adminEmail, password: hash, role: "admin" });
    console.log("Admin created:", adminEmail, "password: admin123");
  } else {
    console.log("Admin already exists");
  }

  // sample menu
  const count = await Menu.countDocuments();
  if (count === 0) {
    const sample = [
      { name: "Nasi Goreng", price: 25000, stock: 10, image: "", description: "Enak pedas." },
      { name: "Mie Ayam", price: 20000, stock: 12, image: "", description: "Toping ayam." },
      { name: "Sate Ayam", price: 30000, stock: 8, image: "", description: "Bumbu kacang." }
    ];
    await Menu.insertMany(sample);
    console.log("Sample menu inserted");
  } else {
    console.log("Menu already seeded");
  }

  process.exit(0);
})();
