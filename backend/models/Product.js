import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },

    // NEW FIELD
    shiprocketVariantId: {
      type: String,
      default: ""
    },

    mrp: { type: Number },
    offer_pct: { type: Number, default: 0 },
    offer_starts_at: { type: Date },
    offer_expires_at: { type: Date },
    image: { type: String },
    images: { type: [String], default: [] },
    badge: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    brand: { type: String },
    age_range: { type: String },
    in_stock: { type: Boolean, default: true },
    show_in_hero: { type: Boolean, default: false },
    show_in_popup: { type: Boolean, default: false },
    is_sale: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    weight: { type: Number, default: 0.5 },
    length: { type: Number, default: 10 },
    breadth: { type: Number, default: 10 },
    height: { type: Number, default: 10 },
  },
  { timestamps: true }
);
export default mongoose.model(
  "Product",
  productSchema
);