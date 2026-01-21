// backend/controllers/menuController.js
const Menu = require("../models/Menu");

exports.getAll = async (req, res) => {
  const data = await Menu.find();
  res.json(data);
};

exports.create = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file ? "/uploads/" + req.file.filename : null;

    if (!name || !price || !image) {
      return res.status(400).json({ success:false, msg:"Data kurang" });
    }

    const data = await Menu.create({
      name,
      price,
      description,
      image
    });

    res.json({ success:true, data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success:false });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const updateData = { name, price, description };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    const data = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new:true }
    );

    res.json({ success:true, data });
  } catch (err) {
    res.status(500).json({ success:false });
  }
};

exports.remove = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ success:true });
  } catch (err) {
    res.status(500).json({ success:false });
  }
};