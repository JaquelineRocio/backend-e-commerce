import express from "express";
import Product from "../models/product.js";
import Category from "../models/category.js";
import mongoose from "mongoose";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleErrorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};

router.get("/", async (req, res) => {
  try {
    let filter = {};

    if (req.query.categories) {
      const categoryIds = req.query.categories.split(",");

      const areValidIds = categoryIds.every((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      if (!areValidIds) {
        return res.status(400).json({
          success: false,
          message: "Invalid category IDs provided.",
        });
      }

      filter = { category: { $in: categoryIds } };
    }

    const productList = await Product.find(filter).populate("category");

    if (!productList.length) {
      return res.status(404).json({
        success: false,
        message: "No products found.",
      });
    }

    res.status(200).json(productList);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to fetch products");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return handleErrorResponse(res, 400, "Invalid Product ID");
  }

  try {
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return handleErrorResponse(res, 404, "Product not found");
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to fetch product");
  }
});

router.post("/", async (req, res) => {
  const { category, ...productData } = req.body;

  if (!isValidObjectId(category)) {
    return handleErrorResponse(res, 400, "Invalid Category ID");
  }

  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return handleErrorResponse(res, 400, "Invalid Category");
    }

    const product = new Product({ category, ...productData });
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to create product");
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { category, ...productData } = req.body;

  if (!isValidObjectId(id)) {
    return handleErrorResponse(res, 400, "Invalid Product ID");
  }

  if (category && !isValidObjectId(category)) {
    return handleErrorResponse(res, 400, "Invalid Category ID");
  }

  try {
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return handleErrorResponse(res, 400, "Invalid Category");
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { category, ...productData },
      { new: true }
    ).populate("category");

    if (!updatedProduct) {
      return handleErrorResponse(res, 404, "Product not found");
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to update product");
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return handleErrorResponse(res, 400, "Invalid Product ID");
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return handleErrorResponse(res, 404, "Product not found");
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to delete product");
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json({ productCount });
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to fetch product count");
  }
});

router.get("/get/featured", async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true });
    if (!featuredProducts.length) {
      return handleErrorResponse(res, 404, "No featured products found");
    }

    res.json(featuredProducts);
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, 500, "Failed to fetch featured products");
  }
});

router.get("/get/featured/:count", async (req, res) => {
  const count = parseInt(req.params.count, 10);

  if (isNaN(count) || count <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid count parameter. It must be a positive number.",
    });
  }

  try {
    const featuredProducts = await Product.find({ isFeatured: true }).limit(
      count
    );

    if (!featuredProducts.length) {
      return res.status(404).json({
        success: false,
        message: "No featured products found",
      });
    }

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    });
  }
});

export default router;
