import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const convertToNumericId = (idStr, suffix = "") => {
  if (!idStr) return 0;
  const cleanStr = idStr.toString();
  if (/^\d+$/.test(cleanStr)) {
    return Number(cleanStr);
  }
  let hash = 0;
  const strToHash = cleanStr + suffix;
  for (let i = 0; i < strToHash.length; i++) {
    const char = strToHash.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function inspectProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find().limit(5);
    console.log(`Found ${products.length} products:`);
    products.forEach(p => {
      const variantId = convertToNumericId(p.shiprocketVariantId || p._id, "-variant");
      console.log({
        id: p._id,
        name: p.name,
        calculatedVariantId: variantId,
        price: p.price
      });
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error inspecting products:", err.message);
  }
}

inspectProducts();
