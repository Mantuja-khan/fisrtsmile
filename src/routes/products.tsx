import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useCatalog";
import { Star, Filter } from "lucide-react";
import { resolveImage } from "@/data/products";
import { BRANDS } from "@/data/brands";

type Search = {
  q?: string;
  category?: string;
  brand?: string;
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
    brand: typeof s.brand === "string" ? s.brand : undefined,
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const FilterContent = () => (
    <>
      <div>
        <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => { update({ category: undefined }); setMobileFiltersOpen(false); }}
            className={`block text-sm w-full text-left px-2 py-1 rounded-md hover:bg-muted ${!search.category ? "font-bold text-primary bg-primary/5" : "text-muted-foreground"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => { update({ category: c.slug }); setMobileFiltersOpen(false); }}
              className={`flex items-center text-sm w-full text-left px-2 py-1 rounded-md hover:bg-muted ${search.category === c.slug ? "font-bold text-primary bg-primary/5" : "text-muted-foreground"}`}
            >
              {c.image ? (
                <span className="inline-block size-5 rounded-full align-middle mr-2 border border-border overflow-hidden shrink-0">
                    <img src={resolveImage(c.image)} alt="" className="w-full h-full object-cover" />
                </span>
              ) : (
                <span className="inline-block align-middle mr-2 shrink-0">{c.icon ?? "🎁"}</span>
              )}
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>



      <div>
        <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground mt-2">Age Range</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => { update({ age: undefined }); setMobileFiltersOpen(false); }}
            className={`block text-sm w-full text-left px-2 py-1 rounded-md hover:bg-muted ${!search.age ? "font-bold text-primary bg-primary/5" : "text-muted-foreground"}`}
          >
            All Ages
          </button>
          {["0-2 years", "2-4 years", "4-7 years", "7-9 years", "9-12 years", "12+ years"].map((age) => (
            <button
              key={age}
              onClick={() => { update({ age }); setMobileFiltersOpen(false); }}
              className={`block text-sm w-full text-left px-2 py-1 rounded-md hover:bg-muted ${search.age === age ? "font-bold text-primary bg-primary/5" : "text-muted-foreground"}`}
            >
              {age}
            </button>
          ))}
        </div>
      </div>
      {(search.category || search.age) && (
         <button
          onClick={() => { navigate({ search: { sort: "popular" } }); setMobileFiltersOpen(false); }}
          className="text-xs text-primary font-bold underline pt-2"
        >
          Reset filters
        </button>
      )}
    </>
  );

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block bg-surface rounded-xl shadow-card p-5 h-max md:sticky md:top-16 space-y-6 self-start border border-border/50">
          <FilterContent />
        </aside>

        {/* Listing */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-surface rounded-xl shadow-card p-3.5 border border-border/50">
            <div className="text-sm font-medium flex items-center gap-2">
              <span className="bg-muted px-2 py-0.5 rounded font-bold">{filtered.length}</span> products
              {activeCategoryName && <span className="text-muted-foreground hidden sm:inline"> · {activeCategoryName}</span>}
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile Filter Trigger */}
              <button 
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm font-bold border border-border active:scale-95 transition"
              >
                <Filter className="size-4" /> 
                Filter{(search.category || search.age) ? ` (${[search.category, search.age].filter(Boolean).length})` : ""}
              </button>

              <select
                value={search.sort}
                onChange={(e) => update({ sort: e.target.value as Search["sort"] })}
                className="text-sm font-medium border border-border bg-white rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="popular">Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Ratings</option>
              </select>
            </div>
          </div>

          {/* Collapsible Mobile Filter Panel */}
          {mobileFiltersOpen && (
            <div className="md:hidden mb-4 bg-white border border-border rounded-xl shadow-pop p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                <h4 className="font-bold text-lg">Filters</h4>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-muted-foreground p-1">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <FilterContent />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="bg-surface rounded-xl shadow-card p-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface rounded-xl shadow-card p-10 text-center">
              <div className="text-5xl mb-2">🔍</div>
              <p className="font-semibold">No toys match your filters</p>
              <p className="text-sm text-muted-foreground">Try clearing some filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
