import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

function slugify(text, parentSlug = '') {
    const base = text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return parentSlug ? `${parentSlug}-${base}` : base;
}

const categoriesData = [
    {
        name: "BLOCKS",
        subs: ["BLOCKS", "BULLET BLOCKS", "CONSTRUCTION BLOCK", "INTELOCKING BLOCKS", "LIGHT BLOCKS", "MAGNETIC", "MEGA BLOCK"]
    },
    {
        name: "DOLL & DOLL SETS",
        subs: ["DOLL", "DOLL HOUSE", "DOLL SET", "DOLLS & PLAYSETS", "ROLEPLAY"]
    },
    {
        name: "RIDE ON & CYCLES",
        subs: ["BATTERY OPERATED", "BATTERY TOY ASSESSORIES", "CYCLE", "CYCLE ASSESSORIES", "MANUAL RIDE ON", "RIDE ON", "SCOOTER", "SWING CAR", "TRICYCLE"]
    },
    {
        name: "BOARD GAME & PUZZLE",
        subs: ["ART & CRAFT", "BOARD GAME", "CARD GAME", "CHESS", "CONSTRUCTION BLOCK", "CUBE", "FISHING GAME", "LUDO & SNAKES", "MIND GAME", "PLAYING CARDS", "PUZZLE", "SCIENCE GAME", "TABLE TOP GAME"]
    },
    {
        name: "SCHOOL",
        subs: ["COLORING & STATIONERY", "DIARY", "GEOMETRY PENCIL BOX", "LUNCH BOX", "PENCIL BOX", "POUCH", "SCHOOL BAG", "SIPPER", "WATER BOTTLE"]
    },
    {
        name: "PARTY DECORATION",
        subs: ["BALLOON", "CANDLE", "CURTAINS", "COMBO SETS"]
    },
    {
        name: "ELECTRONIC TOYS",
        subs: ["CAMERA", "VIDEO GAME"]
    },
    {
        name: "KIDS FURNITURE",
        subs: ["CHAIR", "ROCKING CHAIR", "STOOL", "STUDY TABLE", "TABLE AND CHAIR"]
    },
    {
        name: "SOFT TOYS",
        subs: ["BAG", "BOY", "CAT", "CHRACTER", "DOG", "PENGUINE", "SOFA", "Soft Toys", "STUFFED ANIMAL", "PILLOW"]
    },
    {
        name: "FIGURE & PLAYSET",
        subs: ["ANIMAL FIGURE", "AVENGER", "BEAUTY", "DOCTOR", "KITCHEN", "MIX", "Peppa Pig", "SHOPPING", "TEA SET", "TENT HOUSE", "TOOL KIT", "WENDING MACHINE"]
    },
    {
        name: "KIDS ASSESSORIES",
        subs: ["HAIR BAND", "MAKE UP", "OTHERS", "SLING BAG", "TOOTH BRUSH", "WATCH", "UMBRELLA"]
    },
    {
        name: "GIFT",
        subs: ["CLOCK", "Fan", "GIFT", "HEADPHONE", "KEYCHAIN", "LAMP", "LAZER LIGHT", "PENS"]
    },
    {
        name: "MUSICAL",
        subs: ["GUITAR", "MIKE", "MOUTH ORGAN", "PIANO", "SPEAKER"]
    },
    {
        name: "VEHICLES & TRACKS",
        subs: ["DIE CAST TOY", "DIY", "FRICTION TOY", "RC TOYS", "TRACK SET", "DIE CAST TOY & FRICTION", "TRAIN AND TRACK SET"]
    },
    {
        name: "WEAPONS & GUNS",
        subs: ["BOW & ARROW", "BUBBLE GUN", "BULLET", "BULLET GUN", "MUSICAL GUN", "SWORD", "GUNS AND BULLET", "MUSICAL GUNS", "WEAPONS"]
    },
    {
        name: "NOVELTY TOYS",
        subs: ["BINOCULAR", "CUP", "MINI TOYS", "PIGGY BANK", "STICKER", "YOYO", "HOOPLA", "HOP BALL"]
    },
    {
        name: "FESTIVAL",
        subs: ["HOLI", "RAKHSA BANDHAN", "XMAS"]
    },
    {
        name: "INFANT & PRESCHOOL",
        subs: ["GIFT PACK", "MOTHER BAG", "BEDDING SET & BLANKET", "BABAY CARE PRODUCTS", "BABY TOYS", "BABY GEAR & UTILITY", "BABY PERSONAL CARE", "EDUCATIONAL", "KIDS BAG", "INFANT ASSESSORIES", "KIDS FURNITURE", "INFANT TOYS / PUZZLE", "FEEDING ASSESSORIES"]
    },
    {
        name: "SPORTS & OUTDOOR",
        subs: ["BADMINTON", "BALACING BOARD", "BASKET BALL", "BEYBLADE & FLYIG DISC", "BOW & ARROW", "BOWLING", "BOXING", "CARROM", "CRICKET", "DART GAME", "FOOTBALL", "GOLF", "HOCKEY", "HOWER BALL", "JUMPING ROPE", "POOL", "PUMP", "RACKET", "SAFETY ACCESSORIES", "SKATE", "SWIMMING", "TABLE TENNIS", "VOLLEY BALL", "YOGA", "OUTDOOR SPORTS", "INDOOR SPORTS"]
    },
    {
        name: "LIFE STYLE",
        subs: ["MUSIC", "BUBBLE PLAY", "NOVELTY TOYS", "SCHOOL ACCESSORIES", "GADGETS", "KIDS ACCESSORIES"]
    }
];

const seedCategories = async () => {
    try {
        console.log('Clearing existing categories...');
        await Category.deleteMany({});

        let sortOrder = 1;

        for (const catData of categoriesData) {
            const parentSlug = slugify(catData.name);
            
            // Create parent category
            const parentCat = await Category.create({
                name: catData.name,
                slug: parentSlug,
                sort_order: sortOrder++
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
                    sort_order: subSortOrder++
                });
            }
        }

        console.log('All categories and subcategories successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
