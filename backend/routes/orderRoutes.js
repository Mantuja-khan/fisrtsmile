import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, updateOrderStatus, getOrders, getMyOrders, createRazorpayOrder, verifyPayment, getOrderByNumber, cancelOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track/:orderNumber').get(getOrderByNumber);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/razorpay').post(protect, createRazorpayOrder);
router.route('/:id/pay').put(protect, verifyPayment);

export default router;
