import express from "express";
import { Order } from "../models/order.js";
import { OrderItem } from "../models/order-item.js";

const router = express.Router();

const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res
    .status(statusCode)
    .json({ success: false, error: error.message || error });
};

router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });

    if (!orderList)
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });

    res.status(200).send(orderList);
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).send(order);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (item) => {
        const newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: item.product,
        });

        const savedOrderItem = await newOrderItem.save();
        return savedOrderItem._id;
      })
    );

    const totalPrice = await Promise.all(
      orderItemsIds.map(async (id) => {
        const orderItem = await OrderItem.findById(id).populate(
          "product",
          "price"
        );
        return orderItem.product.price * orderItem.quantity;
      })
    ).then((prices) => prices.reduce((sum, price) => sum + price, 0));

    const order = new Order({
      ...req.body,
      orderItems: orderItemsIds,
      totalPrice,
    });

    const savedOrder = await order.save();

    res.status(201).send(savedOrder);
  } catch (error) {
    handleError(res, error, 400);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).send(updatedOrder);
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    await Promise.all(
      order.orderItems.map((itemId) => OrderItem.findByIdAndRemove(itemId))
    );
    await Order.findByIdAndRemove(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales.length)
      return res
        .status(404)
        .json({ success: false, message: "No sales data found" });

    res.status(200).send({ totalsales: totalSales[0].totalsales });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    res.status(200).send({ orderCount });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/get/userorders/:userid", async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!userOrders)
      return res
        .status(404)
        .json({ success: false, message: "No orders found for user" });

    res.status(200).send(userOrders);
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
