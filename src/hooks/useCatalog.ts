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
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  handle: string;
  tags: string;
  status: string;
  variants: {
    id: string;
    price: string;
    compare_at_price: string;
    quantity: number;
    weight: number;
    image?: { src: string };
  }[];
  image?: { src: string };
  images?: { src: string }[];
};

const mapRow = (r: DbRow): Product => {
  const variant = r.variants?.[0];
  const price = variant?.price ? Number(variant.price) : 0;
  const mrp = variant?.compare_at_price ? Number(variant.compare_at_price) : price;
  const imgUrl = r.image?.src || "";
  const img = resolveImage(imgUrl);
  
  const raw = r as any;
  let catId: string | null = null;
  let catSlug = r.product_type?.toLowerCase().replace(/\s+/g, '-') || "";
  let catName = r.product_type || "";

  if (raw.category) {
    if (typeof raw.category === "object") {
      const catIdStr = raw.category._id || "";
      if (catIdStr) {
        const cleanStr = catIdStr.toString();
        let hash = 0;
        for (let i = 0; i < cleanStr.length; i++) {
          hash = (hash << 5) - hash + cleanStr.charCodeAt(i);
          hash |= 0;
        }
        catId = String(Math.abs(hash));
      }
      catSlug = raw.category.slug || catSlug;
      catName = raw.category.name || catName;
    } else {
      const cleanStr = String(raw.category);
      let hash = 0;
      for (let i = 0; i < cleanStr.length; i++) {
        hash = (hash << 5) - hash + cleanStr.charCodeAt(i);
        hash |= 0;
      }
      catId = String(Math.abs(hash));
    }
  }

  if (!catId) {
    catId = r.product_type || "";
  }

  return {
    id: r.id,
    name: r.title,
    description: r.body_html?.replace(/<[^>]*>?/gm, '') || "",
    category_id: catId,
    category_slug: catSlug,
    category_name: catName,
    price: price,
    mrp: mrp,
    image: img,
    images: r.images && r.images.length > 0 ? r.images.map((i: any) => resolveImage(i.src)) : [img],
    rating: 0,
    ratingCount: 0,
    inStock: r.status === "active",
    badge: r.tags,
    ageRange: "All",
    offerPct: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    brand: r.vendor,
    weight: variant?.weight || 0.5,
    length: 10,
    breadth: 10,
    height: 10,
    shiprocketVariantId: variant?.id ? String(variant.id) : undefined,
    _id: r.id,
  };
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get("/categories");
      const collections = data.data?.collections || [];
      return collections.map((c: any) => {
        let parentNumericId: string | null = null;
        if (c.parent) {
          const parentIdStr = typeof c.parent === "object" ? c.parent._id : String(c.parent);
          const parentObj = collections.find((col: any) => col._id === parentIdStr);
          if (parentObj) {
            parentNumericId = String(parentObj.id);
          } else {
            const cleanStr = parentIdStr.toString();
            let hash = 0;
            for (let i = 0; i < cleanStr.length; i++) {
              hash = (hash << 5) - hash + cleanStr.charCodeAt(i);
              hash |= 0;
            }
            parentNumericId = String(Math.abs(hash));
          }
        }

        return {
          id: String(c.id),
          name: c.title,
          slug: c.handle,
          icon: null,
          image: c.image?.src || null,
          parent_id: parentNumericId,
          sort_order: c.sort_order || 0,
        };
      });
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
      return (data.data?.products as DbRow[] || []).map(mapRow);
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
