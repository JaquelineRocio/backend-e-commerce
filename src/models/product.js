import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  countInStock: { type: Number, required: true, min: 0 },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
