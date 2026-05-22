import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

function slugify(text, parentSlug = "") {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return parentSlug ? `${parentSlug}-${base}` : base;
}

const categoriesData = [
  { name: "BLOCKS", subs: ["BLOCKS", "CONSTRUCTION BLOCK"] },
  { name: "BOARD GAME & PUZZLE", subs: ["BOARD GAME", "ART & CRAFT", "CARD GAME", "PUZZLE"] },
  { name: "DOLL & DOLL SETS", subs: ["DOLLS & PLAYSETS", "ROLEPLAY"] },
  { name: "RIDE ON & CYCLES", subs: ["TRICYCLE", "CYCLE", "SCOOTER", "RIDE ON"] },
  { name: "INFANT & PRESCHOOL", subs: ["BABY TOYS", "BABY GEAR & UTILITY", "BABY PERSONAL CARE"] },
  {
    name: "LIFE STYLE",
    subs: [
      "MUSIC",
      "BUBBLE PLAY",
      "NOVELTY TOYS",
      "SCHOOL ACCESSORIES",
      "GADGETS",
      "KIDS ACCESSORIES",
    ],
  },
  { name: "PARTY DECORATION", subs: ["BALLOON", "CANDLE", "CURTAINS", "COMBO SETS"] },
  { name: "SOFT TOYS", subs: ["STUFFED ANIMAL", "PILLOW"] },
  { name: "SPORTS & OUTDOOR", subs: ["OUTDOOR SPORTS", "INDOOR SPORTS"] },
  { name: "WEAPONS & GUNS", subs: ["GUNS AND BULLET", "MUSICAL GUNS", "WEAPONS"] },
  {
    name: "VEHICLES & TRACKS",
    subs: ["RC TOYS", "DIE CAST TOY & FRICTION", "TRAIN AND TRACK SET"],
  },
  { name: "KIDS FURNITURE", subs: ["CHAIR", "STOOL", "TABLE AND CHAIR"] },
];

const seedCategories = async () => {
  try {
    console.log("Clearing existing categories...");
    await Category.deleteMany({});

    let sortOrder = 1;

    for (const catData of categoriesData) {
      const parentSlug = slugify(catData.name);

      // Create parent category
      const parentCat = await Category.create({
        name: catData.name,
        slug: parentSlug,
        sort_order: sortOrder++,
      });

      console.log(`Created Parent Category: ${parentCat.name}`);

      let subSortOrder = 1;
      // Create unique subcategories using Set to avoid duplicate string values in same subs array
      const uniqueSubs = [...new Set(catData.subs)];
      for (const subName of uniqueSubs) {
        const subSlug = slugify(subName, parentSlug);
        await Category.create({
          name: subName,
          slug: subSlug,
          parent: parentCat._id,
          sort_order: subSortOrder++,
        });
      }
    }

    console.log("All categories and subcategories successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
