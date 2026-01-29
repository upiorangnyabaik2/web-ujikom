// backend/routes/menuRoutes.js
const router = require("express").Router();
const menu = require("../controllers/menuController");
const multer = require("multer");
const { auth, adminOnly } = require("../middleware/auth");

// MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "backend/uploads"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "." + ext);
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