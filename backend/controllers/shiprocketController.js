import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';
import mongoose from 'mongoose';

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

    const headers = {
      "X-Api-Key": apiKey,
      "X-Api-HMAC-SHA256": hmac,
      "Content-Type": "application/json",
    };

    let response;

    // Primary: new Fastrr API endpoint
    try {
      response = await axios.post(
        "https://fastrr-api-dev.pickrr.com/api/v1/access-token/login",
        payload,
        { headers }
      );
    } catch (primaryErr) {
      console.warn("Primary Fastrr endpoint failed, falling back to checkout-api.shiprocket.com:", primaryErr.message);
      // Fallback: legacy Shiprocket checkout API
      response = await axios.post(
        "https://checkout-api.shiprocket.com/api/v1/access-token/login",
        payload,
        { headers }
      );
    }

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

    const originalPhone = req.body.phone;
    if (!originalPhone) {
      const payload = req.body;
      const rawBody = JSON.stringify(payload);
      const hmac = crypto.createHmac("sha256", secretKey).update(rawBody).digest("base64");
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
      return res.json(response.data);
    }

    // Generate phone variants
    const cleanPhone = originalPhone.toString().replace(/\D/g, "");
    const phoneVariants = [originalPhone.toString(), cleanPhone];
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

    // Fetch for all variants in parallel
    const fetchPromises = uniqueVariants.map(async (phone) => {
      try {
        const payload = { ...req.body, phone };
        const rawBody = JSON.stringify(payload);
        const hmac = crypto.createHmac("sha256", secretKey).update(rawBody).digest("base64");
        const resp = await axios.post(
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
        return resp.data;
      } catch (err) {
        console.error(`Error querying Shiprocket for phone ${phone}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);

    // Merge results
    let mergedOrders = [];
    let isArrayResponse = false;
    let baseResponse = null;

    results.forEach((r) => {
      if (!r) return;
      if (!baseResponse) baseResponse = r;

      const orders = Array.isArray(r)
        ? r
        : r?.data?.orders || r?.orders || r?.data || [];

      if (Array.isArray(r)) {
        isArrayResponse = true;
      }

      orders.forEach((o) => {
        const id = o.channel_order_id || o.reference_number || o.order_id?.toString();
        if (id && !mergedOrders.some((existing) => {
          const exId = existing.channel_order_id || existing.reference_number || existing.order_id?.toString();
          return exId === id;
        })) {
          mergedOrders.push(o);
        }
      });
    });

    if (!baseResponse) {
      return res.json([]);
    }

    if (isArrayResponse) {
      return res.json(mergedOrders);
    } else {
      const responseToSend = { ...baseResponse };
      if (responseToSend.data && responseToSend.data.orders) {
        responseToSend.data = { ...responseToSend.data, orders: mergedOrders };
      } else if (responseToSend.orders) {
        responseToSend.orders = mergedOrders;
      } else if (responseToSend.data && Array.isArray(responseToSend.data)) {
        responseToSend.data = mergedOrders;
      } else {
        responseToSend.orders = mergedOrders;
      }
      return res.json(responseToSend);
    }
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
    const payload = req.body;
    console.log("========== SHIPROCKET ORDER WEBHOOK START ==========");
    console.log("PAYLOAD RECEIVED:", JSON.stringify(payload, null, 2));

    const phone = payload.customer_phone || payload.phone || 
                  (payload.customer && payload.customer.phone) || 
                  (payload.shipping_address && payload.shipping_address.phone);
    const email = payload.customer_email || payload.email || (payload.customer && payload.customer.email);
    const name = payload.customer_name || (payload.shipping_address && payload.shipping_address.fullName) || 
                 payload.name || (payload.customer && ((payload.customer.first_name || "") + " " + (payload.customer.last_name || "")).trim());

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
        let finalEmail = email ? email.toLowerCase().trim() : `${formattedPhone}@trivoxotoys.com`;

        // Ensure email uniqueness
        const emailExists = await User.findOne({ email: finalEmail });
        if (emailExists) {
          finalEmail = `${formattedPhone}-${Date.now()}@trivoxotoys.com`;
        }

        user = await User.create({
          full_name: name || "Customer",
          email: finalEmail,
          phone: formattedPhone,
          password: secureRandomPassword,
          address: (payload.shipping_address?.address1 || payload.shipping_address?.address || ""),
          city: payload.shipping_address?.city || "",
          state: payload.shipping_address?.province || payload.shipping_address?.state || "",
          pincode: payload.shipping_address?.zip || payload.shipping_address?.pincode || "",
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
          address: (payload.shipping_address?.address1 || payload.shipping_address?.address || ""),
          city: payload.shipping_address?.city || "",
          state: payload.shipping_address?.province || payload.shipping_address?.state || "",
          pincode: payload.shipping_address?.zip || payload.shipping_address?.pincode || "",
        });
      }
    }

    // Shopify-emulated payload mapping for Order schema compatibility
    let order_number = payload.order_number || payload.name || (payload.id && payload.id.toString());
    if (!order_number) {
      order_number = "ORD" + Date.now();
    }

    let customer_name = name || "Customer";
    let customer_email = email || "no-email@dummy.com";

    // Shipping address mapping
    let shipping_address = {
      address: payload.shipping_address?.address || "",
      city: payload.shipping_address?.city || "",
      state: payload.shipping_address?.state || "",
      pincode: payload.shipping_address?.pincode || "",
    };
    if (payload.shipping_address && (payload.shipping_address.address1 || payload.shipping_address.address2)) {
      shipping_address = {
        address: [payload.shipping_address.address1, payload.shipping_address.address2].filter(Boolean).join(", "),
        city: payload.shipping_address.city || "",
        state: payload.shipping_address.province || payload.shipping_address.state || "",
        pincode: payload.shipping_address.zip || payload.shipping_address.pincode || "",
      };
    }

    // Items mapping
    let items = [];
    const rawItems = payload.items || payload.line_items || [];
    for (const item of rawItems) {
      const sku = item.sku || item.product_id;
      let product_id = null;
      let itemImage = item.image || (item.image && item.image.src) || "";

      if (sku && mongoose.Types.ObjectId.isValid(sku)) {
        product_id = sku;
      } else {
        const foundProd = await Product.findOne({
          $or: [
            { name: item.name || item.title },
            { shiprocketVariantId: sku }
          ]
        });
        if (foundProd) {
          product_id = foundProd._id;
          if (!itemImage && foundProd.image) {
            itemImage = foundProd.image;
          }
        }
      }

      items.push({
        product: product_id,
        name: item.name || item.title || "",
        quantity: item.quantity || item.qty || 1,
        price: Number(item.price) || 0,
        image: itemImage,
      });
    }

    const subtotal = Number(payload.subtotal || payload.subtotal_price || payload.total_line_items_price || 0);
    const shipping = Number(payload.shipping || payload.total_shipping_price_set?.shop_money?.amount || 0);
    const cod_charge = Number(payload.cod_charge || 0);
    const discount = Number(payload.discount || payload.total_discounts || 0);
    const total = Number(payload.total || payload.total_price || 0);
    const payment_method = payload.payment_method || payload.gateway || (payload.payment_gateway_names && payload.payment_gateway_names[0]) || "prepaid";
    
    let rawStatus = payload.status || "Placed";
    // Normalize status into capitalization required by enum: [Placed, Processing, Shipped, Delivered, Cancelled, Return Requested, Returned]
    const validStatuses = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled", "Return Requested", "Returned"];
    let status = "Placed";
    const foundStatus = validStatuses.find(s => s.toLowerCase() === rawStatus.toLowerCase());
    if (foundStatus) {
      status = foundStatus;
    } else {
      // mapping standard keywords
      const lowerStatus = rawStatus.toLowerCase();
      if (lowerStatus.includes("deliver")) status = "Delivered";
      else if (lowerStatus.includes("ship") || lowerStatus.includes("transit") || lowerStatus.includes("dispatch")) status = "Shipped";
      else if (lowerStatus.includes("process") || lowerStatus.includes("confirm") || lowerStatus.includes("pack")) status = "Processing";
      else if (lowerStatus.includes("cancel")) status = "Cancelled";
      else if (lowerStatus.includes("return") && lowerStatus.includes("request")) status = "Return Requested";
      else if (lowerStatus.includes("return")) status = "Returned";
    }

    const mappedOrder = {
      order_number,
      customer_name,
      customer_email,
      customer_phone: phone,
      shipping_address,
      items,
      subtotal,
      shipping,
      cod_charge,
      discount,
      total,
      payment_method,
      status,
      isPaid: payload.isPaid || (payload.financial_status === "paid") || false,
      paidAt: payload.paidAt || (payload.financial_status === "paid" ? Date.now() : null),
      payment_id: payload.payment_id || payload.gateway || null,
      user: user ? user._id : null,
      shiprocket_order_id: payload.shiprocket_order_id || payload.order_id || payload.id || null,
      shipment_id: payload.shipment_id || null,
      awb_code: payload.awb_code || null,
      tracking_url: payload.tracking_url || null,
    };

    const createdOrder = await Order.create(mappedOrder);
    console.log("Created order successfully in database:", createdOrder._id);
    console.log("========== SHIPROCKET ORDER WEBHOOK END ==========");

    res.sendStatus(200);
  } catch (error) {
    console.error("Order webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
};