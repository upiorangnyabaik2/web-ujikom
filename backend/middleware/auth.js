const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.body.token || req.query.token;
    if (!header) return res.status(401).json({ success:false, msg: "No token provided" });

    // Accept both "Bearer TOKEN" and raw token
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ success:false, msg: "Invalid token (user not found)" });

    req.user = user;
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ success:false, msg: "Token invalid or expired" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success:false, msg: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ success:false, msg: "Admin only" });
  next();
};
