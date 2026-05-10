import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    offer_pct: { type: Number, default: 0 },
    image: { type: String }, // Primary image
    images: { type: [String], default: [] }, // Gallery images
    badge: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    age_range: { type: String },
    in_stock: { type: Boolean, default: true },
    show_in_hero: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
