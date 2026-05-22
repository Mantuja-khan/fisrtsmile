import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    order_number: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String },
    shipping_address: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    cod_charge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment_method: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Returned",
      ],
      default: "Placed",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    payment_id: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    shiprocket_order_id: { type: String },
    shipment_id: { type: String },
    awb_code: { type: String },
    tracking_url: { type: String },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
