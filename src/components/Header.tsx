import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Menu, Grid3x3, ChevronDown, Headphones } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { effectivePrice, resolveImage } from "@/data/products";
import { HighlightText } from "@/components/HighlightText";
import { BRANDS } from "@/data/brands";
import logo from "@/assets/firstsmile_logo.png";

export function Header() {
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useShop();

  const { user, signOut } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  const [catOpen, setCatOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [mobileAgeOpen, setMobileAgeOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (catRef.current && !catRef.current.contains(target)) setCatOpen(false);
      if (brandRef.current && !brandRef.current.contains(target)) setBrandOpen(false);
      if (ageRef.current && !ageRef.current.contains(target)) setAgeOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Live search results
  const searchResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(term) ||
        (p.category_name ?? "").toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [q, products]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined } as never });
    setSearchOpen(false);
  };

  const name = user?.full_name || user?.email?.split("@")[0] || "User";

  const renderResults = () => {
    if (!searchOpen || !q.trim()) return null;
    return (
      <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-surface text-foreground rounded-md shadow-pop max-h-96 overflow-auto border border-border">
        {searchResults.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No products match "{q}"</div>
        ) : (
          <ul>
            {searchResults.map((p) => {
              const fp = effectivePrice(p.price, p.offerPct);
              return (
                <li key={p.id}>
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    onClick={() => { setSearchOpen(false); setQ(""); }}
                    className="flex items-center gap-3 p-2 transition"
                  >
                    <img src={resolveImage(p.image)} alt={p.name} className="size-12 rounded-md object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">
                        <HighlightText text={p.name} highlight={q} />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{p.category?.name ?? "Toys"}</div>
                    </div>
                    <div className="text-sm font-bold text-primary shrink-0">₹{fp.toLocaleString("en-IN")}</div>
                  </Link>
                </li>
              );
            })}
            <li className="border-t border-border">
              <button
                onMouseDown={(e) => { e.preventDefault(); onSearch(e as unknown as React.FormEvent); }}
                className="w-full text-left p-2.5 text-sm text-primary font-semibold"
              >
                See all results for "{q}" →
              </button>
            </li>
          </ul>
        )}
      </div>
    );
  };

  return (
    <header className="flex flex-col w-full">
      {/* Top Royal Blue Bar */}
      <div className="bg-[#1D4ED8] text-white relative z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 md:py-4">

          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="First Smile" className="h-8 md:h-12 w-auto object-contain" />
          </Link>

          {/* Center Search */}
          <div className="flex-1 max-w-[48rem] hidden md:flex items-center relative ml-6">
            <div ref={searchRef} className="flex-1 relative">
              <form onSubmit={onSearch} className="w-full flex">
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search the store"
                  className="w-full px-5 py-2.5 text-sm text-black bg-white rounded-l-full outline-none"
                />
                <button type="submit" className="px-6 bg-[#FFC107] text-[#1D4ED8] rounded-r-full flex items-center justify-center">
                  <Search className="size-5 font-bold" />
                </button>
              </form>
              {renderResults()}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 ml-auto">
            {/* About & Contact Links */}
            <div className="hidden md:flex items-center gap-4 border-r border-white/20 pr-5 shrink-0">
              <Link to="/about" className="font-bold text-sm text-white hover:text-[#FFC107] transition-colors">About</Link>
              <Link to="/contact" className="font-bold text-sm text-white hover:text-[#FFC107] transition-colors">Contact</Link>
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative flex flex-col items-center justify-center gap-1 shrink-0">
              <div className="relative">
                <ShoppingCart className="size-7" />
                <span className="absolute -top-1.5 -right-2 bg-white text-[#1D4ED8] text-[11px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center border border-[#1D4ED8]">
                  {cartCount}
                </span>
              </div>
              <span className="text-[11px] font-semibold hidden md:block opacity-0 h-0">Cart</span>
            </Link>

            {/* User Login/Account */}
            <div className="relative hidden md:block shrink-0">
              <Link to="/account" className="flex flex-col items-center justify-center gap-1">
                <User className="size-6" />
                <span className="text-[11px] font-semibold">{user ? name : "Sign In"}</span>
              </Link>
            </div>

            {/* Mobile Search Toggle */}
            <button className="md:hidden p-2 text-white" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="size-6" />
            </button>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-white" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="size-6" />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 py-3 bg-[#1D4ED8] border-t border-white/20 relative z-50">
            <form onSubmit={onSearch} className="w-full flex relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the store"
                autoFocus
                className="w-full px-4 py-2.5 text-sm text-black bg-white rounded-full outline-none"
              />
              <button type="submit" className="absolute right-12 top-1 bottom-1 px-3 text-[#1D4ED8] flex items-center justify-center">
                <Search className="size-5" />
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-2 top-1 bottom-1 px-3 text-muted-foreground flex items-center justify-center font-bold">
                ✕
              </button>
            </form>
            {q.trim() && (
              <div className="absolute top-full left-4 right-4 mt-0.5 bg-white text-black rounded-lg shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto border border-border">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No results found</div>
                ) : (
                  searchResults.map(p => (
                    <Link key={p.id} to="/product/$id" params={{ id: p.id }} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 p-2 border-b border-border last:border-0">
                      <img src={resolveImage(p.image)} className="w-10 h-10 object-cover rounded" />
                      <span className="text-sm font-semibold truncate flex-1">
                        <HighlightText text={p.name} highlight={q} />
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Content */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface text-foreground border-t border-border absolute w-full z-50 shadow-pop max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col">
              <Link to="/products" className="p-4 border-b border-border flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Grid3x3 className="size-5 text-primary" /> <span className="font-semibold">All Categories</span>
              </Link>

              {/* Shop by Age collapsible */}
              <div className="border-b border-border flex flex-col">
                <button 
                  onClick={() => setMobileAgeOpen(!mobileAgeOpen)}
                  className="w-full p-4 flex items-center justify-between font-semibold text-left"
                >
                  <span>Shop by Age</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${mobileAgeOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileAgeOpen && (
                  <div className="bg-slate-50/60 border-t border-border/50 flex flex-col pl-8 pr-4 py-2 gap-2.5">
                    {["0-2 years", "2-4 years", "4-7 years", "7-9 years", "9-12 years", "12+ years"].map(age => (
                      <Link 
                        key={age}
                        to="/products" 
                        search={{ age } as never}
                        className="py-1 text-sm text-slate-600 hover:text-primary transition-colors font-medium"
                        onClick={() => { setMobileMenuOpen(false); setMobileAgeOpen(false); }}
                      >
                        {age}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop by Brand collapsible */}
              <div className="border-b border-border flex flex-col">
                <button 
                  onClick={() => setMobileBrandOpen(!mobileBrandOpen)}
                  className="w-full p-4 flex items-center justify-between font-semibold text-left"
                >
                  <span>Shop by Brand</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${mobileBrandOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileBrandOpen && (
                  <div className="bg-slate-50/60 border-t border-border/50 grid grid-cols-2 pl-8 pr-4 py-3 gap-x-4 gap-y-2.5">
                    {BRANDS.map(brand => (
                      <Link 
                        key={brand}
                        to="/products" 
                        search={{ brand } as never}
                        className="py-1 text-sm text-slate-600 hover:text-primary transition-colors font-medium truncate"
                        onClick={() => { setMobileMenuOpen(false); setMobileBrandOpen(false); }}
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/coupons" className="p-4 border-b border-border font-semibold text-[#1D4ED8]" onClick={() => setMobileMenuOpen(false)}>Coupons</Link>
              <Link to="/about" className="p-4 border-b border-border font-semibold" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to="/contact" className="p-4 border-b border-border font-semibold" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom White Bar */}
      <div className="hidden md:block md:sticky md:top-0 z-40 border-b border-border bg-white text-[#1D4ED8] shadow-sm">
        <div className="container mx-auto flex items-center justify-center gap-6 xl:gap-8 px-4 py-3 text-sm font-bold relative">

          <div
            ref={catRef}
            className="pb-2 -mb-2"
            onMouseEnter={() => {
              setCatOpen(true);
              setAgeOpen(false);
              setProfileOpen(false);
              if (categories.length > 0 && !activeCatId) {
                const root = categories.find(c => !c.parent_id);
                if (root) setActiveCatId(root.id);
              }
            }}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              onClick={() => {
                setCatOpen((v) => !v);
                setAgeOpen(false);
                setProfileOpen(false);
                if (!catOpen && categories.length > 0) {
                  const root = categories.find(c => !c.parent_id);
                  if (root) setActiveCatId(root.id);
                }
              }}
              className="flex items-center gap-2 uppercase tracking-wide font-bold text-[#1D4ED8] hover:opacity-80 transition"
            >
              <Grid3x3 className="size-5" /> Categories <ChevronDown className={`size-4 transition ${catOpen ? "rotate-180" : ""}`} />
            </button>
            {catOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-[95vw] max-w-7xl bg-surface text-foreground rounded-xl shadow-pop border border-border overflow-hidden z-50 flex flex-col">
                <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  {categories.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 text-center w-full flex items-center justify-center">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                      {categories.filter(cat => !cat.parent_id).map((parent) => {
                        const children = categories.filter(c => c.parent_id === parent.id);
                        return (
                          <div key={parent.id} className="flex flex-col">
                            {/* Column Header: Parent Category */}
                            <Link
                              to="/subcategories/$slug"
                              params={{ slug: parent.slug } as never}
                              onClick={() => setCatOpen(false)}
                              className="flex items-center gap-2 pb-2 border-b border-border/60 group hover:opacity-80 transition-all mb-2.5"
                            >
                              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded overflow-hidden bg-muted/10">
                                {parent.image ? (
                                  <img src={resolveImage(parent.image)} alt={parent.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-base">{parent.icon ?? "🎁"}</span>
                                )}
                              </span>
                              <span className="text-[13px] font-extrabold uppercase tracking-wider text-foreground group-hover:text-primary leading-tight line-clamp-1">
                                {parent.name}
                              </span>
                            </Link>

                            {/* Subcategories List */}
                            <div className="flex flex-col gap-2 pl-0.5">
                              {children.length > 0 ? (
                                children.map(child => (
                                  <Link
                                    key={child.id}
                                    to="/products"
                                    search={{ category: child.slug } as never}
                                    onClick={() => setCatOpen(false)}
                                    className="text-xs font-semibold text-muted-foreground hover:text-[#1D4ED8] hover:translate-x-1 transition-all flex items-center gap-2 leading-snug group/item"
                                  >
                                    <span className="opacity-50 text-[9px] shrink-0 group-hover/item:opacity-100">•</span>
                                    <span className="truncate">{child.name}</span>
                                  </Link>
                                ))
                              ) : (
                                <Link
                                  to="/subcategories/$slug"
                                  params={{ slug: parent.slug } as never}
                                  onClick={() => setCatOpen(false)}
                                  className="text-xs font-medium italic text-muted-foreground/50 hover:text-primary pl-4 transition-colors"
                                >
                                  Browse Category
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Link
                  to="/products"
                  onClick={() => setCatOpen(false)}
                  className="block border-t border-border bg-muted/10 p-2.5 text-center text-xs md:text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors uppercase tracking-wider"
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>

            <div
              ref={brandRef}
              className="relative pb-2 -mb-2"
              onMouseEnter={() => {
                setBrandOpen(true);
                setAgeOpen(false);
                setCatOpen(false);
                setProfileOpen(false);
              }}
              onMouseLeave={() => setBrandOpen(false)}
            >
              <button
                onClick={() => { setBrandOpen((v) => !v); setAgeOpen(false); setCatOpen(false); setProfileOpen(false); }}
                className="uppercase tracking-wide flex items-center gap-1 font-bold text-[#1D4ED8] hover:opacity-80 transition"
              >
                BRANDS <ChevronDown className={`size-4 transition ${brandOpen ? "rotate-180" : ""}`} />
              </button>
              {brandOpen && (
                <div className="absolute left-0 top-full mt-0 w-[420px] bg-surface text-foreground rounded-xl shadow-pop border border-border overflow-hidden z-50">
                  <div className="p-2 grid grid-cols-2 gap-1 max-h-96 overflow-y-auto custom-scrollbar">
                    {BRANDS.map((b) => (
                      <Link
                        key={b}
                        to="/products"
                        search={{ brand: b } as never}
                        onClick={() => setBrandOpen(false)}
                        className="block px-3 py-2 hover:bg-muted rounded text-sm font-medium transition"
                      >
                        {b}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              ref={ageRef}
              className="relative pb-2 -mb-2"
              onMouseEnter={() => {
                setAgeOpen(true);
                setBrandOpen(false);
                setCatOpen(false);
                setProfileOpen(false);
              }}
              onMouseLeave={() => setAgeOpen(false)}
            >
              <button
                onClick={() => { setAgeOpen((v) => !v); setCatOpen(false); setProfileOpen(false); }}
                className="uppercase tracking-wide flex items-center gap-1"
              >
                SHOP BY AGE <ChevronDown className={`size-4 transition ${ageOpen ? "rotate-180" : ""}`} />
              </button>
              {ageOpen && (
                <div className="absolute left-0 top-full mt-0 w-48 bg-surface text-foreground rounded-xl shadow-pop border border-border overflow-hidden z-50">
                  <div className="p-2 flex flex-col gap-1">
                    {["0-2 years", "2-4 years", "4-7 years", "7-9 years", "9-12 years", "12+ years"].map((age) => (
                      <Link
                        key={age}
                        to="/products"
                        search={{ age: age } as never}
                        onClick={() => setAgeOpen(false)}
                        className="block px-3 py-2 rounded text-sm font-medium"
                      >
                        {age}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/products" search={{ sale: true } as never} className="uppercase tracking-wide font-extrabold text-emerald-600">SALE</Link>
            {user && <Link to="/account" search={{ view: 'orders' } as any} className="uppercase tracking-wide">MY ORDERS</Link>}
            <Link to="/coupons" className="uppercase tracking-wide text-[#1D4ED8]">COUPONS</Link>


        </div>
      </div>
    </header>
  );
}
