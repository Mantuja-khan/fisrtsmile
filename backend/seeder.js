import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();

    const adminUser = {
      full_name: "Admin User",
      email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    };
    await User.create(adminUser);
    console.log("Admin User Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
