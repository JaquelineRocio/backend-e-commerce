import express from "express";
import Product from "../models/product.js";
import Category from "../models/category.js";
import mongoose from "mongoose";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    await product.save();
    res.status(201).send(product);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const productList = await Product.find().populate("category");
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    res.send(productList);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid product ID");
  }

  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send(product);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid product ID");
  }

  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    ).populate("category");

    if (!product) return res.status(404).send("The product cannot be updated!");
    res.send(product);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }
});

export default router;
