import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/services/api";
import { resolveImage, effectivePrice, type Product } from "@/data/products";

type CartItem = { id: string; qty: number };

type CartProduct = CartItem & { product: Product };

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearCart: () => void;
  cartCount: number;
  cartItems: CartProduct[];
  subtotal: number;
};

const ShopCtx = createContext<ShopState | null>(null);

const read = <T,>(k: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => read("ts_cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => read("ts_wishlist", []));
  const [productMap, setProductMap] = useState<Record<string, Product>>({});

  useEffect(() => {
    localStorage.setItem("ts_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("ts_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Resolve cart/wishlist products from DB
  const ids = useMemo(
    () => Array.from(new Set([...cart.map((c) => c.id), ...wishlist])),
    [cart, wishlist],
  );
  useEffect(() => {
    if (ids.length === 0) {
      setProductMap({});
      return;
    }

    api
      .get("/products")
      .then(({ data }) => {
        if (!data) return;
        const products = data as any[];
        const map: Record<string, Product> = {};
        products
          .filter((p) => ids.includes(p._id))
          .forEach((r) => {
            const img = resolveImage(r.image);
            map[r._id] = {
              id: r._id,
              name: r.name,
              description: r.description ?? "",
              category_id: r.category?._id || r.category,
              price: Number(r.price),
              mrp: Number(r.mrp),
              image: img,
              images:
                r.images && r.images.length > 0
                  ? r.images.map((pImg: string) => resolveImage(pImg))
                  : [img],
              rating: Number(r.rating),
              ratingCount: r.rating_count,
              inStock: r.in_stock,
              badge: r.badge,
              ageRange: r.age_range ?? "All",
              offerPct: r.offer_pct ?? 0,
              shiprocketVariantId: r.shiprocketVariantId,
              _id: r._id,
            };
          });
        setProductMap(map);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [ids.join(",")]);

  const value = useMemo<ShopState>(() => {
    const cartItems: CartProduct[] = cart
      .map((c) => {
        const product = productMap[c.id];
        return product ? { ...c, product } : null;
      })
      .filter((x): x is CartProduct => !!x);

    const subtotal = cartItems.reduce(
      (s, i) => s + effectivePrice(i.product.price, i.product.offerPct) * i.qty,
      0,
    );

    return {
      cart,
      wishlist,
      cartItems,
      subtotal,
      cartCount: cart.length,
      addToCart: (id, qty = 1) =>
        setCart((c) => {
          const ex = c.find((i) => i.id === id);
          if (ex) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
          return [...c, { id, qty }];
        }),
      removeFromCart: (id) => setCart((c) => c.filter((i) => i.id !== id)),
      setQty: (id, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i)),
        ),
      toggleWishlist: (id) =>
        setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
      isInWishlist: (id) => wishlist.includes(id),
      clearCart: () => setCart([]),
    };
  }, [cart, wishlist, productMap]);

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export const useShop = () => {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};
