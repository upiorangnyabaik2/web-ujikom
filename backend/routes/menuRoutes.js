// backend/routes/menuRoutes.js
const router = require("express").Router();
const menu = require("../controllers/menuController");
const multer = require("multer");

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
router.get("/", menu.getAll);
router.post("/", upload.single("image"), menu.create);
router.put("/:id", upload.single("image"), menu.update);
router.delete("/:id", menu.remove);

module.exports = router;