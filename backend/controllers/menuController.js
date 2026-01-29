// backend/controllers/menuController.js
const Menu = require("../models/Menu");

// GET ALL MENU ITEMS
exports.getAll = async (req, res) => {
  try {
    const data = await Menu.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch menu" });
  }
};

// GET SINGLE MENU BY ID
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Menu.findById(id);

    if (!data) {
      return res.status(404).json({ success: false, msg: "Menu item not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching menu item:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch menu item" });
  }
};

// CREATE NEW MENU ITEM
exports.create = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : null;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ success: false, msg: "Name and price are required" });
    }

    if (!image) {
      return res.status(400).json({ success: false, msg: "Image is required" });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, msg: "Price must be a positive number" });
    }

    const data = await Menu.create({
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim() || "",
      image
    });

    res.status(201).json({ success: true, msg: "Menu item created successfully", data });
  } catch (err) {
    console.error("Error creating menu:", err);
    res.status(500).json({ success: false, msg: "Failed to create menu item" });
  }
};

// UPDATE MENU ITEM
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    // Check if menu exists
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ success: false, msg: "Menu item not found" });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (price) {
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ success: false, msg: "Price must be a positive number" });
      }
      updateData.price = parseFloat(price);
    }
    if (description !== undefined) updateData.description = description.trim();
    if (req.file) updateData.image = "/uploads/" + req.file.filename;

    const data = await Menu.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, msg: "Menu item updated successfully", data });
  } catch (err) {
    console.error("Error updating menu:", err);
    res.status(500).json({ success: false, msg: "Failed to update menu item" });
  }
};

// DELETE MENU ITEM
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if menu exists
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ success: false, msg: "Menu item not found" });
    }

    await Menu.findByIdAndDelete(id);
    res.status(200).json({ success: true, msg: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Error deleting menu:", err);
    res.status(500).json({ success: false, msg: "Failed to delete menu item" });
  }
};