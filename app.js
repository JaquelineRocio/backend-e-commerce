import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import productRoutes from "./src/routes/productRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
const api = process.env.API_URL || "/api/v1";
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// Routes
app.use(`${api}/products`, productRoutes);

// Database connection
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
