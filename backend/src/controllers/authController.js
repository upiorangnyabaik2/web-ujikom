const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, msg: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, msg: "Email tidak terdaftar" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Password salah" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User tidak ditemukan" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ success: false, msg: "Nama atau email wajib diisi" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User tidak ditemukan" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, msg: "Email sudah digunakan" });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (req.file) {
      user.profileImage = "/uploads/" + req.file.filename;
    }

    await user.save();

    res.json({
      success: true,
      msg: "Profil berhasil diperbarui",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email role createdAt").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};
