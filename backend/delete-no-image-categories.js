import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

async function clean() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const categories = await Category.find();
    
    // Find all categories that do not have a valid image URL
    const noImageCategories = categories.filter(c => {
      const img = c.image;
      return !img || img === 'None' || img === 'undefined' || img.toString().trim() === '';
    });

    console.log(`Found ${noImageCategories.length} categories with no actual image.`);

    for (const cat of noImageCategories) {
      console.log(`Processing category: ${cat.name} (ID: ${cat._id}, Parent: ${cat.parent || 'None'})`);
      
      // Find products using this category
      const products = await Product.find({ category: cat._id });
      console.log(`  - Found ${products.length} products using this category.`);
      
      if (products.length > 0) {
        if (cat.parent) {
          // Re-associate to parent category
          console.log(`  - Re-associating products to parent category ID: ${cat.parent}`);
          await Product.updateMany({ category: cat._id }, { category: cat.parent });
        } else {
          console.log(`  - No parent category exists for this category.`);
        }
      }
      
      // Delete the category
      await Category.deleteOne({ _id: cat._id });
      console.log(`  - Deleted category: ${cat.name}`);
    }

    console.log("Category cleanup complete!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

clean();
