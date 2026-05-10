import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useCatalog";
import { Star } from "lucide-react";

type Search = {
  q?: string;
  category?: string;
  badge?: string;
  age?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: "popular" | "price_asc" | "price_desc" | "rating";
};

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    badge: typeof s.badge === "string" ? s.badge : undefined,
    age: typeof s.age === "string" ? s.age : undefined,
    minPrice: typeof s.minPrice === "number" ? s.minPrice : undefined,
    maxPrice: typeof s.maxPrice === "number" ? s.maxPrice : undefined,
    rating: typeof s.rating === "number" ? s.rating : undefined,
    sort: (s.sort as Search["sort"]) ?? "popular",
  }),
  head: () => ({
    meta: [
      { title: "All Toys — Shop Online | ToyKart" },
      { name: "description", content: "Browse our complete toy catalog. Filter by category, price and rating." },
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
    if (search.badge) list = list.filter((p) => p.badge === search.badge);
    if (search.age) list = list.filter((p) => p.ageRange === search.age);
    if (search.minPrice !== undefined) list = list.filter((p) => p.price >= search.minPrice!);
    if (search.maxPrice !== undefined) list = list.filter((p) => p.price <= search.maxPrice!);
    if (search.rating) list = list.filter((p) => p.rating >= search.rating!);
    switch (search.sort) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => b.ratingCount - a.ratingCount);
    }
    return list;
  }, [products, search]);

  const update = (patch: Partial<Search>) => navigate({ search: { ...search, ...patch } });
  const activeCategoryName = categories.find((c) => c.slug === search.category)?.name;

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        {/* Filters */}
        <aside className="bg-surface rounded-xl shadow-card p-4 h-max md:sticky md:top-24 space-y-5">
          <div>
            <h3 className="font-bold mb-2">Category</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => update({ category: undefined })}
                className={`block text-sm ${!search.category ? "font-bold text-primary" : "text-muted-foreground"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => update({ category: c.slug })}
                  className={`block text-sm text-left ${search.category === c.slug ? "font-bold text-primary" : "text-muted-foreground"}`}
                >
                  {c.icon ?? "🎁"} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Age Range</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => update({ age: undefined })}
                className={`block text-sm ${!search.age ? "font-bold text-primary" : "text-muted-foreground"}`}
              >
                All Ages
              </button>
              {["0-2 years", "3-5 years", "6-8 years", "9-12 years", "13+ years"].map((age) => (
                <button
                  key={age}
                  onClick={() => update({ age })}
                  className={`block text-sm text-left ${search.age === age ? "font-bold text-primary" : "text-muted-foreground"}`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Price</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={search.minPrice ?? ""}
                onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-2 py-1.5 text-sm border border-input rounded"
              />
              <input
                type="number"
                placeholder="Max"
                value={search.maxPrice ?? ""}
                onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-2 py-1.5 text-sm border border-input rounded"
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Rating</h3>
            <div className="space-y-1.5">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => update({ rating: search.rating === r ? undefined : r })}
                  className={`flex items-center gap-1 text-sm ${search.rating === r ? "font-bold text-primary" : "text-muted-foreground"}`}
                >
                  {r}+ <Star className="size-3 fill-rating text-rating" /> & up
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate({ search: { sort: "popular" } })}
            className="text-xs text-primary font-semibold underline"
          >
            Clear filters
          </button>
        </aside>

        {/* Listing */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-surface rounded-xl shadow-card p-3">
            <div className="text-sm">
              <span className="font-bold">{filtered.length}</span> products
              {search.q && <span className="text-muted-foreground"> · "{search.q}"</span>}
              {activeCategoryName && <span className="text-muted-foreground"> · {activeCategoryName}</span>}
            </div>
            <select
              value={search.sort}
              onChange={(e) => update({ sort: e.target.value as Search["sort"] })}
              className="text-sm border border-input rounded px-2 py-1.5"
            >
              <option value="popular">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {isLoading ? (
            <div className="bg-surface rounded-xl shadow-card p-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface rounded-xl shadow-card p-10 text-center">
              <div className="text-5xl mb-2">🔍</div>
              <p className="font-semibold">No toys match your filters</p>
              <p className="text-sm text-muted-foreground">Try clearing some filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
