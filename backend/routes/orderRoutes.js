const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { createOrder, getMyOrders, updateOrderStatus } = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/me", auth, getMyOrders);
router.put("/:orderId", auth, updateOrderStatus);

module.exports = router;
