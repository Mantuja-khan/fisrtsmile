import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import axios from 'axios';
import crypto from 'crypto';

// @desc    Get all products for Shiprocket
// @route   GET /api/shiprocket/products
// @access  Public
export const getShiprocketProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");

    const result = products.map((product) => ({
      id: product._id,
      title: product.name,
      body_html: product.description || "",
      vendor: product.brand || "",
      product_type: product.category?.name || "",

      variants: [
        {
          id: product.shiprocketVariantId || product._id.toString(),
          title: product.name,
          price: product.price,
          quantity: product.in_stock ? 100 : 0,
          sku: product._id.toString(),
          weight: product.weight,
        },
      ],

      image: {
        src: product.image,
      },
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all collections for Shiprocket
// @route   GET /api/shiprocket/collections
// @access  Public
export const getShiprocketCollections = async (req, res) => {
  try {
    const collections = await Category.find({});
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by collection ID
// @route   GET /api/shiprocket/collection-products/:id
// @access  Public
export const getShiprocketCollectionProducts = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.id,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper Function
const getShiprocketCredentials = () => {
  const secretKey =
    process.env.SHIPROCKET_FASTARR_SECRET_KEY ||
    process.env.Secret_key ||
    process.env.SHIPROCKET_SECRET_KEY;

  const apiKey =
    process.env.SHIPROCKET_FASTARR_API_KEY ||
    process.env.API_key ||
    process.env.SHIPROCKET_API_KEY;

  return { apiKey, secretKey };
};

// ====================================================
// LOGIN TOKEN API
// POST /api/shiprocket/login-token
// ====================================================
export const loginToken = async (req, res) => {
  try {
    const { apiKey, secretKey } =
      getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      return res.status(500).json({
        message:
          "Shiprocket credentials missing in .env",
      });
    }

    const payload = {
      address: true,
      timestamp: new Date().toISOString(),
    };

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(JSON.stringify(payload))
      .digest("base64");

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/access-token/login",
      payload,
      {
        headers: {
          "X-Api-Key": apiKey,
          "X-Api-HMAC-SHA256": hmac,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Shiprocket login-token error:",
      err.response?.data || err.message
    );

    res.status(500).json(
      err.response?.data || {
        message: "Login token generation failed",
      }
    );
  }
};

// ====================================================
// CUSTOMER DATA API
// POST /api/shiprocket/customer-data
// ====================================================
export const customerData = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Customer token is required",
      });
    }

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/customer-data/",
      {
        token,
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Shiprocket customer-data error:",
      err.response?.data || err.message
    );

    res.status(500).json(
      err.response?.data || {
        message: "Customer data fetch failed",
      }
    );
  }
};

// ====================================================
// CHECKOUT TOKEN API
// POST /api/shiprocket/checkout-token
// ====================================================
export const checkoutToken = async (req, res) => {
  try {
    console.log(
      "CHECKOUT PAYLOAD:",
      JSON.stringify(req.body, null, 2)
    );

    const payload = req.body;

    const { apiKey, secretKey } =
      getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      return res.status(500).json({
        message:
          "Shiprocket credentials missing in .env",
      });
    }

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(JSON.stringify(payload))
      .digest("base64");

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
      payload,
      {
        headers: {
          "X-Api-Key": apiKey,
          "X-Api-HMAC-SHA256": hmac,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Shiprocket checkout-token error:",
      err.response?.data || err.message
    );

    res.status(500).json(
      err.response?.data || {
        message: "Checkout token generation failed",
      }
    );
  }
};

// ====================================================
// ORDER WEBHOOK
// POST /api/shiprocket/order-webhook
// ====================================================
export const orderWebhook = async (req, res) => {
  try {
    const order = req.body;

    await Order.create(order);

    res.sendStatus(200);
  } catch (error) {
    console.error(
      "Order webhook error:",
      error
    );

    res.status(500).send(
      "Internal Server Error"
    );
  }
};