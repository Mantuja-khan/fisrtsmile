import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

async function deleteUnused() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const categories = await Category.find();
    const products = await Product.find().populate('category');

    const usedCategoryIds = new Set();
    products.forEach(p => {
      if (p.category) {
        usedCategoryIds.add(p.category._id.toString());
        if (p.category.parent) {
          usedCategoryIds.add(p.category.parent.toString());
        }
      }
    });

    const unusedCategories = categories.filter(c => !usedCategoryIds.has(c._id.toString()));
    console.log(`Found ${unusedCategories.length} unused categories.`);

    if (unusedCategories.length > 0) {
      const idsToDelete = unusedCategories.map(c => c._id);
      const result = await Category.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`Successfully deleted ${result.deletedCount} unused categories.`);
    } else {
      console.log("No unused categories to delete.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

deleteUnused();
