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
