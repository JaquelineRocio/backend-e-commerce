import Category from "../models/category.js";
import express, { Router } from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();
    if (!categoryList) {
      return res.status(500).json({ success: false });
    }
    return res.status(200).send(categoryList);
  } catch (error) {
    return res.status(400).json({ success: false, error });
  }
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();

  if (!category) return res.status(400).send("The category cannot be created!");
  res.send(category);
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "The category is deleted!" });
  } catch (error) {
    return res.status(400).json({ success: false, error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    return res.status(200).send(category);
  } catch (error) {
    return res.status(400).send({ success: false, error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, icon: req.body.icon, color: req.body.color },
      { new: true }
    );
    if (!updatedCategory) {
      return res
        .status(500)
        .send({ success: false, message: "the category cannot be updated!" });
    }
    res.status(200).send(updatedCategory);
  } catch (error) {
    return res.status(400).send({ success: false, error });
  }
});
export default router;
