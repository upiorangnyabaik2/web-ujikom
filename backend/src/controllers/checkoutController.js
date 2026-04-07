const axios = require("axios");
const Order = require("../models/Order");
const Menu = require("../models/Menu");

const XENDIT_API_URL = "https://api.xendit.co";
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const USE_MOCK_PAYMENT = !XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.includes("xxx");

// Create auth header untuk Xendit
const getXenditHeaders = () => {
  return {
    Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
    "Content-Type": "application/json",
  };
};

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

// Mock invoice URL untuk testing tanpa API key
const generateMockInvoiceUrl = (orderId) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5000";
  return `${baseUrl}/order-success?orderId=${orderId}&mock=true`;
};

// Create Checkout
exports.createCheckout = async (req, res) => {
  try {
    const { items, total, paymentMethod, xenditMethod, recipientName, phone, address, notes } = req.body;
    const userId = req.user.id;

    const reservedStock = await reserveStock(items);

    const order = new Order({
      user: userId,
      items,
      total,
      status: "pending",
      paymentMethod: paymentMethod || "xendit",
      recipientName,
      recipientPhone: phone,
      recipientAddress: address,
      notes
    });

    try {
      await order.save();
    } catch (err) {
      await restoreStock(reservedStock);
      throw err;
    }

    // If using mock payment (no valid API key), generate mock invoice URL
    if (USE_MOCK_PAYMENT) {
      console.log("⚠️  Using MOCK payment (API key not configured). Set XENDIT_SECRET_KEY in .env for real payments.");
      const mockInvoiceUrl = generateMockInvoiceUrl(order._id);
      
      return res.json({
        success: true,
        orderId: order._id,
        invoiceId: `MOCK-${order._id}`,
        invoiceUrl: mockInvoiceUrl,
        amount: total,
        isMockPayment: true,
        message: "⚠️ Mode: Mock Payment (Testing). Real payments require valid Xendit API key."
      });
    }

    // Create Xendit Invoice (real payment)
    const invoiceParams = {
      external_id: `ORDER-${order._id}`,
      amount: Math.round(total),
      description: `Order from FoodOnline - ${items.map((i) => i.name).join(", ")}`,
      invoice_duration: 3600, // 1 hour validity
      customer: {
        given_names: req.user.name || "Customer",
        email: req.user.email,
      },
      items: items.map((item) => ({
        name: item.name,
        quantity: item.qty,
        price: Math.round(item.price),
      })),
      ...(xenditMethod ? { payment_methods: [xenditMethod] } : {}),
      success_redirect_url: `${process.env.CLIENT_URL || "http://localhost:5000"}/order-success?orderId=${order._id}`,
      failure_redirect_url: `${process.env.CLIENT_URL || "http://localhost:5000"}/order-failed?orderId=${order._id}`,
    };

    const response = await axios.post(
      `${XENDIT_API_URL}/v2/invoices`,
      invoiceParams,
      { headers: getXenditHeaders() }
    );

    const invoice = response.data;

    // Update order with Xendit invoice ID
    order.xenditInvoiceId = invoice.id;
    await order.save();

    res.json({
      success: true,
      orderId: order._id,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      amount: total,
    });
  } catch (error) {
    console.error("Checkout error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// Get Invoice Status
exports.getInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const response = await axios.get(
      `${XENDIT_API_URL}/v2/invoices/${invoiceId}`,
      { headers: getXenditHeaders() }
    );

    const invoice = response.data;

    res.json({
      success: true,
      status: invoice.status,
      invoiceId: invoice.id,
      paidAmount: invoice.paid_amount,
    });
  } catch (error) {
    console.error("Get invoice error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// Webhook untuk Xendit (Payment Confirmation)
exports.webhookXendit = async (req, res) => {
  try {
    const { id, status, external_id } = req.body;

    // Extract order ID from external_id (FORMAT: ORDER-[orderId])
    const orderId = external_id.replace("ORDER-", "");

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status based on Xendit invoice status
    if (status === "PAID") {
      order.status = "Accepted";
      order.xenditInvoiceStatus = "PAID";
    } else if (status === "EXPIRED") {
      order.status = "Cancelled";
      order.xenditInvoiceStatus = "EXPIRED";
    }

    await order.save();

    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
