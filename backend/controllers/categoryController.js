import Category from "../models/Category.js";

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
  {
    name: "BLOCKS",
    subs: [
      "BLOCKS",
      "BULLET BLOCKS",
      "CONSTRUCTION BLOCK",
      "INTELOCKING BLOCKS",
      "LIGHT BLOCKS",
      "MAGNETIC",
      "MEGA BLOCK",
    ],
  },
  {
    name: "DOLL & DOLL SETS",
    subs: ["DOLL", "DOLL HOUSE", "DOLL SET"],
  },
  {
    name: "RIDE ON",
    subs: [
      "BATTERY OPERATED",
      "BATTERY TOY ASSESSORIES",
      "CYCLE",
      "CYCLE ASSESSORIES",
      "MANUAL RIDE ON",
      "SCOOTER",
      "SWING CAR",
      "TRICYCLE",
    ],
  },
  {
    name: "BOARD GAME & PUZZLE",
    subs: [
      "ART & CRAFT",
      "BOARD GAME",
      "CHESS",
      "CONSTRUCTION BLOCK",
      "CUBE",
      "FISHING GAME",
      "LUDO & SNAKES",
      "MIND GAME",
      "PLAYING CARDS",
      "PUZZLE",
      "SCIENCE GAME",
      "TABLE TOP GAME",
    ],
  },
  {
    name: "SCHOOL",
    subs: [
      "COLORING & STATIONERY",
      "DIARY",
      "GEOMETRY PENCIL BOX",
      "LUNCH BOX",
      "PENCIL BOX",
      "POUCH",
      "SCHOOL BAG",
      "SIPPER",
      "WATER BOTTLE",
    ],
  },
  {
    name: "DECORATION",
    subs: ["BALLOON", "CANDLE", "CURTAINS", "COMBO SETS"],
  },
  {
    name: "ELECTRONIC TOYS",
    subs: ["CAMERA", "VIDEO GAME"],
  },
  {
    name: "KIDS FURNITURE",
    subs: ["CHAIR", "ROCKING CHAIR", "STOOL", "STUDY TABLE"],
  },
  {
    name: "SOFT TOYS",
    subs: ["BAG", "BOY", "CAT", "CHRACTER", "DOG", "PENGUINE", "SOFA", "Soft Toys"],
  },
  {
    name: "FIGURE & PLAYSET",
    subs: [
      "ANIMAL FIGURE",
      "AVENGER",
      "BEAUTY",
      "DOCTOR",
      "KITCHEN",
      "MIX",
      "Peppa Pig",
      "SHOPPING",
      "TEA SET",
      "TENT HOUSE",
      "TOOL KIT",
      "WENDING MACHINE",
    ],
  },
  {
    name: "KIDS ASSESSORIES",
    subs: ["HAIR BAND", "MAKE UP", "OTHERS", "SLING BAG", "TOOTH BRUSH", "WATCH", "UMBRELLA"],
  },
  {
    name: "GIFT",
    subs: ["CLOCK", "Fan", "GIFT", "HEADPHONE", "KEYCHAIN", "LAMP", "LAZER LIGHT", "PENS"],
  },
  {
    name: "MUSICAL",
    subs: ["GUITAR", "MIKE", "MOUTH ORGAN", "PIANO", "SPEAKER"],
  },
  {
    name: "VEHICLES & TRACKS",
    subs: ["DIE CAST TOY", "DIY", "FRICTION TOY", "RC TOYS", "TRACK SET"],
  },
  {
    name: "GUNS & WEAPONS",
    subs: ["BOW & ARROW", "BUBBLE GUN", "BULLET", "BULLET GUN", "MUSICAL GUN", "SWORD"],
  },
  {
    name: "NOVELTY TOYS",
    subs: ["BINOCULAR", "CUP", "MINI TOYS", "PIGGY BANK", "STICKER", "YOYO", "HOOPLA", "HOP BALL"],
  },
  {
    name: "FESTIVAL",
    subs: ["HOLI", "RAKHSA BANDHAN", "XMAS"],
  },
  {
    name: "INFANT & TOODLER",
    subs: [
      "GIFT PACK",
      "MOTHER BAG",
      "BEDDING SET & BLANKET",
      "BABAY CARE PRODUCTS",
      "EDUCATIONAL",
      "KIDS BAG",
      "INFANT ASSESSORIES",
      "KIDS FURNITURE",
      "INFANT TOYS / PUZZLE",
      "FEEDING ASSESSORIES",
    ],
  },
  {
    name: "SPORTS",
    subs: [
      "BADMINTON",
      "BALACING BOARD",
      "BASKET BALL",
      "BEYBLADE & FLYIG DISC",
      "BOW & ARROW",
      "BOWLING",
      "BOXING",
      "CARROM",
      "CRICKET",
      "DART GAME",
      "FOOTBALL",
      "GOLF",
      "HOCKEY",
      "HOWER BALL",
      "JUMPING ROPE",
      "POOL",
      "PUMP",
      "RACKET",
      "SAFETY ACCESSORIES",
      "SKATE",
      "SWIMMING",
      "TABLE TENNIS",
      "VOLLEY BALL",
      "YOGA",
    ],
  },
];

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  let categories = await Category.find({}).populate("parent").sort({ sort_order: 1 });

  // Trigger seeding if requested via query param OR if collection is completely empty
  if (req.query.seed === "true" || categories.length === 0) {
    console.log("Seeding categories data matrix...");
    await Category.deleteMany({});

    let sortOrder = 1;
    for (const catData of categoriesData) {
      const parentSlug = slugify(catData.name);
      const parentCat = await Category.create({
        name: catData.name,
        slug: parentSlug,
        sort_order: sortOrder++,
      });

      let subSortOrder = 1;
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
    // Refetch after seeding
    categories = await Category.find({}).populate("parent").sort({ sort_order: 1 });
  }

  res.json(categories);
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

  const category = await Category.findById(req.params.id);

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
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } else {
    res.status(404).json({ message: "Category not found" });
  }
};
