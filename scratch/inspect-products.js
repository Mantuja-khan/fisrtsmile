import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../backend/.env' });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function inspectProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find().limit(5);
    console.log(`Found ${products.length} products:`);
    products.forEach(p => {
      console.log({
        id: p._id,
        name: p.name,
        shiprocketVariantId: p.shiprocketVariantId,
        price: p.price
      });
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error inspecting products:", err.message);
  }
}

inspectProducts();
