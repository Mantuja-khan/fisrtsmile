import Product from '../models/Product.js';
import Review from '../models/Review.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    const products = await Product.find({}).populate('category');
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
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
        offer_starts_at,
        offer_expires_at,
        weight,
        length,
        breadth,
        height,
    } = req.body;

    const finalMrp = mrp ? Number(mrp) : Number(price);
    // Calculate offer_pct automatically if not provided
    const offer_pct = req.body.offer_pct !== undefined ? req.body.offer_pct : (finalMrp > price ? Math.round(((finalMrp - price) / finalMrp) * 100) : 0);

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
        offer_starts_at,
        offer_expires_at,
        weight,
        length,
        breadth,
        height,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        
        const finalMrp = mrp !== undefined ? (mrp ? Number(mrp) : product.price) : product.mrp;
        product.mrp = finalMrp;
        
        // Recalculate offer_pct automatically
        product.offer_pct = req.body.offer_pct !== undefined ? req.body.offer_pct : (product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);
        
        product.image = image || product.image;
        product.images = images || product.images;
        product.badge = badge || product.badge;
        product.category = category || product.category;
        product.brand = brand !== undefined ? brand : product.brand;
        product.age_range = age_range !== undefined ? age_range : product.age_range;
        product.in_stock = in_stock !== undefined ? in_stock : product.in_stock;
        product.show_in_hero = show_in_hero !== undefined ? show_in_hero : product.show_in_hero;
        product.show_in_popup = show_in_popup !== undefined ? show_in_popup : product.show_in_popup;
        product.offer_starts_at = offer_starts_at !== undefined ? offer_starts_at : product.offer_starts_at;
        product.offer_expires_at = offer_expires_at !== undefined ? offer_expires_at : product.offer_expires_at;
        product.weight = weight ? Number(weight) : (weight === "" ? undefined : product.weight);
        product.length = length ? Number(length) : (length === "" ? undefined : product.length);
        product.breadth = breadth ? Number(breadth) : (breadth === "" ? undefined : product.breadth);
        product.height = height ? Number(height) : (height === "" ? undefined : product.height);

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
    const { rating, title, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = await Review.findOne({ product: req.params.id, user: req.user._id });

        if (alreadyReviewed) {
            alreadyReviewed.rating = Number(rating);
            alreadyReviewed.title = title;
            alreadyReviewed.comment = comment;
            await alreadyReviewed.save();
        } else {
            const review = new Review({
                product: req.params.id,
                user: req.user._id,
                user_name: req.user.full_name,
                rating: Number(rating),
                title,
                comment,
            });
            await review.save();
        }

        const reviews = await Review.find({ product: req.params.id });
        product.rating_count = reviews.length;
        product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
};

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
export const deleteProductReview = async (req, res) => {
    const review = await Review.findById(req.params.reviewId);

    if (review) {
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await review.deleteOne();
        
        // Update product rating
        const reviews = await Review.find({ product: req.params.id });
        const product = await Product.findById(req.params.id);
        if (product) {
            if (reviews.length === 0) {
                product.rating_count = 0;
                product.rating = 0;
            } else {
                product.rating_count = reviews.length;
                product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            }
            await product.save();
        }

        res.json({ message: 'Review removed' });
    } else {
        res.status(404).json({ message: 'Review not found' });
    }
};
