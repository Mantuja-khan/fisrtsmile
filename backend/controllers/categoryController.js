import Category from "../models/Category.js";

// Helper function to deterministically convert any string ID to a safe 32-bit positive integer
const convertToNumericId = (idStr, suffix = "") => {
  if (!idStr) return 0;
  const cleanStr = idStr.toString();
  // If it's already a valid number/numeric string, parse it directly
  if (/^\d+$/.test(cleanStr)) {
    return Number(cleanStr);
  }
  let hash = 0;
  const strToHash = cleanStr + suffix;
  for (let i = 0; i < strToHash.length; i++) {
    const char = strToHash.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper function to find a category by either its original ObjectId or its deterministic numeric ID
const findCategoryById = async (id) => {
  if (!id) return null;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  if (isObjectId) {
    return await Category.findById(id);
  } else {
    const numericIdToFind = Number(id);
    const allCategories = await Category.find({});
    return allCategories.find(c => convertToNumericId(c._id) === numericIdToFind) || null;
  }
};

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
  "BLOCKS",
  "DOLL & DOLL SETS",
  "RIDE ON",
  "BOARD GAME & PUZZLE",
  "SCHOOL",
  "DECORATION",
  "ELECTRONIC TOYS",
  "KIDS FURNITURE",
  "SOFT TOYS",
  "FIGURE & PLAYSET",
  "KIDS ASSESSORIES",
  "GIFT",
  "MUSICAL",
  "VEHICLES & TRACKS",
  "GUNS & WEAPONS",
  "NOVELTY TOYS",
  "FESTIVAL",
  "INFANT & TOODLER",
  "SPORTS"
];

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  let categories = await Category.find({}).populate("parent").sort({ sort_order: 1 });

  // Trigger seeding if requested via query param OR if collection is completely empty
  if (req.query.seed === "true" || categories.length === 0) {
    console.log("Seeding categories data...");
    await Category.deleteMany({});

    let sortOrder = 1;
    for (const catName of categoriesData) {
      const slug = slugify(catName);
      await Category.create({
        name: catName,
        slug: slug,
        sort_order: sortOrder++,
      });
    }
    // Refetch after seeding
    categories = await Category.find({}).populate("parent").sort({ sort_order: 1 });
  }

  const formattedCollections = categories.map(cat => ({
    id: convertToNumericId(cat._id),
    updated_at: cat.updatedAt,
    body_html: `<p>${cat.name}</p>`,
    handle: cat.slug,
    image: {
      src: cat.image || ""
    },
    title: cat.name,
    created_at: cat.createdAt,
    
    // Legacy Admin Compatibility Fields
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || null,
    parent: cat.parent,
    sort_order: cat.sort_order || 0
  }));

  res.json({
    data: {
      total: formattedCollections.length,
      collections: formattedCollections
    }
  });
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, slug, icon, image, sort_order, parent } = req.body;

  const category = new Category({
    name,
    slug,
    icon,
    image,
    sort_order,
    parent: parent || null,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { name, slug, icon, image, sort_order, parent } = req.body;

  const category = await findCategoryById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.icon = icon || category.icon;
    category.image = image !== undefined ? image : category.image;
    category.sort_order = sort_order !== undefined ? sort_order : category.sort_order;
    category.parent = parent !== undefined ? parent || null : category.parent;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: "Category not found" });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  const category = await findCategoryById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } else {
    res.status(404).json({ message: "Category not found" });
  }
};
