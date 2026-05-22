import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user_name: { type: String, required: true },
    rating: { type: Number, required: true },
    title: { type: String },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
