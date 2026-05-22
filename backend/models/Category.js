import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String },
    image: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
