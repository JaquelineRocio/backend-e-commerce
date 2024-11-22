import express from "express";
import Product from "../models/product.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Products API!");
});

router.post("/", async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      image: req.body.image,
      countInStock: req.body.countInStock,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});

export default router;
