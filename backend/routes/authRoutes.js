const router = require("express").Router();
const { register, login, verify } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", auth, verify);

module.exports = router;
