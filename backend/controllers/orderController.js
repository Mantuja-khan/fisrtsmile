import Order from "../models/Order.js";
import dotenv from "dotenv";
import { trackShipmentByAWB, createShiprocketOrder } from "../services/shiprocketService.js";
import { generatePayUHash, verifyPayUResponseHash } from "../services/payuService.js";
dotenv.config();

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
    res.status(400).json({ message: "No order items" });
    return;
  } else {
    const order_number = "ORD" + Date.now();
    const order = new Order({
      order_number,
      items: orderItems.map((i) => ({
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
      cod_charge: paymentMethod === "cod" ? 60 : 0,
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
  const order = await Order.findById(req.params.id).populate("user", "full_name email");

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
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

    // Include dynamic shipment/tracking attribution if sent
    if (req.body.awb_code !== undefined) order.awb_code = req.body.awb_code;
    if (req.body.shipment_id !== undefined) order.shipment_id = req.body.shipment_id;
    if (req.body.tracking_url !== undefined) order.tracking_url = req.body.tracking_url;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
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
  let query = { user: req.user._id };
  if (req.user.phone) {
    const cleanPhone = req.user.phone.replace(/\D/g, ""); // Keep only digits
    const phoneVariants = [req.user.phone, cleanPhone];
    if (cleanPhone.length === 10) {
      phoneVariants.push(`+91${cleanPhone}`);
      phoneVariants.push(`91${cleanPhone}`);
      phoneVariants.push(`0${cleanPhone}`);
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      const tenDigit = cleanPhone.substring(2);
      phoneVariants.push(tenDigit);
      phoneVariants.push(`+${cleanPhone}`);
    }
    const uniqueVariants = [...new Set(phoneVariants)];
    query = {
      $or: [
        { user: req.user._id },
        { customer_phone: { $in: uniqueVariants } },
        { "shipping_address.phone": { $in: uniqueVariants } }
      ]
    };
  }
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const getOrderByNumber = async (req, res) => {
  const order = await Order.findOne({ order_number: req.params.orderNumber });
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Cancel order by user
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    if (
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    order.status = "Cancelled";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Request Return order by user
// @route   PUT /api/orders/:id/return
// @access  Private
export const returnOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    if (
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    // Only allow return request if delivered
    if (order.status.toLowerCase() !== "delivered") {
      res.status(400).json({ message: "Only delivered orders can be returned" });
      return;
    }
    order.status = "Return Requested";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Track order live shipment via Shiprocket AWB
// @route   GET /api/orders/:id/track-shipment
// @access  Private
export const trackShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const awb = order.awb_code;
    if (!awb) {
      return res.status(400).json({ message: "Tracking not active for this order yet" });
    }

    const trackingData = await trackShipmentByAWB(awb);
    res.json(trackingData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve tracking data from Shiprocket", error: error.message });
  }
};

// @desc    Initialize PayU payment
// @route   POST /api/orders/:id/payu
export const initPayUPayment = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "test_key";
  const PAYU_SALT = process.env.PAYU_SALT || "test_salt";

  const txnParams = {
    key: PAYU_MERCHANT_KEY,
    salt: PAYU_SALT,
    txnid: order._id.toString(),
    amount: order.total.toFixed(2),
    productinfo: "Toys Collection Purchase",
    firstname: order.customer_name ? order.customer_name.split(" ")[0] : "Customer",
    email: order.customer_email || req.user?.email || "no-email@dummy.com",
    udf1: order.order_number,
  };

  const hash = generatePayUHash(txnParams);

  const apiBaseUrl = `${req.protocol}://${req.get("host")}/api`;

  res.json({
    hash,
    key: txnParams.key,
    txnid: txnParams.txnid,
    amount: txnParams.amount,
    productinfo: txnParams.productinfo,
    firstname: txnParams.firstname,
    email: txnParams.email,
    phone: order.shipping_address.phone || "",
    surl: `${apiBaseUrl}/orders/payu/response`,
    furl: `${apiBaseUrl}/orders/payu/response`,
    udf1: txnParams.udf1,
    action:
      process.env.PAYU_MODE === "PROD"
        ? "https://secure.payu.in/_payment"
        : "https://test.payu.in/_payment",
  });
};

// @desc    Handle PayU POST back response (SURL/FURL)
// @route   POST /api/orders/payu/response
export const handlePayUResponse = async (req, res) => {
  const PAYU_SALT = process.env.PAYU_SALT || "test_salt";
  const isValid = verifyPayUResponseHash(req.body, PAYU_SALT);
  const host = req.get("host") || "";
  const isLocal =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("172.");
  const frontendBase = isLocal
    ? "http://localhost:5173"
    : process.env.FRONTEND_URL || "https://trivoxotoys.com";

  if (!isValid) {
    console.error("🚫 PayU Hash Compromise Alert!");
    return res.redirect(`${frontendBase}/payment-failed?reason=hash_mismatch`);
  }

  const { txnid, status, mihpayid } = req.body;

  try {
    const order = await Order.findById(txnid);
    if (!order) {
      return res.redirect(`${frontendBase}/payment-failed?reason=order_missing`);
    }

    if (status === "success") {
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.payment_id = mihpayid;
        order.status = "Processing";
        const saved = await order.save();

        createShiprocketOrder(saved);
      }
      return res.redirect(`${frontendBase}/payment-success?id=${order.order_number}`);
    } else {
      return res.redirect(`${frontendBase}/payment-failed?id=${order.order_number}`);
    }
  } catch (err) {
    console.error("PayU Response Error:", err);
    return res.redirect(`${frontendBase}/payment-failed`);
  }
};
