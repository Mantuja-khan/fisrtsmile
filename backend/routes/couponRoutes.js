import express from "express";
const router = express.Router();
import {
  getCoupons,
  adminGetCoupons,
  createCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/").get(getCoupons).post(protect, admin, createCoupon);
router.route("/admin").get(protect, admin, adminGetCoupons);
router.route("/:id").delete(protect, admin, deleteCoupon);

export default router;
