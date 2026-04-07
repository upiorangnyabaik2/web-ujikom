const router = require("express").Router();
const menu = require("../controllers/menuController");
const multer = require("multer");
const path = require("path");
const { auth, adminOnly } = require("../middlewares/auth");

// MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// ROUTES
// Public Routes
router.get("/", menu.getAll);
router.get("/:id", menu.getOne);

// Admin Routes
router.post("/", auth, adminOnly, upload.single("image"), menu.create);
router.put("/:id", auth, adminOnly, upload.single("image"), menu.update);
router.delete("/:id", auth, adminOnly, menu.remove);

module.exports = router;
