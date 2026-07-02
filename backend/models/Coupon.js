import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, default: 5 },
    heading: { type: String, required: true },
    content: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
