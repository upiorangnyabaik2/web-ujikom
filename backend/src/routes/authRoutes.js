const router = require("express").Router();
const { register, login, verify, updateProfile } = require("../controllers/authController");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

router.post("/register", register);
router.post("/login", login);
router.post("/verify", auth, verify);
router.put("/profile", auth, upload.single("profileImage"), updateProfile);

module.exports = router;
