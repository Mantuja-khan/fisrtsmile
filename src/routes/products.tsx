import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useCatalog";
import { resolveImage, effectivePrice } from "@/data/products";

type Search = {
  q?: string;
  category?: string;
  brand?: string;
  badge?: string;
  age?: string;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: "popular" | "price_asc" | "price_desc" | "rating";
};

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    brand: typeof s.brand === "string" ? s.brand : undefined,
    badge: typeof s.badge === "string" ? s.badge : undefined,
    age: typeof s.age === "string" ? s.age : undefined,
    sale: s.sale === true || s.sale === "true" ? true : undefined,
    minPrice: typeof s.minPrice === "number" ? s.minPrice : undefined,
    maxPrice: typeof s.maxPrice === "number" ? s.maxPrice : undefined,
    rating: typeof s.rating === "number" ? s.rating : undefined,
    sort: (s.sort as Search["sort"]) ?? "popular",
  }),
  head: () => ({
    meta: [
      { title: "All Toys — Shop Online | First Smile" },
      { name: "description", content: "Browse our complete toy catalog." },
    ],
  }),
  component: ProductListPage,
});

function ProductListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category_name ?? "").toLowerCase().includes(q),
      );
    }
    if (search.category) list = list.filter((p) => p.category_slug === search.category);
    if (search.brand) list = list.filter((p) => p.brand === search.brand);
    if (search.badge) {
      const qBadge = search.badge.toLowerCase().trim();
      list = list.filter((p) =>
        p.badge && p.badge.toLowerCase().split(",").map(b => b.trim()).includes(qBadge)
      );
    }
    if (search.age) list = list.filter((p) => p.ageRange === search.age);
    if (search.sale) list = list.filter((p) => p.isSale);
    if (search.minPrice !== undefined) list = list.filter((p) => effectivePrice(p.price, p.offerPct) >= search.minPrice!);
    if (search.maxPrice !== undefined) list = list.filter((p) => effectivePrice(p.price, p.offerPct) <= search.maxPrice!);
    if (search.rating) list = list.filter((p) => p.rating >= search.rating!);
    switch (search.sort) {
      case "price_asc": list.sort((a, b) => effectivePrice(a.price, a.offerPct) - effectivePrice(b.price, b.offerPct)); break;
      case "price_desc": list.sort((a, b) => effectivePrice(b.price, b.offerPct) - effectivePrice(a.price, a.offerPct)); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => b.ratingCount - a.ratingCount);
    }
    return list;
  }, [products, search]);

  const update = (patch: Partial<Search>) => navigate({ search: { ...search, ...patch } });
  const activeCategoryName = categories.find((c) => c.slug === search.category)?.name;

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-surface rounded-xl shadow-card p-3.5 border border-border/50">
          <div className="text-sm font-medium flex items-center gap-2">
            <span className="bg-muted px-2 py-0.5 rounded   ">{filtered.length}</span> products
            {activeCategoryName && <span className="text-muted-foreground hidden sm:inline"> · {activeCategoryName}</span>}
            {search.sale && <span className="text-emerald-600    hidden sm:inline"> · Sale Area</span>}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={search.sort}
              onChange={(e) => update({ sort: e.target.value as Search["sort"] })}
              className="text-sm font-medium border border-border bg-white rounded-none px-2.5 py-1.5 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Ratings</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-surface rounded-xl shadow-card p-10 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface rounded-xl shadow-card p-10 text-center">
            <div className="text-5xl mb-2">🔍</div>
            <p className="font-semibold">No toys match your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
