import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, updateOrderStatus, getOrders, getMyOrders, createRazorpayOrder, verifyPayment, getOrderByNumber, cancelOrder, trackShipment, initPayUPayment, handlePayUResponse, returnOrder, exchangeOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track/:orderNumber').get(getOrderByNumber);

// PayU public webhook hook MUST come before parameterized :id to capture exact path
router.route('/payu/response').post(handlePayUResponse);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/track-shipment').get(protect, trackShipment);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/return').put(protect, returnOrder);
router.route('/:id/exchange').put(protect, exchangeOrder);
router.route('/:id/razorpay').post(protect, createRazorpayOrder);
router.route('/:id/payu').post(protect, initPayUPayment);
router.route('/:id/pay').put(protect, verifyPayment);

export default router;
