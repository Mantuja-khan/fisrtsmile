import Product from "../models/Product.js";
import Review from "../models/Review.js";

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

// Helper function to find a product by either its original ObjectId or its deterministic numeric ID
const findProductById = async (id, populateCategory = false) => {
  if (!id) return null;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  if (isObjectId) {
    let query = Product.findById(id);
    if (populateCategory) {
      query = query.populate("category");
    }
    return await query;
  } else {
    const numericIdToFind = Number(id);
    let query = Product.find({});
    if (populateCategory) {
      query = query.populate("category");
    }
    const allProducts = await query;
    return allProducts.find(p => convertToNumericId(p._id) === numericIdToFind) || null;
  }
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
    options: [
      {
        name: "Color",
        values: [product.badge || "Default"]
      },
      {
        name: "Size",
        values: ["Default"]
      }
    ]
  };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({});
    const products = await Product.find({})
      .populate("category")
      .skip(skip)
      .limit(limit);

    const formattedProducts = products.map(product => formatProduct(product));

    res.json({
      data: {
        total,
        products: formattedProducts
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch products by collection slug
// @route   GET /api/collections/:slug/products
// @access  Public
export const getProductsByCollection = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const Category = (await import("../models/Category.js")).default;
    
    // Support either slug from params or collection_id from query
    const identifier = req.params.slug !== "undefined" ? req.params.slug : req.query.collection_id;
    
    let category;
    if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier);
    }
    if (!category) {
      category = await Category.findOne({ slug: identifier });
    }
    
    if (!category) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const total = await Product.countDocuments({ category: category._id });
    const products = await Product.find({ category: category._id })
      .populate("category")
      .skip(skip)
      .limit(limit);

    const formattedProducts = products.map(product => formatProduct(product));

    res.json({
      data: {
        total,
        products: formattedProducts
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await findProductById(req.params.id, true);

    if (product) {
      const formattedProduct = formatProduct(product);
      res.json(formattedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    mrp,
    image,
    images,
    badge,
    category,
    brand,
    age_range,
    in_stock,
    show_in_hero,
    show_in_popup,
    is_sale,
    offer_starts_at,
    offer_expires_at,
    weight,
    length,
    breadth,
    height,
  } = req.body;

  const finalMrp = mrp ? Number(mrp) : Number(price);
  // Calculate offer_pct automatically if not provided
  const offer_pct =
    req.body.offer_pct !== undefined
      ? req.body.offer_pct
      : finalMrp > price
        ? Math.round(((finalMrp - price) / finalMrp) * 100)
        : 0;

  const product = new Product({
    name,
    description,
    price,
    mrp: finalMrp,
    offer_pct,
    image,
    images: images || [],
    badge,
    category,
    brand,
    age_range,
    in_stock,
    show_in_hero: show_in_hero || false,
    show_in_popup: show_in_popup || false,
    is_sale: is_sale || false,
    offer_starts_at,
    offer_expires_at,
    weight: weight ? Number(weight) : undefined,
    length: length ? Number(length) : undefined,
    breadth: breadth ? Number(breadth) : undefined,
    height: height ? Number(height) : undefined,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      mrp,
      image,
      images,
      badge,
      category,
      brand,
      age_range,
      in_stock,
      show_in_hero,
      show_in_popup,
      is_sale,
      offer_starts_at,
      offer_expires_at,
      weight,
      length,
      breadth,
      height,
    } = req.body;

    const product = await findProductById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;

      const finalMrp = mrp !== undefined ? (mrp ? Number(mrp) : product.price) : product.mrp;
      product.mrp = finalMrp;

      // Recalculate offer_pct automatically
      product.offer_pct =
        req.body.offer_pct !== undefined
          ? req.body.offer_pct
          : product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

      product.image = image || product.image;
      product.images = images || product.images;
      product.badge = badge || product.badge;
      product.category = category || product.category;
      product.brand = brand !== undefined ? brand : product.brand;
      product.age_range = age_range !== undefined ? age_range : product.age_range;
      product.in_stock = in_stock !== undefined ? in_stock : product.in_stock;
      product.show_in_hero = show_in_hero !== undefined ? show_in_hero : product.show_in_hero;
      product.show_in_popup = show_in_popup !== undefined ? show_in_popup : product.show_in_popup;
      product.is_sale = is_sale !== undefined ? is_sale : product.is_sale;
      product.offer_starts_at =
        offer_starts_at !== undefined ? offer_starts_at : product.offer_starts_at;
      product.offer_expires_at =
        offer_expires_at !== undefined ? offer_expires_at : product.offer_expires_at;
      product.weight = weight ? Number(weight) : weight === "" ? undefined : product.weight;
      product.length = length ? Number(length) : length === "" ? undefined : product.length;
      product.breadth = breadth ? Number(breadth) : breadth === "" ? undefined : product.breadth;
      product.height = height ? Number(height) : height === "" ? undefined : product.height;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await findProductById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const product = await findProductById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });

      if (alreadyReviewed) {
        alreadyReviewed.rating = Number(rating);
        alreadyReviewed.title = title;
        alreadyReviewed.comment = comment;
        await alreadyReviewed.save();
      } else {
        const review = new Review({
          product: product._id,
          user: req.user._id,
          user_name: req.user.full_name,
          rating: Number(rating),
          title,
          comment,
        });
        await review.save();
      }

      const reviews = await Review.find({ product: product._id });
      product.rating_count = reviews.length;
      product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const product = await findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
export const deleteProductReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (review) {
      if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      await review.deleteOne();

      // Update product rating
      const product = await findProductById(req.params.id);
      if (product) {
        const reviews = await Review.find({ product: product._id });
        if (reviews.length === 0) {
          product.rating_count = 0;
          product.rating = 0;
        } else {
          product.rating_count = reviews.length;
          product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        }
        await product.save();
      }

      res.json({ message: "Review removed" });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
