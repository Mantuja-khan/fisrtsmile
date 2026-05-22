import teddy from "@/assets/toy-teddy.jpg";
import blocks from "@/assets/toy-blocks.jpg";
import rccar from "@/assets/toy-rccar.jpg";
import action from "@/assets/toy-action.jpg";
import baby from "@/assets/toy-baby.jpg";
import puzzle from "@/assets/toy-puzzle.jpg";
import unicorn from "@/assets/toy-unicorn.jpg";
import drone from "@/assets/toy-drone.jpg";

// Bundled image map so DB-stored asset paths still resolve to real Vite URLs.
const imageMap: Record<string, string> = {
  "/src/assets/toy-teddy.jpg": teddy,
  "/src/assets/toy-blocks.jpg": blocks,
  "/src/assets/toy-rccar.jpg": rccar,
  "/src/assets/toy-action.jpg": action,
  "/src/assets/toy-baby.jpg": baby,
  "/src/assets/toy-puzzle.jpg": puzzle,
  "/src/assets/toy-unicorn.jpg": unicorn,
  "/src/assets/toy-drone.jpg": drone,
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  category_slug?: string;
  category_name?: string;
  price: number;
  mrp: number;
  image: string;
  images: string[];
  rating: number;
  ratingCount: number;
  inStock: boolean;
  badge?: string | null;
  ageRange: string;
  age_range?: string | null;
  offerPct: number;
  brand?: string | null;
  offerStartsAt?: string | null;
  offerExpiresAt?: string | null;
  showInPopup?: boolean;
  isSale?: boolean;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
};

export const resolveImage = (img: string | null | undefined): string => {
  if (!img) return teddy;
  if (imageMap[img]) return imageMap[img];
  
  // Handle legacy localhost URLs stored in DB
  let normalized = img;
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname.startsWith('192.168.'));
  const apiHost = isLocalhost 
    ? "http://localhost:5003/api" 
    : (import.meta.env.VITE_API_URL || "https://api.toyhaat.com/api");
  const baseUrl = apiHost.replace(/\/api\/?$/, ""); // get base domain without trailing slash or /api
  
  if (normalized.includes("http://localhost:5000") || normalized.includes("http://localhost:5003")) {
      normalized = normalized.replace(/http:\/\/localhost:(5000|5003)/, baseUrl);
  }
  
  // If it starts with /uploads (relative path), prepend baseUrl
  if (normalized.startsWith("/uploads")) {
      return `${baseUrl}${normalized}`;
  }
  
  return normalized;
};

export const discountPct = (price: number, mrp: number) =>
  mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

// Effective price after admin offer
export const effectivePrice = (price: number, offerPct: number) => price;
