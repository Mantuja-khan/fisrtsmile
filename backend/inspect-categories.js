import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const categorySchema = new mongoose.Schema({}, { strict: false });
const Category = mongoose.model('Category', categorySchema);

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const categories = await Category.find().sort({ sort_order: 1 });
    console.log(`Found ${categories.length} categories in database:`);
    categories.forEach(c => {
      console.log(`- Name: ${c.name} | Slug: ${c.slug} | Image: ${c.image || 'None'} | Icon: ${c.icon || 'None'} | ID: ${c._id}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspect();
