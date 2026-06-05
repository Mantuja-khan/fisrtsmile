import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/services/api";
import { resolveImage, effectivePrice, type Product } from "@/data/products";
import { useAuth } from "@/store/auth";

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
    () => Array.from(new Set([...cart.map((c) => String(c.id)), ...wishlist.map((w) => String(w))])),
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
        const productsList = (data.data?.products || []) as any[];
        const map: Record<string, Product> = {};
        productsList
          .filter((p) => ids.includes(String(p.id)) || ids.includes(String(p._id)))
          .forEach((r) => {
            const variant = r.variants?.[0];
            const price = variant?.price ? Number(variant.price) : 0;
            const mrp = variant?.compare_at_price ? Number(variant.compare_at_price) : price;
            const img = resolveImage(r.image?.src);
            const resolvedProduct = {
              id: String(r.id),
              name: r.title,
              description: r.body_html?.replace(/<[^>]*>?/gm, "") || "",
              category_id: r.product_type,
              price: price,
              mrp: mrp,
              image: img,
              images:
                r.images && r.images.length > 0
                  ? r.images.map((pImg: any) => resolveImage(pImg?.src || pImg))
                  : [img],
              rating: 0,
              ratingCount: 0,
              inStock: r.status === "active",
              badge: r.tags,
              ageRange: "All",
              offerPct: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
              shiprocketVariantId: variant?.id ? String(variant.id) : undefined,
              _id: String(r._id || r.id),
              brand: r.vendor,
            };
            map[String(r.id)] = resolvedProduct;
            if (r._id) {
              map[String(r._id)] = resolvedProduct;
            }
          });
        setProductMap(map);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [ids.join(",")]);

  const { user } = useAuth();
  const [isSynced, setIsSynced] = useState(false);
  const [prevUser, setPrevUser] = useState<any>(null);

  // Sync state and handle logout transition
  useEffect(() => {
    if (prevUser && !user) {
      // User logged out
      setCart([]);
      setIsSynced(false);
    }
    setPrevUser(user);
  }, [user, prevUser]);

  // Load and merge user cart on login
  useEffect(() => {
    if (!user) return;

    api
      .get("/auth/cart")
      .then(({ data }) => {
        const dbCart = (data.cart || []) as CartItem[];
        setCart((currentLocalCart) => {
          const mergedMap = new Map<string, number>();

          // 1. Put database items first
          dbCart.forEach((item) => {
            mergedMap.set(String(item.id), Number(item.qty));
          });

          // 2. Add local guest items, summing the quantity if already present
          currentLocalCart.forEach((item) => {
            const currentQty = mergedMap.get(String(item.id)) || 0;
            mergedMap.set(String(item.id), currentQty + Number(item.qty));
          });

          const mergedCart = Array.from(mergedMap.entries()).map(([id, qty]) => ({
            id,
            qty,
          }));

          return mergedCart;
        });
        setIsSynced(true);
      })
      .catch((err) => console.error("Error loading backend cart:", err));
  }, [user]);

  // Save cart to backend when it changes (only after sync has completed)
  useEffect(() => {
    if (!user || !isSynced) return;

    api
      .post("/auth/cart", { cart })
      .catch((err) => console.error("Error updating backend cart:", err));
  }, [cart, user, isSynced]);

  const value = useMemo<ShopState>(() => {
    const cartItems: CartProduct[] = cart
      .map((c) => {
        const product = productMap[String(c.id)];
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
      cartCount: cartItems.reduce((acc, i) => acc + i.qty, 0),
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
