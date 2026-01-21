const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { createOrder, getMyOrders } = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/me", auth, getMyOrders);

module.exports = router;
