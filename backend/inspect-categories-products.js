import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const categories = await Category.find();
    const products = await Product.find().populate('category');

    console.log(`\nTotal Products: ${products.length}`);
    const usedCategoryIds = new Set();
    products.forEach(p => {
      if (p.category) {
        usedCategoryIds.add(p.category._id.toString());
        // Also add parent category if it exists
        if (p.category.parent) {
          usedCategoryIds.add(p.category.parent.toString());
        }
      }
    });

    console.log(`Used categories count: ${usedCategoryIds.size}`);

    const unusedCategories = categories.filter(c => !usedCategoryIds.has(c._id.toString()));
    console.log(`Unused categories count: ${unusedCategories.length}`);
    
    console.log("\nUnused Categories list:");
    unusedCategories.forEach(c => {
      console.log(`- ${c.name} (Slug: ${c.slug}, ID: ${c._id}, Parent: ${c.parent || 'None'})`);
    });

    console.log("\nUsed Categories list:");
    const usedCategories = categories.filter(c => usedCategoryIds.has(c._id.toString()));
    usedCategories.forEach(c => {
      const prodCount = products.filter(p => p.category && (p.category._id.toString() === c._id.toString() || (p.category.parent && p.category.parent.toString() === c._id.toString()))).length;
      console.log(`- ${c.name} (Slug: ${c.slug}, ID: ${c._id}, Parent: ${c.parent || 'None'}) -> matches ${prodCount} products`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspect();
