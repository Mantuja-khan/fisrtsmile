import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { resolveImage, type Product, type Category } from "@/data/products";

export type Banner = {
  _id: string;
  image: string;
  category: { _id: string; name: string; slug: string };
  position: 'hero' | 'promo';
};

type DbRow = {
  _id: string;
  name: string;
  description: string | null;
  category: any;
  price: number;
  mrp: number;
  image: string | null;
  rating: number;
  rating_count: number;
  in_stock: boolean;
  badge: string | null;
  age_range: string | null;
  offer_pct: number;
  brand: string | null;
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
    images: [img, img, img],
    rating: Number(r.rating),
    ratingCount: r.rating_count,
    inStock: r.in_stock,
    badge: r.badge,
    ageRange: r.age_range ?? "All",
    offerPct: r.offer_pct ?? 0,
    brand: r.brand,
  };
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get("/categories");
      return (data as any[]).map(c => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sort_order: c.sort_order
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
