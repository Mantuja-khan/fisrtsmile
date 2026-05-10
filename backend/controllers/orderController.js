import Order from '../models/Order.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (or Private)
export const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        customer_name,
        customer_email,
        customer_phone,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order_number = 'ORD' + Date.now();
        const order = new Order({
            order_number,
            items: orderItems.map(i => ({
                product: i.product_id,
                name: i.name,
                quantity: i.qty,
                price: i.price,
                image: i.image,
            })),
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            subtotal: itemsPrice,
            shipping: shippingPrice,
            total: totalPrice,
            customer_name,
            customer_email,
            customer_phone,
            user: req.user ? req.user._id : null,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'full_name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        if (req.body.isPaid !== undefined) {
            order.isPaid = req.body.isPaid;
            if (req.body.isPaid && !order.paidAt) {
                order.paidAt = Date.now();
            }
        }
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const options = {
            amount: Math.round(order.total * 100), // amount in the smallest currency unit
            currency: 'INR',
            receipt: `receipt_${order.order_number}`,
        };

        try {
            const rzOrder = await razorpay.orders.create(options);
            res.json(rzOrder);
        } catch (error) {
            res.status(500).json({ message: 'Razorpay order creation failed', error });
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Verify Razorpay Payment
// @route   PUT /api/orders/:id/pay
// @access  Private
export const verifyPayment = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.payment_id = razorpay_payment_id;
            order.status = 'Processing';
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(400).json({ message: 'Payment verification failed' });
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};
// @desc    Get order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const getOrderByNumber = async (req, res) => {
    const order = await Order.findOne({ order_number: req.params.orderNumber });
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Cancel order by user
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        if (order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        order.status = 'Cancelled';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};
