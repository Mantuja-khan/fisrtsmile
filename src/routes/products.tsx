import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useCatalog";
import { resolveImage, effectivePrice } from "@/data/products";
import { BRANDS } from "@/data/brands";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  Star,
  RotateCcw,
  Sparkles,
  Tag,
  Percent,
  ArrowUpDown,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Search = {
  q?: string;
  category?: string;
  brand?: string;
  badge?: string;
  age?: string;
  age_range?: string;
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
    age:
      typeof s.age === "string" ? s.age : typeof s.age_range === "string" ? s.age_range : undefined,
    age_range: typeof s.age_range === "string" ? s.age_range : undefined,
    sale: s.sale === true || s.sale === "true" ? true : undefined,
    minPrice:
      typeof s.minPrice === "number" ? s.minPrice : s.minPrice ? Number(s.minPrice) : undefined,
    maxPrice:
      typeof s.maxPrice === "number" ? s.maxPrice : s.maxPrice ? Number(s.maxPrice) : undefined,
    rating: typeof s.rating === "number" ? s.rating : s.rating ? Number(s.rating) : undefined,
    sort: (s.sort as Search["sort"]) ?? "popular",
  }),
  head: () => ({
    meta: [
      { title: "Shop Premium Toys Online — Trivoxo Toys" },
      {
        name: "description",
        content: "Explore our premium selection of toys, dolls, board games, and learning kits.",
      },
    ],
  }),
  component: ProductListPage,
});

const AGE_RANGES = [
  "0-18 month",
  "18-36 month",
  "3-5 year",
  "5-7 year",
  "7-9 year",
  "9-12 year",
  "12 +years",
];

const PRESET_PRICES = [
  { label: "Under ₹199", min: 0, max: 199 },
  { label: "₹200 - ₹399", min: 200, max: 399 },
  { label: "₹400 - ₹699", min: 400, max: 699 },
  { label: "₹700 - ₹999", min: 700, max: 999 },
  { label: "₹1,000 - ₹1,499", min: 1000, max: 1499 },
  { label: "Above ₹1,500", min: 1500, max: undefined },
];

function ProductListPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const uniqueBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) {
        brandSet.add(p.brand.trim());
      }
    });
    BRANDS.forEach((b) => brandSet.add(b));
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Sync expandedParents with current active category selection
  useEffect(() => {
    if (search.category && categories.length > 0) {
      const activeCat = categories.find((c) => c.slug === search.category);
      if (activeCat) {
        const parentId = activeCat.parent_id || activeCat.id;
        setExpandedParents((prev) => ({ ...prev, [parentId]: true }));
      }
    }
  }, [search.category, categories]);

  // Filter and Sort Products logic
  const filtered = useMemo(() => {
    let list = [...products];
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || (p.category_name ?? "").toLowerCase().includes(q),
      );
    }
    if (search.category) {
      const selectedCat = categories.find((c) => c.slug === search.category);
      if (selectedCat) {
        // If it's a parent category (i.e. has no parent_id), include products of its subcategories
        if (!selectedCat.parent_id) {
          const subcategoryIds = categories
            .filter((c) => c.parent_id === selectedCat.id)
            .map((c) => c.id);
          const allowedIds = [selectedCat.id, ...subcategoryIds];
          list = list.filter((p) => (p.category_id ? allowedIds.includes(p.category_id) : false));
        } else {
          // If it is a subcategory, match it directly
          list = list.filter(
            (p) => p.category_id === selectedCat.id || p.category_slug === search.category,
          );
        }
      } else {
        list = list.filter((p) => p.category_slug === search.category);
      }
    }
    if (search.brand) {
      list = list.filter((p) => p.brand?.toLowerCase() === search.brand?.toLowerCase());
    }
    if (search.badge) {
      const qBadge = search.badge.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.badge &&
          p.badge
            .toLowerCase()
            .split(",")
            .map((b) => b.trim())
            .includes(qBadge),
      );
    }
    if (search.age) {
      list = list.filter((p) => {
        if (!p.ageRange) return false;
        const ranges = String(p.ageRange)
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
        return ranges.includes(search.age!) || p.ageRange === "All";
      });
    }
    if (search.sale) list = list.filter((p) => p.isSale);
    if (search.minPrice !== undefined)
      list = list.filter((p) => effectivePrice(p.price, p.offerPct) >= search.minPrice!);
    if (search.maxPrice !== undefined)
      list = list.filter((p) => effectivePrice(p.price, p.offerPct) <= search.maxPrice!);
    if (search.rating) list = list.filter((p) => p.rating >= search.rating!);

    switch (search.sort) {
      case "price_asc":
        list.sort(
          (a, b) => effectivePrice(a.price, a.offerPct) - effectivePrice(b.price, b.offerPct),
        );
        break;
      case "price_desc":
        list.sort(
          (a, b) => effectivePrice(b.price, b.offerPct) - effectivePrice(a.price, a.offerPct),
        );
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => b.ratingCount - a.ratingCount);
    }
    return list;
  }, [products, search]);

  const update = (patch: Partial<Search>) => {
    navigate({
      search: (prev: Record<string, any>) => {
        const next = { ...prev, ...patch };
        // Clean undefined fields
        Object.keys(next).forEach((key) => {
          if (next[key as keyof Search] === undefined) {
            delete next[key as keyof Search];
          }
        });
        return next;
      },
    });
  };

  const clearAllFilters = () => {
    navigate({
      search: { sort: search.sort || "popular", q: search.q },
    });
    setMobileOpen(false);
  };

  // Determine active category names for displaying stats
  const activeCategoryName = categories.find((c) => c.slug === search.category)?.name;

  // Active Filters list for displaying dismissible chips
  const activeChips = useMemo(() => {
    const chips: { key: keyof Search; label: string; value: any }[] = [];
    if (search.category) {
      const cat = categories.find((c) => c.slug === search.category);
      chips.push({
        key: "category",
        label: `Category: ${cat?.name || search.category}`,
        value: undefined,
      });
    }
    if (search.brand) {
      chips.push({ key: "brand", label: `Brand: ${search.brand}`, value: undefined });
    }
    if (search.age) {
      chips.push({ key: "age", label: `Age: ${search.age}`, value: undefined });
    }
    if (search.minPrice !== undefined || search.maxPrice !== undefined) {
      let lbl = "Price: ";
      if (search.minPrice !== undefined && search.maxPrice !== undefined)
        lbl += `₹${search.minPrice} - ₹${search.maxPrice}`;
      else if (search.minPrice !== undefined) lbl += `≥ ₹${search.minPrice}`;
      else if (search.maxPrice !== undefined) lbl += `≤ ₹${search.maxPrice}`;
      chips.push({
        key: "minPrice",
        label: lbl,
        value: { minPrice: undefined, maxPrice: undefined },
      });
    }
    if (search.sale) {
      chips.push({ key: "sale", label: "On Sale Only", value: undefined });
    }
    if (search.badge) {
      chips.push({ key: "badge", label: `Tag: ${search.badge}`, value: undefined });
    }
    if (search.rating) {
      chips.push({ key: "rating", label: `Rating: ${search.rating}★ & up`, value: undefined });
    }
    return chips;
  }, [search, categories]);

  // Sidebar Filter Form Component
  const FiltersSidebarContent = ({ className = "", onClose = () => {} }) => {
    const [minInput, setMinInput] = useState(search.minPrice?.toString() || "");
    const [maxInput, setMaxInput] = useState(search.maxPrice?.toString() || "");

    useEffect(() => {
      setMinInput(search.minPrice?.toString() || "");
      setMaxInput(search.maxPrice?.toString() || "");
    }, [search.minPrice, search.maxPrice]);

    const applyCustomPrice = () => {
      const min = minInput ? Number(minInput) : undefined;
      const max = maxInput ? Number(maxInput) : undefined;
      update({ minPrice: min, maxPrice: max });
      onClose();
    };

    const parentCategories = categories.filter((c) => !c.parent_id);

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Active Header & Clear Filter */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-slate-800 stroke-[2.5]" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Filter By
            </span>
          </div>
          {activeChips.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
        </div>

        {/* Search Input Filter */}
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white focus-within:border-indigo-400 transition-all p-1 shadow-xs">
            <input
              type="text"
              placeholder="Search toys..."
              value={search.q || ""}
              onChange={(e) => update({ q: e.target.value || undefined })}
              className="w-full bg-transparent px-2.5 py-1.5 outline-none text-xs text-slate-800 placeholder:text-slate-400"
            />
            {search.q && (
              <button
                onClick={() => update({ q: undefined })}
                className="absolute right-2 top-2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* 1. Category Filter */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Collections
          </h4>
          <div className="flex flex-col gap-1 pr-1">
            <button
              onClick={() => {
                update({ category: undefined });
                onClose();
              }}
              className={`text-left text-xs py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                !search.category
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`size-2 rounded-full border ${!search.category ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}
              />
              All Categories
            </button>

            {parentCategories.map((parent) => {
              const children = categories.filter((c) => c.parent_id === parent.id);
              const hasChildren = children.length > 0;
              const isExpanded = !!expandedParents[parent.id];
              const isParentActive = search.category === parent.slug;
              const isAnyChildActive = children.some((child) => search.category === child.slug);
              const isActive = isParentActive || isAnyChildActive;

              return (
                <div key={parent.id} className="space-y-0.5">
                  <div
                    className={`flex items-center justify-between rounded-lg transition-all ${
                      isParentActive ? "bg-indigo-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <button
                      onClick={() => {
                        update({ category: parent.slug });
                        if (hasChildren) {
                          setExpandedParents((prev) => ({
                            ...prev,
                            [parent.id]: !prev[parent.id],
                          }));
                        }
                        onClose();
                      }}
                      className={`flex-1 text-left text-xs py-1.5 px-2 transition-colors cursor-pointer truncate flex items-center gap-2 ${
                        isParentActive
                          ? "text-indigo-600 font-bold"
                          : isActive
                            ? "text-slate-800 font-bold"
                            : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full border shrink-0 ${
                          isParentActive
                            ? "bg-indigo-600 border-indigo-600"
                            : isActive
                              ? "bg-slate-700 border-slate-700"
                              : "border-slate-300"
                        }`}
                      />
                      {parent.name}
                    </button>
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedParents((prev) => ({
                            ...prev,
                            [parent.id]: !prev[parent.id],
                          }));
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition mr-1 rounded-md"
                      >
                        <ChevronDown
                          className={`size-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="pl-4 ml-3 border-l border-slate-100/90 flex flex-col gap-0.5 mt-0.5">
                      {children.map((child) => {
                        const isChildActive = search.category === child.slug;
                        return (
                          <button
                            key={child.id}
                            onClick={() => {
                              update({ category: child.slug });
                              onClose();
                            }}
                            className={`text-left text-[11px] py-1 px-1.5 rounded-md transition-all cursor-pointer truncate flex items-center gap-1.5 ${
                              isChildActive
                                ? "text-indigo-600 font-extrabold bg-indigo-50/30"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full shrink-0 ${isChildActive ? "bg-indigo-600" : "bg-slate-300"}`}
                            />
                            {child.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Age Range Filter */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Age Range
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {AGE_RANGES.map((age) => {
              const isActive = search.age === age;
              return (
                <button
                  key={age}
                  onClick={() => {
                    update({ age: isActive ? undefined : age });
                    onClose();
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Brands Filter */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Brands
          </h4>
          <div className="flex flex-col gap-0.5 pr-1">
            {uniqueBrands.map((brand) => {
              const isActive = search.brand?.toLowerCase() === brand.toLowerCase();
              return (
                <button
                  key={brand}
                  onClick={() => {
                    update({ brand: isActive ? undefined : brand });
                    onClose();
                  }}
                  className={`text-left text-xs py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {isActive ? (
                    <CheckSquare className="size-4 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="size-4 text-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{brand}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Price Ranges Filter */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Price Range
          </h4>
          <div className="flex flex-col gap-0.5">
            {PRESET_PRICES.map((preset) => {
              const isActive = search.minPrice === preset.min && search.maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    if (isActive) {
                      update({ minPrice: undefined, maxPrice: undefined });
                    } else {
                      update({ minPrice: preset.min, maxPrice: preset.max });
                    }
                    onClose();
                  }}
                  className={`text-left text-xs py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {isActive ? (
                    <CheckSquare className="size-4 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="size-4 text-slate-300 shrink-0" />
                  )}
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Price Range Inputs */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 mt-1">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                className="w-full bg-slate-50 text-xs pl-4.5 pr-1.5 py-1.5 border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-lg text-slate-800 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
            <span className="text-slate-400 text-[10px] font-bold">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                placeholder="Max"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                className="w-full bg-slate-50 text-xs pl-4.5 pr-1.5 py-1.5 border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-lg text-slate-800 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
            <button
              onClick={applyCustomPrice}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        {/* 5. Special Deals Filter */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Deals & Offers
          </h4>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => {
                update({ sale: search.sale ? undefined : true });
                onClose();
              }}
              className={`text-left text-xs py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                search.sale
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {search.sale ? (
                <CheckSquare className="size-4 text-indigo-600 shrink-0" />
              ) : (
                <Square className="size-4 text-slate-300 shrink-0" />
              )}
              On Sale Items
            </button>

            {["Best Seller", "Trending"].map((b) => {
              const isActive = search.badge?.toLowerCase().trim() === b.toLowerCase().trim();
              return (
                <button
                  key={b}
                  onClick={() => {
                    update({ badge: isActive ? undefined : b });
                    onClose();
                  }}
                  className={`text-left text-xs py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {isActive ? (
                    <CheckSquare className="size-4 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="size-4 text-slate-300 shrink-0" />
                  )}
                  {b} Only
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Rating Filter */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Minimum Rating
          </h4>
          <div className="flex flex-col gap-0.5">
            {[4, 3, 2].map((r) => {
              const isActive = search.rating === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    update({ rating: isActive ? undefined : r });
                    onClose();
                  }}
                  className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {isActive ? (
                    <CheckSquare className="size-4 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="size-4 text-slate-300 shrink-0" />
                  )}
                  <span className="flex items-center gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${i < r ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                  </span>
                  <span className="text-[10px] text-slate-400">& Up</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Main 2-Column Grid */}
      <section className="container mx-auto px-4 max-w-7xl mt-8">
        <div className="flex gap-8 items-start">
          {/* Desktop Left Persistent Sidebar */}
          <aside className="hidden lg:block w-64 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs sticky top-[100px] h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar shrink-0">
            <FiltersSidebarContent />
          </aside>

          {/* Right Product Listings Column */}
          <div className="flex-1 w-full space-y-4">
            {/* Controls Bar (Sort Select and Mobile Filters Button) */}
            <div className="flex items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-xs">
              {/* Mobile filter trigger button */}
              <div className="lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl shadow-md transition cursor-pointer">
                      <SlidersHorizontal className="size-3.5" /> Filters
                      {activeChips.length > 0 && (
                        <span className="size-4.5 rounded-full bg-white text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                          {activeChips.length}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] overflow-y-auto custom-scrollbar pt-10"
                  >
                    <SheetHeader className="mb-4">
                      <SheetTitle className="text-left font-display text-lg uppercase tracking-wider text-slate-900">
                        Toy Filters
                      </SheetTitle>
                    </SheetHeader>
                    <FiltersSidebarContent onClose={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Display desktop active filter count */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  {filtered.length}
                </span>{" "}
                items
                {activeCategoryName && <span className="text-slate-300">|</span>}
                {activeCategoryName && (
                  <span className="text-slate-600 truncate max-w-[150px]">
                    {activeCategoryName}
                  </span>
                )}
              </div>

              {/* Sorting selector */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">
                  Sort By:
                </span>
                <div className="relative">
                  <select
                    value={search.sort}
                    onChange={(e) => update({ sort: e.target.value as Search["sort"] })}
                    className="text-xs font-extrabold border border-slate-200 bg-white rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none uppercase tracking-wider text-slate-700 cursor-pointer shadow-xs appearance-none"
                  >
                    <option value="popular">🔥 Popular</option>
                    <option value="price_asc">📈 Price: Low to High</option>
                    <option value="price_desc">📉 Price: High to Low</option>
                    <option value="rating">⭐ Highly Rated</option>
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Active Filters dismissal chips bar */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-3 md:p-3.5 shadow-2xs">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Active Filters:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() => update({ [chip.key]: chip.value })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold bg-white text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-indigo-300 rounded-full transition-all cursor-pointer uppercase tracking-wider shadow-3xs group"
                    >
                      {chip.label}
                      <X className="size-3 text-slate-400 group-hover:text-rose-500 stroke-[2.5] transition-colors" />
                    </button>
                  ))}
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest ml-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" /> Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Listing grid / State handler */}
            {isLoading ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-20 text-center shadow-xs">
                <div className="size-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-400">Loading our toy catalogue...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-xs max-w-2xl mx-auto">
                <div className="text-6xl mb-4 animate-bounce">🤖</div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  No toys match your criteria
                </h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                  We couldn't find any items matching those filters. Try clearing some options or
                  searches.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="transition-transform hover:-translate-y-1 duration-300"
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
