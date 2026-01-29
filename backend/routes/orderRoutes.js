const router = require("express").Router();
const { auth, adminOnly } = require("../middleware/auth");
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  updateOrderStatus,
  getAllOrders,
  deleteOrder
} = require("../controllers/orderController");

// User Routes
router.post("/", auth, createOrder);
router.get("/me", auth, getMyOrders);
router.get("/:orderId", auth, getOrderById);
router.put("/:orderId", auth, updateOrderStatus);

// Admin Routes
router.get("/", auth, adminOnly, getAllOrders);
router.delete("/:orderId", auth, adminOnly, deleteOrder);

module.exports = router;
