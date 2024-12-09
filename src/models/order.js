import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    orderItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    shippingAddress1: {
      type: String,
      required: [true, "Shipping address is required"],
    },
    shippingAddress2: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    zip: {
      type: String,
      required: [true, "ZIP code is required"],
      match: [/^\d{5}$/, "Invalid ZIP code format"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"], // E.164 format
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalPrice: {
      type: Number,
      min: [0, "Total price cannot be negative"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateOrdered: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const Order = mongoose.model("Order", orderSchema);

export { Order };
