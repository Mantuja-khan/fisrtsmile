import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";

import path from "path";

// Load env vars

dotenv.config();

// Connect DB
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "https://trivoxotoys.com", "https://www.trivoxotoys.com"],
    credentials: true,
  })
);
// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

import collectionRoutes from "./routes/collectionRoutes.js";
import shiprocketRoutes from "./routes/shiprocketRoutes.js";

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/shiprocket", shiprocketRoutes);

import { fileURLToPath } from "url";

// Derive current __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global 404 handler (always returns JSON)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.method} ${req.originalUrl}`
  });
});

// Global 500 error handler (always returns JSON)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});

// Port
const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
