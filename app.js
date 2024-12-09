import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import productRoutes from "./src/routes/products.js";
import cors from "cors";
import categories from "./src/routes/categories.js";
import users from "./src/routes/users.js";
import authJwt from "./src/helpers/jwt.js";
import errorHandler from "./src/helpers/errorHandler.js";
import orders from "./src/routes/orders.js";

dotenv.config();

const app = express();
const api = process.env.API_URL || "/api/v1";
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);

// Routes
app.use(`${api}/products`, productRoutes);
app.use(`${api}/categories`, categories);
app.use(`${api}/users`, users);
app.use(`${api}/orders`, orders);

// Database connection
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
