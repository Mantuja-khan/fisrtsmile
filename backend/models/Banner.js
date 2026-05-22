import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    position: { type: String, enum: ["hero", "promo"], default: "hero" },
  },
  { timestamps: true },
);

export default mongoose.model("Banner", bannerSchema);
