const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const storage = multer.diskStorage({
  destination: "public/img",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.use(auth, role("admin"));

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
