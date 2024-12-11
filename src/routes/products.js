import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import Product from "../models/product.js";
import Category from "../models/category.js";

const router = express.Router();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    const uploadError = isValid ? null : new Error("Invalid image type");
    cb(uploadError, "public/uploads");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const filter = req.query.categories
      ? { category: req.query.categories.split(",") }
      : {};
    const productList = await Product.find(filter).populate("category");
    res.status(200).send(productList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).send("Product not found");
    res.status(200).send(product);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const product = new Product({
      ...req.body,
      image: `${basePath}${fileName}`,
    });

    const savedProduct = await product.save();
    res.status(201).send(savedProduct);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Invalid Product Id");

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const file = req.file;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const imagePath = file ? `${basePath}${file.filename}` : product.image;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: imagePath },
      { new: true }
    );

    res.status(200).send(updatedProduct);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.status(200).send({ productCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get/featured/:count", async (req, res) => {
  try {
    const count = parseInt(req.params.count, 10) || 0;
    const products = await Product.find({ isFeatured: true }).limit(count);
    res.status(200).send(products);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send("Invalid Product Id");

      const files = req.files;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const imagesPaths = files.map((file) => `${basePath}${file.filename}`);

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { images: imagesPaths },
        { new: true }
      );

      res.status(200).send(updatedProduct);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
