import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';

// Helper function to deterministically convert any string ID to a safe 32-bit positive integer
const convertToNumericId = (idStr, suffix = "") => {
  if (!idStr) return 0;
  const cleanStr = idStr.toString();
  // If it's already a valid number/numeric string, parse it directly
  if (/^\d+$/.test(cleanStr)) {
    return Number(cleanStr);
  }
  let hash = 0;
  const strToHash = cleanStr + suffix;
  for (let i = 0; i < strToHash.length; i++) {
    const char = strToHash.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper function to format a product to match the required user/Shopify format
const formatProduct = (product) => {
  const numericId = convertToNumericId(product._id);
  const variantId = convertToNumericId(product.shiprocketVariantId || product._id, "-variant");

  return {
    id: numericId,
    title: product.name,
    body_html: `<p>${product.description || ""}</p>`,
    vendor: product.brand || "Default Vendor",
    product_type: product.category ? (product.category.name || product.category.toString()) : "",
    created_at: product.createdAt,
    handle: product.name
      ? product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      : product._id.toString(),
    updated_at: product.updatedAt,
    tags: product.badge || "",
    status: product.in_stock ? "active" : "draft",
    variants: [
      {
        id: variantId,
        title: product.badge || "Default",
        price: product.price ? product.price.toFixed(2) : "0.00",
        compare_at_price: product.mrp ? product.mrp.toFixed(2) : null,
        sku: product._id.toString(),
        quantity: product.in_stock ? 100 : 0,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        taxable: true,
        option_values: {
          Color: product.badge || "Default",
          Size: "Default"
        },
        grams: Math.round((product.weight || 0.5) * 1000),
        image: {
          src: product.image || ""
        },
        weight: Number(((product.weight || 0.5) * 2.20462).toFixed(2)),
        weight_unit: "lb"
      }
    ],
    image: {
      src: product.image || ""
    },
    images: (product.images || []).map(img => (typeof img === 'object' ? img : { src: img })),
    options: [
      {
        name: "Color",
        values: [product.badge || "Default"]
      },
      {
        name: "Size",
        values: ["Default"]
      }
    ],

    // Admin Compatibility Fields
    _id: numericId,
    name: product.name,
    description: product.description || "",
    price: product.price,
    mrp: product.mrp,
    category: product.category,
    brand: product.brand || "",
    badge: product.badge || "",
    age_range: product.age_range || "",
    in_stock: product.in_stock,
    show_in_hero: product.show_in_hero,
    is_sale: product.is_sale,
    offer_pct: product.offer_pct,
    offer_starts_at: product.offer_starts_at,
    offer_expires_at: product.offer_expires_at,
    weight: product.weight,
    length: product.length,
    breadth: product.breadth,
    height: product.height,
    shiprocketVariantId: product.shiprocketVariantId || ""
  };
};

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
        (c) => convertToNumericId(c._id).toString() === req.query.collection_id
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

    const result = products.map((product) => formatProduct(product));

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

    const result = categories.map((category) => {
      const createdAt = category.createdAt ? new Date(category.createdAt).toISOString() : new Date().toISOString();
      const updatedAt = category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString();

      return {
        id: convertToNumericId(category._id),
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
        (c) => convertToNumericId(c._id).toString() === req.params.id || c._id.toString() === req.params.id
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

    const result = products.map((product) => formatProduct(product));

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
    console.log("========== SHIPROCKET CHECKOUT DEBUG START ==========");
    console.log("RECEIVED REQ.BODY:", JSON.stringify(req.body, null, 2));

    const cartData = req.body.cartData || req.body.cart_data;
    const redirectUrl = req.body.redirectUrl || req.body.redirect_url;

    const payload = {
      cart_data: cartData,
      cartData: cartData,
      redirect_url: redirectUrl,
      redirectUrl: redirectUrl,
      timestamp: req.body.timestamp || new Date().toISOString(),
    };

    // Convert variant_id from string to number or hash MongoDB ID
    if (payload.cart_data?.items?.length) {
      payload.cart_data.items = payload.cart_data.items.map((item) => ({
        ...item,
        variant_id: convertToNumericId(item.variant_id, "-variant"),
      }));
    }
    if (payload.cartData?.items?.length) {
      payload.cartData.items = payload.cartData.items.map((item) => ({
        ...item,
        variant_id: convertToNumericId(item.variant_id, "-variant"),
      }));
    }

    console.log(
      "AFTER VARIANT CONVERSION:",
      JSON.stringify(payload.cart_data?.items || payload.cartData?.items, null, 2)
    );

    if (!cartData || !redirectUrl) {
      console.error("Validation error: cartData or redirectUrl is missing in req.body");
      return res.status(400).json({
        message: "cartData and redirectUrl are required at the root level of the request body.",
      });
    }

    const { apiKey, secretKey } = getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      console.error("Credentials error: Shiprocket credentials missing in .env");
      return res.status(500).json({
        message: "Shiprocket credentials missing in .env",
      });
    }


    // Stringify once so the HMAC hash and the Axios request body are guaranteed to be identical strings
    const rawBody = JSON.stringify(payload);

    console.log("PAYLOAD TYPE:", typeof payload);
    console.log("PAYLOAD OBJECT:", payload);
    console.log("RAW BODY:", rawBody);
    console.log("RAW BODY LENGTH:", rawBody.length);

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("base64");

    console.log("OUTGOING REQUEST DETAILS:");
    console.log("URL: https://checkout-api.shiprocket.com/api/v1/access-token/checkout");

    console.log("X-Api-Key:", apiKey);
    console.log("X-Api-HMAC-SHA256:", hmac);
    console.log("RAW BODY SENT:", rawBody);

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
      rawBody,
      {
        headers: {
          "X-Api-Key": apiKey,
          "X-Api-HMAC-SHA256": hmac,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SHIPROCKET SUCCESS RESPONSE STATUS:", response.status);
    console.log("SHIPROCKET SUCCESS RESPONSE DATA:", JSON.stringify(response.data, null, 2));
    console.log("========== SHIPROCKET CHECKOUT DEBUG END ==========");

    res.json(response.data);
  } catch (err) {
    console.error("STATUS:", err.response?.status);
    console.error("HEADERS:", err.response?.headers);
    console.error(
      "ERROR DATA:",
      JSON.stringify(err.response?.data, null, 2)
    );

    return res.status(500).json(err.response?.data);
  }
};

// ====================================================
// REFUND INITIATE API
// POST /api/shiprocket/refund-initiate
// Proxies: POST https://checkout-api.shiprocket.com/api/v1/external/refund/initiate
// ====================================================
export const refundInitiate = async (req, res) => {
  try {
    const { apiKey, secretKey } = getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      return res.status(500).json({ message: "Shiprocket credentials missing in .env" });
    }

    const payload = req.body;
    const rawBody = JSON.stringify(payload);

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("base64");

    console.log("========== SHIPROCKET REFUND INITIATE START ==========");
    console.log("PAYLOAD:", rawBody);

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/external/refund/initiate",
      rawBody,
      {
        headers: {
          "X-Api-Key": apiKey,
          "X-Api-HMAC-SHA256": hmac,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SHIPROCKET REFUND RESPONSE:", JSON.stringify(response.data, null, 2));
    console.log("========== SHIPROCKET REFUND INITIATE END ==========");

    res.json(response.data);
  } catch (err) {
    console.error("Shiprocket refund-initiate error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Refund initiation failed" }
    );
  }
};

// ====================================================
// ORDER DETAILS API
// POST /api/shiprocket/order-details
// Proxies: POST https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details
// ====================================================
export const getOrderDetails = async (req, res) => {
  try {
    const { apiKey, secretKey } = getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      return res.status(500).json({ message: "Shiprocket credentials missing in .env" });
    }

    const payload = req.body;
    const rawBody = JSON.stringify(payload);

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("base64");

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details",
      rawBody,
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
    console.error("Shiprocket order-details error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Order details fetch failed" }
    );
  }
};

// ====================================================
// ORDER LIST API
// POST /api/shiprocket/order-list
// Proxies: POST https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details/list
// ====================================================
export const getOrderList = async (req, res) => {
  try {
    const { apiKey, secretKey } = getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      return res.status(500).json({ message: "Shiprocket credentials missing in .env" });
    }

    const payload = req.body;
    const rawBody = JSON.stringify(payload);

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("base64");

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details/list",
      rawBody,
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
    console.error("Shiprocket order-list error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Order list fetch failed" }
    );
  }
};

