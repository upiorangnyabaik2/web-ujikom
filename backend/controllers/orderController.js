const Order = require("../models/order");

exports.createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, recipientName, recipientPhone, recipientAddress, notes } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, msg: "Items empty" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      total,
      paymentMethod: paymentMethod || "xendit",
      status: "Pending",
      recipientName,
      recipientPhone,
      recipientAddress,
      notes
    });
    
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!status) {
      return res.status(400).json({ success: false, msg: "Status required" });
    }

    const validStatuses = ["pending", "processing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, msg: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // Check if user is the owner or is admin
    const user = req.user;
    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, msg: "Not authorized" });
    }

    order.status = status.toLowerCase();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
