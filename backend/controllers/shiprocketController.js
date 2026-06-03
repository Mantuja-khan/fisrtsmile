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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by collection_id if provided
    if (req.query.collection_id) {
      const categories = await Category.find();
      const targetCategory = categories.find(
        (c) => parseInt(c._id.toString().slice(-12), 16).toString() === req.query.collection_id
      );

      if (targetCategory) {
        query.category = targetCategory._id;
      } else {
        return res.json({ data: { total: 0, products: [] } });
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category")
      .skip(skip)
      .limit(limit);

    // Helper to generate a unique long ID from MongoDB ObjectId
    const getNumericId = (idStr, isVariant = false) => {
      const num = parseInt(idStr.slice(-12), 16);
      return isVariant ? num + 1000000000000000 : num;
    };

    const result = products.map((product) => {
      const productId = getNumericId(product._id.toString());
      const variantId = getNumericId(product._id.toString(), true);
      const createdAt = product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString();
      const updatedAt = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();

      return {
        id: productId,
        title: product.name,
        body_html: product.description || "",
        vendor: product.brand || "Default Vendor",
        product_type: product.category?.name || "General",
        created_at: createdAt,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        updated_at: updatedAt,
        tags: product.category?.name || "",
        status: "active",
        variants: [
          {
            id: variantId,
            title: product.name,
            price: product.price ? product.price.toString() : "0.00",
            compare_at_price: product.mrp ? product.mrp.toString() : product.price?.toString() || "0.00",
            sku: product._id.toString(),
            created_at: createdAt,
            updated_at: updatedAt,
            taxable: true,
            quantity: product.in_stock ? 100 : 0,
            grams: (product.weight || 0.5) * 1000,
            image: {
              src: product.image || ""
            },
            option_values: {
              "Default": "Default"
            },
            weight: product.weight || 0.5,
            weight_unit: "kg"
          }
        ],
        options: [
          {
            name: "Default",
            values: ["Default"]
          }
        ],
        image: {
          src: product.image || ""
        }
      };
    });

    res.json({
      data: {
        total,
        products: result
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all collections for Shiprocket
// @route   GET /api/shiprocket/collections
// @access  Public
export const getShiprocketCollections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await Category.countDocuments();
    const categories = await Category.find()
      .skip(skip)
      .limit(limit);

    // Helper to generate a unique long ID from MongoDB ObjectId
    const getNumericId = (idStr) => parseInt(idStr.slice(-12), 16);

    const result = categories.map((category) => {
      const createdAt = category.createdAt ? new Date(category.createdAt).toISOString() : new Date().toISOString();
      const updatedAt = category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString();

      return {
        id: getNumericId(category._id.toString()),
        updated_at: updatedAt,
        body_html: "",
        handle: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        image: category.image ? { src: category.image } : null,
        title: category.name,
        created_at: createdAt
      };
    });

    res.json({
      data: {
        total,
        collections: result
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by collection ID
// @route   GET /api/shiprocket/collection-products/:id
// @access  Public
export const getShiprocketCollectionProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.params.id) {
      // Find category by numeric ID if needed, or assume it's a mongo ID.
      // Shiprocket sends numeric IDs for collections.
      const categories = await Category.find();
      const targetCategory = categories.find(
        (c) => parseInt(c._id.toString().slice(-12), 16).toString() === req.params.id || c._id.toString() === req.params.id
      );

      if (targetCategory) {
        query.category = targetCategory._id;
      } else {
        return res.json({ data: { total: 0, products: [] } });
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category")
      .skip(skip)
      .limit(limit);

    const getNumericId = (idStr, isVariant = false) => {
      const num = parseInt(idStr.slice(-12), 16);
      return isVariant ? num + 1000000000000000 : num;
    };

    const result = products.map((product) => {
      const productId = getNumericId(product._id.toString());
      const variantId = getNumericId(product._id.toString(), true);
      const createdAt = product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString();
      const updatedAt = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
      return {
        id: productId,
        title: product.name,
        body_html: product.description || "",
        vendor: product.brand || "Default Vendor",
        product_type: product.category?.name || "General",
        created_at: createdAt,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        updated_at: updatedAt,
        tags: product.category?.name || "",
        status: "active",
        variants: [
          {
            id: variantId,
            title: product.name,
            price: product.price ? product.price.toString() : "0.00",
            compare_at_price: product.mrp ? product.mrp.toString() : product.price?.toString() || "0.00",
            sku: product._id.toString(),
            created_at: createdAt,
            updated_at: updatedAt,
            taxable: true,
            quantity: product.in_stock ? 100 : 0,
            grams: (product.weight || 0.5) * 1000,
            image: {
              src: product.image || ""
            },
            option_values: {
              "Default": "Default"
            },
            weight: product.weight || 0.5,
            weight_unit: "kg"
          }
        ],
        options: [
          {
            name: "Default",
            values: ["Default"]
          }
        ],
        image: {
          src: product.image || ""
        }
      };
    });

    res.json({
      data: {
        total,
        products: result
      }
    });
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