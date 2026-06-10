import express from "express";
import {
  getShiprocketProducts,
  getShiprocketCollections,
  getShiprocketCollectionProducts,
  checkoutToken,
  orderWebhook,
  loginToken,
  customerData,
  getOrderDetails,
  getOrderList,
  refundInitiate,
  refundReport,
} from "../controllers/shiprocketController.js";




const router = express.Router();

router.get("/products", getShiprocketProducts);
router.get("/collections", getShiprocketCollections);
router.get(
  "/collection-products",
  getShiprocketCollectionProducts
);
router.get(
  "/collection-products/:id",
  getShiprocketCollectionProducts
);

router.post("/login-token", loginToken);
router.post("/customer-data", customerData);

router.post("/checkout-token", checkoutToken);
router.post("/order-webhook", orderWebhook);
router.post("/order-details", getOrderDetails);
router.post("/order-list", getOrderList);
router.post("/refund-initiate", refundInitiate);
router.post("/refund-report", refundReport);

export default router;