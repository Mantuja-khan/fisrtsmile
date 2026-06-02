import express from "express";
import {
  getShiprocketProducts,
  getShiprocketCollections,
  getShiprocketCollectionProducts,
  checkoutToken,
  orderWebhook,
  loginToken,
  customerData,
} from "../controllers/shiprocketController.js";

const router = express.Router();

router.get("/products", getShiprocketProducts);
router.get("/collections", getShiprocketCollections);
router.get(
  "/collection-products/:id",
  getShiprocketCollectionProducts
);

router.post("/login-token", loginToken);
router.post("/customer-data", customerData);

router.post("/checkout-token", checkoutToken);
router.post("/order-webhook", orderWebhook);

export default router;