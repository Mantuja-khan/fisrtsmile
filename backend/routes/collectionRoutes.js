import express from "express";
const router = express.Router();
import { getCategories } from "../controllers/categoryController.js";
import { getProductsByCollection } from "../controllers/productController.js";

// @desc    Fetch all collections (categories)
// @route   GET /api/collections
// @access  Public
router.route("/").get(getCategories);

// @desc    Fetch products by collection slug
// @route   GET /api/collections/:slug/products
// @access  Public
router.route("/:slug/products").get(getProductsByCollection);

export default router;
