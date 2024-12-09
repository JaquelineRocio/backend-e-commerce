import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export { OrderItem };
