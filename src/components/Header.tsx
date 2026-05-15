import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Menu, Grid3x3, ChevronDown, Headphones, Heart, ChevronRight, X, Sparkles } from "lucide-react";
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
  const [sidebarSearchOpen, setSidebarSearchOpen] = useState(false);
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const catRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Scroll lock for side drawer
  useEffect(() => {
    if (sidebarSearchOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarSearchOpen, mobileMenuOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (catRef.current && !catRef.current.contains(target)) setCatOpen(false);
      if (brandRef.current && !brandRef.current.contains(target)) setBrandOpen(false);
      if (ageRef.current && !ageRef.current.contains(target)) setAgeOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Smart Reveal Header scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the very top
      if (currentScrollY < 50) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Check direction
      if (currentScrollY > lastScrollY) {
        // Scrolling down (viewport moves down) -> Hide header
        setIsVisible(false);
      } else {
        // Scrolling up (viewport moves back to top) -> Show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

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

  const name = user?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <header className={`flex flex-col w-full sticky top-0 z-50 transition-all duration-300 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}>

        {/* Tiny Top Legal Header - Visible on Large Screens Only */}
        <div className="hidden lg:block w-full bg-white text-slate-900 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-100 relative z-50 shadow-xs">
          <div className="container mx-auto flex items-center justify-end gap-6 py-2 px-4">
            <Link to="/policies/legal" className="hover:text-rose-600 transition-colors">Legal Notice</Link>
            <Link to="/policies/terms" className="hover:text-rose-600 transition-colors">Terms & Conditions</Link>
            <Link to="/policies/privacy" className="hover:text-rose-600 transition-colors">Privacy Policy</Link>
            <Link to="/policies/returns" className="hover:text-rose-600 transition-colors">Refund Policy</Link>
          </div>
        </div>

        {/* Consolidated Light Blue Bar */}
        <div className="bg-[#BFDDF0] text-slate-900 relative shadow-md transition-all">
          <div className="container mx-auto flex items-center justify-between gap-2 px-4 py-3 md:py-4">

            {/* Left: Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img src={logo} alt="First Smile" className="h-8 md:h-11 w-auto object-contain" />
            </Link>

            {/* Center: Desktop Consolidated Navigation */}
            <nav className="hidden lg:flex items-center gap-1 mx-auto">

              {/* Categories Button & Hover Dropdown */}
              <div
                ref={catRef}
                className="h-full relative"
                onMouseEnter={() => {
                  setCatOpen(true);
                  setAgeOpen(false);
                  setBrandOpen(false);
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
                    setBrandOpen(false);
                    if (!catOpen && categories.length > 0) {
                      const root = categories.find(c => !c.parent_id);
                      if (root) setActiveCatId(root.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${catOpen
                    ? "bg-slate-900 text-[#BFDDF0] shadow-sm"
                    : "text-slate-800 hover:bg-white/30 hover:text-slate-950"
                    }`}
                >
                  <Grid3x3 className="size-3.5 shrink-0" /> Categories <ChevronDown className={`size-3 transition ${catOpen ? "rotate-180" : ""}`} />
                </button>

                {catOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                    <div className="w-64 bg-white text-foreground rounded-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col py-1.5">
                      {categories.filter(c => !c.parent_id).map((parent) => (
                        <Link
                          key={parent.id}
                          to="/subcategories/$slug"
                          params={{ slug: parent.slug } as never}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#BFDDF0]/25 text-slate-700 hover:text-slate-950 font-extrabold text-[11px] tracking-wider uppercase transition-all border-b border-slate-50 last:border-0"
                        >
                          <span className="size-4 flex items-center justify-center shrink-0">
                            {parent.icon ?? "🎁"}
                          </span>
                          <span>{parent.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Brands Skewed Dropdown */}
              <div
                ref={brandRef}
                className="h-full relative"
                onMouseEnter={() => {
                  setBrandOpen(true);
                  setAgeOpen(false);
                  setCatOpen(false);
                }}
                onMouseLeave={() => setBrandOpen(false)}
              >
                <button
                  onClick={() => { setBrandOpen((v) => !v); setAgeOpen(false); setCatOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${brandOpen
                    ? "bg-slate-900 text-[#BFDDF0] shadow-sm"
                    : "text-slate-800 hover:bg-white/30 hover:text-slate-950"
                    }`}
                >
                  Brands <ChevronDown className={`size-3 transition ${brandOpen ? "rotate-180" : ""}`} />
                </button>
                {brandOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="w-[400px] bg-white text-foreground rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                      <div className="p-3 grid grid-cols-2 gap-1 max-h-96 overflow-y-auto custom-scrollbar">
                        {BRANDS.map((b) => (
                          <Link
                            key={b}
                            to="/products"
                            search={{ brand: b } as never}
                            onClick={() => setBrandOpen(false)}
                            className="block px-4 py-2.5 hover:bg-[#BFDDF0]/20 hover:text-slate-900 rounded-xl text-[12px] font-bold uppercase tracking-wider transition"
                          >
                            {b}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shop by Age Skewed Dropdown */}
              <div
                ref={ageRef}
                className="h-full relative"
                onMouseEnter={() => {
                  setAgeOpen(true);
                  setBrandOpen(false);
                  setCatOpen(false);
                }}
                onMouseLeave={() => setAgeOpen(false)}
              >
                <button
                  onClick={() => { setAgeOpen((v) => !v); setBrandOpen(false); setCatOpen(false); }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${ageOpen
                    ? "bg-slate-900 text-[#BFDDF0] shadow-sm"
                    : "text-slate-800 hover:bg-white/30 hover:text-slate-950"
                    }`}
                >
                  Age <ChevronDown className={`size-3 transition ${ageOpen ? "rotate-180" : ""}`} />
                </button>
                {ageOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="w-52 bg-white text-foreground rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                      <div className="p-2 flex flex-col gap-1">
                        {["0-2 years", "2-4 years", "4-7 years", "7-9 years", "9-12 years", "12+ years"].map((age) => (
                          <Link
                            key={age}
                            to="/products"
                            search={{ age: age } as never}
                            onClick={() => setAgeOpen(false)}
                            className="block px-4 py-2.5 rounded-xl hover:bg-[#BFDDF0]/20 hover:text-slate-900 text-[12px] font-bold uppercase tracking-wider transition"
                          >
                            {age}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sale Link */}
              <Link
                to="/products"
                search={{ sale: true } as never}
                className="px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-all"
              >
                Sale
              </Link>

              {/* Coupons Link */}
              <Link
                to="/coupons"
                className="px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-white/30 hover:text-slate-950 transition-all"
              >
                Coupons
              </Link>

              {/* My Orders */}
              {user && (
                <Link
                  to="/account"
                  search={{ view: 'orders' } as any}
                  className="px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-white/30 hover:text-slate-950 transition-all"
                >
                  Orders
                </Link>
              )}

              {/* About Link */}
              <Link
                to="/about"
                className="px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-white/30 hover:text-slate-950 transition-all"
              >
                About
              </Link>

              {/* Contact Link */}
              <Link
                to="/contact"
                className="px-3 py-2 rounded-full text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-white/30 hover:text-slate-950 transition-all"
              >
                Contact
              </Link>

            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-5 shrink-0">

              {/* Search Toggle Icon */}
              <button
                onClick={() => setSidebarSearchOpen(true)}
                className="hidden md:flex flex-col items-center justify-center cursor-pointer text-slate-800 hover:opacity-80 transition-opacity"
              >
                <Search className="size-5.5 stroke-[2.2]" />
                <span className="text-[9px] font-black uppercase tracking-wide mt-0.5">Search</span>
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="hidden md:flex flex-col items-center justify-center cursor-pointer text-slate-800 hover:opacity-80 transition-opacity relative"
              >
                <Heart className="size-5.5 fill-[#FEFD99]" />
                <span className="text-[9px] font-black uppercase tracking-wide mt-0.5">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative hidden md:flex flex-col items-center justify-center shrink-0 hover:opacity-80 transition-opacity text-slate-800">
                <div className="relative">
                  <ShoppingCart className="size-6" />
                  <span className="absolute -top-1.5 -right-2 bg-slate-950 text-white text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center shadow-sm px-0.5">
                    {cartCount}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wide mt-0.5 hidden md:block">Cart</span>
              </Link>

              {/* User Login/Account */}
              <div className="relative hidden md:block shrink-0 hover:opacity-80 transition-opacity text-slate-800">
                <Link to="/account" className="flex flex-col items-center justify-center">
                  <User className="size-5.5" />
                  <span className="text-[9px] font-black uppercase tracking-wide mt-0.5 max-w-[65px] truncate">
                    {user ? name : "Sign In"}
                  </span>
                </Link>
              </div>

              {/* Mobile Search Toggle */}
              <button className="md:hidden p-2 text-slate-900 flex items-center" onClick={() => setSidebarSearchOpen(true)}>
                <Search className="size-5.5" />
              </button>

              {/* Mobile Wishlist Toggle */}
              <Link to="/wishlist" className="md:hidden p-2 text-slate-900 flex items-center relative">
                <Heart className="size-5.5 fill-[#FEFD99] text-slate-900" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button className="md:hidden p-2 text-slate-900 flex items-center" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="size-5.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer (Sliding from Left) */}
      <div
        className={`fixed inset-0 z-[1000] transition-all duration-300 flex justify-start ${mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
          }`}
      >
        {/* Backdrop (hides when clicking anywhere) */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* Drawer Content */}
        <div
          className={`relative w-full max-w-[280px] bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Header with Close button */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <Menu className="size-5 text-slate-600 stroke-[2.5]" /> Menu
            </h3>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body Navigation Links */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex flex-col">
              <Link to="/products" className="p-4 border-b border-slate-100 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Grid3x3 className="size-5 text-slate-700" /> <span className="font-bold text-slate-800">All Categories</span>
              </Link>

              {/* Shop by Age collapsible */}
              <div className="border-b border-slate-100 flex flex-col">
                <button
                  onClick={() => setMobileAgeOpen(!mobileAgeOpen)}
                  className="w-full p-4 flex items-center justify-between font-bold text-left text-slate-800"
                >
                  <span>Shop by Age</span>
                  <ChevronDown className={`size-4 text-slate-400 transition-transform ${mobileAgeOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileAgeOpen && (
                  <div className="bg-slate-50/70 border-t border-slate-100 flex flex-col pl-8 pr-4 py-2 gap-2.5">
                    {["0-2 years", "2-4 years", "4-7 years", "7-9 years", "9-12 years", "12+ years"].map(age => (
                      <Link
                        key={age}
                        to="/products"
                        search={{ age } as never}
                        className="py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors font-semibold"
                        onClick={() => { setMobileMenuOpen(false); setMobileAgeOpen(false); }}
                      >
                        {age}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop by Brand collapsible */}
              <div className="border-b border-slate-100 flex flex-col">
                <button
                  onClick={() => setMobileBrandOpen(!mobileBrandOpen)}
                  className="w-full p-4 flex items-center justify-between font-bold text-left text-slate-800"
                >
                  <span>Shop by Brand</span>
                  <ChevronDown className={`size-4 text-slate-400 transition-transform ${mobileBrandOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileBrandOpen && (
                  <div className="bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 pl-8 pr-4 py-3 gap-x-4 gap-y-2.5">
                    {BRANDS.map(brand => (
                      <Link
                        key={brand}
                        to="/products"
                        search={{ brand } as never}
                        className="py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors font-semibold truncate"
                        onClick={() => { setMobileMenuOpen(false); setMobileBrandOpen(false); }}
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/coupons" className="p-4 border-b border-slate-100 font-bold text-slate-800" onClick={() => setMobileMenuOpen(false)}>Coupons</Link>

              {user && (
                <Link
                  to="/account"
                  search={{ view: 'orders' } as any}
                  className="p-4 border-b border-slate-100 font-bold text-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}

              <Link to="/about" className="p-4 border-b border-slate-100 font-bold text-slate-800" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to="/contact" className="p-4 border-b border-slate-100 font-bold text-slate-800" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>

              <Link to="/account" className="p-4 font-bold text-slate-800 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <User className="size-5 text-slate-700" /> {user ? name : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Search Sidebar */}
      <div
        className={`fixed inset-0 z-[1000] transition-all duration-300 flex justify-end ${sidebarSearchOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setSidebarSearchOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${sidebarSearchOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* Drawer Content */}
        <div
          className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out ${sidebarSearchOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <Search className="size-5 text-slate-600 stroke-[2.5]" /> Find Product
            </h3>
            <button
              onClick={() => setSidebarSearchOpen(false)}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="p-5 border-b border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/products", search: { q: q || undefined } as never });
                setSidebarSearchOpen(false);
              }}
              className="relative flex w-full"
            >
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); }}
                placeholder="Search for toys, dolls, games..."
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 focus:border-slate-300 focus:bg-white rounded-xl outline-none text-sm transition-all placeholder:text-slate-400 text-slate-800 font-bold"
                autoFocus
              />
              <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 bg-[#BFDDF0] hover:bg-[#BFDDF0]/80 text-slate-950 font-extrabold px-4 rounded-lg text-xs flex items-center transition-colors border border-[#BFDDF0]">
                Search
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
            {!q.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 px-4 py-12">
                <Sparkles className="size-12 text-[#BFDDF0] mb-3 animate-pulse fill-current" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Start Typing...</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Discover the best toys and deals instantly.</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-slate-500 font-medium">No results matched "<strong>{q}</strong>".</p>
              </div>
            ) : (
              <div className="space-y-3 pb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Found {searchResults.length} Matches</h4>
                {searchResults.map((p) => {
                  const fp = effectivePrice(p.price, p.offerPct);
                  return (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={() => { setSidebarSearchOpen(false); setQ(""); }}
                      className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-[#BFDDF0] hover:shadow-md transition-all shadow-xs group"
                    >
                      <div className="size-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center p-1">
                        <img src={resolveImage(p.image)} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-black text-slate-800 truncate group-hover:text-slate-950 uppercase tracking-wide">
                          <HighlightText text={p.name} highlight={q} />
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold tracking-wide">{p.category_name || "Toys"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-black text-slate-950">₹{fp.toLocaleString("en-IN")}</span>
                          {p.offerPct > 0 && <span className="text-[10px] line-through text-slate-400 font-bold">₹{p.mrp.toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-slate-300 group-hover:translate-x-1 group-hover:text-[#BFDDF0] transition-all shrink-0" />
                    </Link>
                  );
                })}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ to: "/products", search: { q: q || undefined } as never });
                    setSidebarSearchOpen(false);
                  }}
                  className="w-full py-3 mt-4 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer"
                >
                  View All Search Results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