// ====================================================
// REFUND REPORT API
// POST /api/shiprocket/refund-report
// Proxies: POST https://checkout-api.shiprocket.com/api/v1/external/refund/reports
// ====================================================
export const refundReport = async (req, res) => {
  try {
    const { apiKey, secretKey } = getShiprocketCredentials();

    if (!apiKey || !secretKey) {
      return res.status(500).json({ message: "Shiprocket credentials missing in .env" });
    }

    const payload = req.body;
    const rawBody = JSON.stringify(payload);

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("base64");

    const response = await axios.post(
      "https://checkout-api.shiprocket.com/api/v1/external/refund/reports",
      rawBody,
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
    console.error("Shiprocket refund-report error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Refund report fetch failed" }
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
    console.log("========== SHIPROCKET ORDER WEBHOOK START ==========");
    console.log("PAYLOAD RECEIVED:", JSON.stringify(order, null, 2));

    const phone = order.customer_phone || (order.shipping_address && order.shipping_address.phone) || order.phone;
    const email = order.customer_email || order.email;
    const name = order.customer_name || (order.shipping_address && order.shipping_address.fullName) || order.name;

    let user = null;

    if (phone) {
      let formattedPhone = String(phone).trim();
      if (formattedPhone.startsWith("+91")) {
        formattedPhone = formattedPhone.slice(3);
      } else if (formattedPhone.startsWith("91") && formattedPhone.length === 12) {
        formattedPhone = formattedPhone.slice(2);
      }

      user = await User.findOne({ phone: formattedPhone });

      if (!user && email) {
        user = await User.findOne({ email: email.toLowerCase().trim() });
      }

      if (!user) {
        console.log(`User not found for phone ${formattedPhone}. Creating a new user automatically.`);
        const secureRandomPassword = crypto.randomBytes(16).toString("hex");
        let finalEmail = email ? email.toLowerCase().trim() : `${formattedPhone}@toyhaat.fastrr.com`;

        // Ensure email uniqueness
        const emailExists = await User.findOne({ email: finalEmail });
        if (emailExists) {
          finalEmail = `${formattedPhone}-${Date.now()}@toyhaat.fastrr.com`;
        }

        user = await User.create({
          full_name: name || "Customer",
          email: finalEmail,
          phone: formattedPhone,
          password: secureRandomPassword,
          address: order.shipping_address?.address || "",
          city: order.shipping_address?.city || "",
          state: order.shipping_address?.state || "",
          pincode: order.shipping_address?.pincode || "",
        });
      }
    } else if (email) {
      const finalEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: finalEmail });

      if (!user) {
        console.log(`User not found for email ${finalEmail}. Creating a new user automatically.`);
        const secureRandomPassword = crypto.randomBytes(16).toString("hex");
        user = await User.create({
          full_name: name || "Customer",
          email: finalEmail,
          password: secureRandomPassword,
          address: order.shipping_address?.address || "",
          city: order.shipping_address?.city || "",
          state: order.shipping_address?.state || "",
          pincode: order.shipping_address?.pincode || "",
        });
      }
    }

    if (user) {
      console.log(`Associating order with user ID: ${user._id}`);
      order.user = user._id;
    }

    const createdOrder = await Order.create(order);
    console.log("Created order successfully in database:", createdOrder._id);
    console.log("========== SHIPROCKET ORDER WEBHOOK END ==========");

    res.sendStatus(200);
  } catch (error) {
    console.error("Order webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
};