const Order = require("../models/Order");
const Menu = require("../models/Menu");

const restoreStock = async (reservedItems) => {
  if (!Array.isArray(reservedItems)) return;
  for (const item of reservedItems) {
    await Menu.updateOne({ _id: item.menuId }, { $inc: { stock: item.qty } });
  }
};

const reserveStock = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items tidak boleh kosong");
  }

  const reserved = [];

  for (const item of items) {
    const qty = Number(item.qty || 0);
    if (!item.menuId) {
      throw new Error("Menu ID tidak valid");
    }
    if (isNaN(qty) || qty <= 0) {
      throw new Error("Kuantitas item tidak valid");
    }

    const menu = await Menu.findById(item.menuId);
    if (!menu) {
      throw new Error(`Menu item tidak ditemukan: ${item.name || item.menuId}`);
    }
    const availableStock = typeof menu.stock === "number" ? menu.stock : 0;
    if (availableStock < qty) {
      throw new Error(`Stok tidak mencukupi untuk ${menu.name}`);
    }

    const result = await Menu.updateOne(
      { _id: item.menuId, stock: { $gte: qty } },
      { $inc: { stock: -qty } }
    );

    if (result.modifiedCount === 0) {
      await restoreStock(reserved);
      throw new Error(`Stok tidak mencukupi untuk ${menu.name}`);
    }

    reserved.push({ menuId: item.menuId, qty });
  }

  return reserved;
};

// CREATE NEW ORDER
exports.createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, recipientName, recipientPhone, recipientAddress, notes } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, msg: "Items cannot be empty" });
    }

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ success: false, msg: "Total must be a positive number" });
    }

    if (!recipientName || !recipientPhone || !recipientAddress) {
      return res.status(400).json({ success: false, msg: "Recipient info is required" });
    }

    const validPaymentMethods = ["xendit", "transfer", "cod"];
    const method = paymentMethod?.toLowerCase() || "xendit";
    if (!validPaymentMethods.includes(method)) {
      return res.status(400).json({ success: false, msg: "Invalid payment method" });
    }

    const reservedStock = await reserveStock(items);

    const order = new Order({
      user: req.user._id,
      items,
      total: parseFloat(total),
      paymentMethod: method,
      status: "pending",
      paymentStatus: "pending",
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      recipientAddress: recipientAddress.trim(),
      notes: notes?.trim() || ""
    });

    try {
      await order.save();
      await order.populate("user", "name email");
    } catch (err) {
      await restoreStock(reservedStock);
      throw err;
    }

    res.status(201).json({ success: true, msg: "Order created successfully", data: order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, msg: "Failed to create order" });
  }
};

// GET ALL ORDERS (ADMIN)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch orders" });
  }
};

// GET USER'S ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch orders" });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // Check authorization
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, msg: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch order" });
  }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    // Validation
    if (!status) {
      return res.status(400).json({ success: false, msg: "Status is required" });
    }

    const validStatuses = ["pending", "processing", "ready", "completed", "cancelled"];
    const normalizedStatus = status.toLowerCase();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        msg: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // Check authorization - only owner or admin can update
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, msg: "Not authorized to update this order" });
    }

    order.status = normalizedStatus;
    await order.save();

    res.status(200).json({ success: true, msg: "Order status updated successfully", data: order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ success: false, msg: "Failed to update order" });
  }
};

// DELETE ORDER (ADMIN ONLY)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Only admins can delete orders" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ success: true, msg: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, msg: "Failed to delete order" });
  }
};
