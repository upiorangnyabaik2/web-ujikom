const router = require("express").Router();
const checkoutController = require("../controllers/checkoutController");
const { auth } = require("../middleware/auth");

// Create checkout (requires auth)
router.post("/create", auth, checkoutController.createCheckout);

// Get invoice status
router.get("/invoice/:invoiceId", checkoutController.getInvoiceStatus);

// Get order details (requires auth)
router.get("/order/:orderId", auth, checkoutController.getOrderDetails);

// Xendit webhook (no auth required)
router.post("/webhook/xendit", checkoutController.webhookXendit);

module.exports = router;
