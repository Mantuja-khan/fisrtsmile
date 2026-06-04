import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

async function inspectOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
    console.log(`Found ${orders.length} recent orders:`);
    console.log(JSON.stringify(orders, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error inspecting orders:", err.message);
  }
}

inspectOrders();
