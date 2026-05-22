import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { resolveImage, type Product, type Category } from "@/data/products";

export type Banner = {
  _id: string;
  image: string;
  category: { _id: string; name: string; slug: string };
  position: "hero" | "promo";
};

type DbRow = {
  _id: string;
  name: string;
  description: string | null;
  category: any;
  price: number;
  mrp: number;
  image: string | null;
  images?: string[];
  rating: number;
  rating_count: number;
  in_stock: boolean;
  badge: string | null;
  age_range: string | null;
  offer_pct: number;
  brand: string | null;
  offer_starts_at?: string | null;
  offer_expires_at?: string | null;
  show_in_popup?: boolean;
  is_sale?: boolean;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
};

const mapRow = (r: DbRow): Product => {
  const img = resolveImage(r.image);
  return {
    id: r._id,
    name: r.name,
    description: r.description ?? "",
    category_id: r.category?._id || r.category,
    category_slug: r.category?.slug,
    category_name: r.category?.name,
    price: Number(r.price),
    mrp: Number(r.mrp),
    image: img,
    images:
      r.images && r.images.length > 0 ? r.images.map((pImg: string) => resolveImage(pImg)) : [img],
    rating: Number(r.rating),
    ratingCount: r.rating_count,
    inStock: r.in_stock,
    badge: r.badge,
    ageRange: r.age_range ?? "All",
    offerPct:
      r.offer_expires_at && new Date(r.offer_expires_at) < new Date() ? 0 : (r.offer_pct ?? 0),
    brand: r.brand,
    offerStartsAt: r.offer_starts_at,
    offerExpiresAt: r.offer_expires_at,
    showInPopup: r.show_in_popup,
    isSale: r.is_sale,
    weight: r.weight ?? 0.5,
    length: r.length ?? 10,
    breadth: r.breadth ?? 10,
    height: r.height ?? 10,
  };
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get("/categories");
      return (data as any[]).map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        image: c.image,
        parent_id: c.parent?._id || c.parent,
        sort_order: c.sort_order,
      }));
    },
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async (): Promise<Banner[]> => {
      const { data } = await api.get("/banners");
      return data;
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await api.get("/products");
      return (data as DbRow[]).map(mapRow);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data } = await api.get(`/products/${id}`);
      return data ? mapRow(data as DbRow) : null;
    },
    enabled: !!id,
  });
}
