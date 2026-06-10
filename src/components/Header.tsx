import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Grid3x3,
  ChevronDown,
  Headphones,
  Heart,
  ChevronRight,
  X,
  Sparkles,
  Package,
} from "lucide-react";

import { useState, useEffect, useRef, useMemo } from "react";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { effectivePrice, resolveImage } from "@/data/products";
import { HighlightText } from "@/components/HighlightText";
import { BRANDS } from "@/data/brands";
import logo from "@/assets/firstsmile_logo.png";
import age0_2 from "@/assets/0_2.png";
import age18_36 from "@/assets/18_36.png";
import age3_5 from "@/assets/3_5.png";
import age5_7 from "@/assets/5_7.png";
import age7_9 from "@/assets/7_9.png";
import age9_12 from "@/assets/9_12.png";
import age12Plus from "@/assets/12+.png";

export function Header() {
  const [q, setQ] = useState("");
  const [sidebarSearchOpen, setSidebarSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useShop();

  const { user, signOut } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

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

  // Scroll lock for side drawer
  useEffect(() => {
    if (sidebarSearchOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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

  // Scroll-aware navbar: hide top bar on scroll, show on return to top
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live search results
  const searchResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.category_name ?? "").toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [q, products]);

  const name = user?.full_name || user?.email?.split("@")[0] || "User";

  const announcements = [
    "🚚 Free shipping on order above 999.00",
    "✨ Get 5% off on first order",
    "🎁 New arrivals every week"
  ];
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#BFDDF0] text-slate-900 overflow-hidden h-9 relative z-[60] flex items-center justify-center font-bold text-xs sm:text-sm tracking-wide">
        {announcements.map((text, i) => (
          <div
            key={i}
            className={`absolute w-full h-9 flex items-center justify-center transition-all duration-500 ${i === announcementIdx
              ? "translate-y-0 opacity-100 z-10"
              : i === (announcementIdx + 1) % announcements.length || (announcementIdx === announcements.length - 1 && i === 0)
                ? "-translate-y-full opacity-0 z-0"
                : "translate-y-full opacity-0 z-0"
              }`}
          >
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* First Navbar — hides when scrolled down */}
      <header
        className={`bg-pink-100 border-b border-slate-100 w-full shadow-sm z-50 transition-all duration-300 ${scrolled
          ? "fixed top-0 -translate-y-full opacity-0 pointer-events-none"
          : "sticky top-0 translate-y-0 opacity-100"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2 md:py-3">
          {/* Left: Logo */}

          <img
            src={logo}
            alt="Trivoxo Toys"
            className="h-14 md:h-16 w-auto object-contain scale-150 origin-left"
          />

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto relative group">
            <input
              type="text"
              placeholder="Search toys directly..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-5 pr-10 outline-none focus:ring-2 focus:ring-[#BFDDF0] focus:bg-white transition-all text-sm cursor-text shadow-inner"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-[#1E3A8A] transition-colors" />

            {/* Inline Search Dropdown */}
            {q.trim().length > 0 && (
              <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
                  {(() => {
                    const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.description && p.description.toLowerCase().includes(q.toLowerCase())));
                    if (filtered.length === 0) {
                      return <div className="p-4 text-center text-sm text-slate-500 font-medium">No products found for "{q}"</div>;
                    }
                    return (
                      <>
                        {filtered.slice(0, 8).map(p => (
                          <Link
                            key={p.id}
                            to="/product/$id"
                            params={{ id: p.id }}
                            onClick={() => setQ('')}
                            className="flex items-center gap-3 p-2 hover:bg-[#BFDDF0]/30 rounded-lg transition-colors group"
                          >
                            <div className="size-12 bg-white rounded-md border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
                              <img src={p.images?.[0] ? resolveImage(p.images[0]) : logo} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <HighlightText text={p.name} highlight={q} className="text-sm font-semibold text-slate-800 truncate" />
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-bold text-slate-900">₹{p.price}</span>
                                {p.mrp > p.price && <span className="text-[11px] text-slate-400 line-through">₹{p.mrp}</span>}
                              </div>
                            </div>
                          </Link>
                        ))}s
                        {filtered.length > 8 && (
                          <Link
                            to="/products"
                            search={{ search: q } as never}
                            onClick={() => setQ('')}
                            className="text-center p-2.5 mt-1 text-sm font-bold text-[#1E3A8A] hover:bg-[#BFDDF0]/20 rounded-lg transition-colors uppercase tracking-wider"
                          >
                            View all {filtered.length} results
                          </Link>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            {/* About & Contact Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 mr-2">
              <Link to="/about" className="text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] transition-colors uppercase tracking-wider">About</Link>
              <Link to="/contact" className="text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] transition-colors uppercase tracking-wider">Contact</Link>
              {user && (
                <Link
                  to="/my-orders"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] transition-colors uppercase tracking-wider"
                >
                  <Package className="size-4" />
                  My Orders
                </Link>
              )}
            </div>


            {/* Wishlist */}
            <Link to="/wishlist" className="flex flex-col items-center justify-center cursor-pointer text-slate-800 hover:scale-110 transition-transform">
              <Heart className="size-6 fill-[#FEFD99]" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex flex-col items-center justify-center shrink-0 hover:scale-110 transition-transform text-slate-800">
              <div className="relative">
                <ShoppingCart className="size-6" />
                <span className="absolute -top-1.5 -right-2 bg-slate-950 text-white text-[10px] rounded-full min-w-[17px] h-[17px] flex items-center justify-center shadow-sm px-0.5">
                  {cartCount}
                </span>
              </div>
            </Link>

            {/* Profile */}
            <div className="relative hidden md:block shrink-0 hover:scale-110 transition-transform text-slate-800">
              <Link to="/account" className="flex flex-col items-center justify-center">
                <User className="size-6" />
              </Link>
            </div>

            {/* Mobile Search Toggle */}
            <button className="lg:hidden p-1 text-slate-900 flex items-center" onClick={() => setSidebarSearchOpen(true)}>
              <Search className="size-5.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden p-1 text-slate-900 flex items-center" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="size-5.5" />
            </button>
          </div>
        </div>
      </header>
      {/* Second Navbar (Categories, Brands, etc.) — sticks to top when first navbar is hidden */}
      <div className={`bg-[#BFDDF0] text-slate-900 relative shadow-sm hidden lg:block z-40 transition-all duration-300 ${scrolled ? "sticky top-0" : ""
        }`}>
        <div className="container mx-auto flex items-center justify-center px-4 py-1">
          <nav className="flex items-center gap-1 mx-auto">
            {/* Home Button */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider text-slate-800 hover:bg-white/40 hover:text-slate-950 transition-all"
            >
              Home
            </Link>

            {/* All Products Button */}
            <Link
              to="/products"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider text-slate-800 hover:bg-white/40 hover:text-slate-950 transition-all"
            >
              All Products
            </Link>

            {/* Categories Button & Hover Dropdown */}
            <div
              ref={catRef}
              className="h-full relative"
              onMouseEnter={() => {
                setCatOpen(true);
                setAgeOpen(false);
                setBrandOpen(false);
                if (categories.length > 0 && !activeCatId) {
                  const root = categories.find((c) => !c.parent_id);
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
                    const root = categories.find((c) => !c.parent_id);
                    if (root) setActiveCatId(root.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider cursor-pointer transition-all ${catOpen
                  ? "bg-slate-900 text-[#BFDDF0] shadow-sm"
                  : "text-slate-800 hover:bg-white/40 hover:text-slate-950"
                  }`}
              >
                <Grid3x3 className="size-4 shrink-0" /> Categories{" "}
                <ChevronDown className={`size-3.5 transition ${catOpen ? "rotate-180" : ""}`} />
              </button>

              {catOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="w-[450px] bg-white text-foreground rounded-none shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {categories
                        .filter((c) => !c.parent_id)
                        .map((parent) => (
                          <Link
                            key={parent.id}
                            to="/products"
                            search={{ category: parent.slug } as never}
                            onClick={() => setCatOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50 text-slate-700 hover:text-slate-950 text-[11px] tracking-wider uppercase transition-all rounded-none"
                          >
                            <span className="size-8 flex items-center justify-center shrink-0">
                              {parent.image ? (
                                <img src={resolveImage(parent.image)} alt={parent.name} className="max-w-full max-h-full object-contain" />
                              ) : (
                                parent.icon ?? "🎁"
                              )}
                            </span>
                            <span>{parent.name}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Brands Dropdown */}
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
                onClick={() => {
                  setBrandOpen((v) => !v);
                  setAgeOpen(false);
                  setCatOpen(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider cursor-pointer transition-all ${brandOpen
                  ? "bg-slate-900 text-[#BFDDF0] shadow-sm"
                  : "text-slate-800 hover:bg-white/40 hover:text-slate-950"
                  }`}
              >
                Brands{" "}
                <ChevronDown className={`size-3.5 transition ${brandOpen ? "rotate-180" : ""}`} />
              </button>
              {brandOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="w-[340px] bg-white text-foreground rounded-none shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-2 grid grid-cols-2 gap-1">
                      {uniqueBrands.map((b) => {
                        const brandImages: Record<string, string> = {
                          "AAYUSHI": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL-mra-NA6W6S-c8NeUbzWXPvtFYijrlhTIA&s",
                          "CENTY TOYS": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzmq2WqHD1EhHrSe3iKKSTyWDbqhr6bQf68A&s",
                          "DASH STAR": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQVZK6aBU46A5kJjE5savdwbANyeHPzj5iMQ&s",
                          "GENERIC": "https://images-platform.99static.com/3-Gw3-XKAjke2wz61jujQkx8dUs=/378x266:1622x1510/fit-in/99designs-contests-attachments/138/138432/attachment_138432570",
                          "MEE MEE": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxqIkjDeVbqYoX0EXlPnj7WHYNRXDHSdk29Q&s",
                          "ZEPHYR": "https://media.licdn.com/dms/image/v2/C510BAQHo9PDB8ZPkgw/company-logo_200_200/company-logo_200_200/0/1630586683562?e=2147483647&v=beta&t=rqa9o7BSWJ4GrfgSj6QSmffZTaMoT5bYu1a_8dGFRAM",
                          "ANNIE": "https://i.pinimg.com/736x/02/a4/48/02a448c3723e8e133778a6a1aaf44064.jpg",
                          "BALAK": "https://img.magnific.com/premium-vector/classic-vintage-toy-store-horse-retro-label-badge-logo-design_560919-82.jpg?semt=ais_hybrid&w=740&q=80",
                          "COSCO": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuKa15LPPVeUklPuP-0gxqKjWR-O2nYMbLxQ&s",
                          "EKTA": "https://toys-catalog.odoo.com/web/image/1747-9f780afd/IMG-20241017-WA0017.webp",
                          "MATTEL": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mattel_%282019%29.svg/1280px-Mattel_%282019%29.svg.png",
                          "PANDA": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5Ct-B-3ZCVQjjaVL91APYc6n2_yM7JzS34g&s",
                        };
                        const imgUrl = brandImages[b.toUpperCase()];

                        return (
                          <Link
                            key={b}
                            to="/products"
                            search={{ brand: b } as never}
                            onClick={() => setBrandOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#BFDDF0]/20 hover:text-slate-900 rounded-none text-[11px] uppercase tracking-wider transition"
                          >
                            <div className="size-6 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {imgUrl ? (
                                <img src={imgUrl} alt={b} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-slate-400 font-bold">{b.charAt(0)}</span>
                              )}
                            </div>
                            <span className="truncate">{b}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shop by Age Dropdown */}
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
                onClick={() => {
                  setAgeOpen((v) => !v);
                  setBrandOpen(false);
                  setCatOpen(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider cursor-pointer transition-all ${ageOpen
                  ? "bg-slate-900 text-[#BFDDF0] shadow-sm"
                  : "text-slate-800 hover:bg-white/40 hover:text-slate-950"
                  }`}
              >
                Age <ChevronDown className={`size-3.5 transition ${ageOpen ? "rotate-180" : ""}`} />
              </button>
              {ageOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="w-[280px] bg-white text-foreground rounded-none shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-2 grid grid-cols-1 gap-1">
                      {[
                        { label: "0-18 month", value: "0-18 month", image: age0_2 },
                        { label: "18-36 month", value: "18-36 month", image: age18_36 },
                        { label: "3-5 year", value: "3-5 year", image: age3_5 },
                        { label: "5-7 year", value: "5-7 year", image: age5_7 },
                        { label: "7-9 year", value: "7-9 year", image: age7_9 },
                        { label: "9-12 year", value: "9-12 year", image: age9_12 },
                        { label: "12 +years", value: "12 +years", image: age12Plus },

                      ].map((ageObj) => (
                        <Link
                          key={ageObj.value}
                          to="/products"
                          search={{ age: ageObj.value } as never}
                          onClick={() => setAgeOpen(false)}
                          className="flex items-center gap-3 px-3 py-1.5 rounded-none hover:bg-[#BFDDF0]/20 hover:text-slate-900 text-[11px] uppercase tracking-wider transition"
                        >
                          <div className="size-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={ageObj.image} alt={ageObj.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="truncate">{ageObj.label}</span>
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
              className="px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider text-rose-600 hover:bg-white/40 transition-all"
            >
              Sale
            </Link>

            {/* Coupons Link */}
            <Link
              to="/coupons"
              className="px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider text-slate-800 hover:bg-white/40 hover:text-slate-950 transition-all"
            >
              Coupons
            </Link>

            {/* My Orders — only shown when user is logged in */}
            {user && (
              <Link
                to="/my-orders"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider text-slate-800 hover:bg-white/40 hover:text-slate-950 transition-all"
              >
                <Package className="size-3.5 shrink-0" />
                My Orders
              </Link>
            )}
          </nav>
        </div>
      </div>

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
              <Link
                to="/categories"
                className="p-4 border-b border-slate-100 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Grid3x3 className="size-5 text-slate-700" />{" "}
                <span className="   text-slate-800">All Categories</span>
              </Link>

              {/* Shop by Age collapsible */}
              <div className="border-b border-slate-100 flex flex-col">
                <button
                  onClick={() => setMobileAgeOpen(!mobileAgeOpen)}
                  className="w-full p-4 flex items-center justify-between    text-left text-slate-800"
                >
                  <span>Shop by Age</span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${mobileAgeOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileAgeOpen && (
                  <div className="bg-slate-50/70 border-t border-slate-100 flex flex-col pl-8 pr-4 py-2 gap-2.5">
                    {[
                      "0-18 month",
                      "18-36 month",
                      "3-5 year",
                      "5-7 year",
                      "7-9 year",
                      "9-12 year",
                      "12 +years",
                    ].map((age) => (
                      <Link
                        key={age}
                        to="/products"
                        search={{ age } as never}
                        className="py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors   "
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileAgeOpen(false);
                        }}
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
                  className="w-full p-4 flex items-center justify-between    text-left text-slate-800"
                >
                  <span>Shop by Brand</span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${mobileBrandOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileBrandOpen && (
                  <div className="bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 pl-8 pr-4 py-3 gap-x-4 gap-y-2.5">
                    {uniqueBrands.map((brand) => (
                      <Link
                        key={brand}
                        to="/products"
                        search={{ brand } as never}
                        className="py-1 text-sm text-slate-600 hover:text-slate-900 transition-colors    truncate"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileBrandOpen(false);
                        }}
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/coupons"
                className="p-4 border-b border-slate-100    text-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Coupons
              </Link>

              {user && (
                <Link
                  to="/account"
                  search={{ view: "orders" } as any}
                  className="p-4 border-b border-slate-100    text-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}

              <Link
                to="/about"
                className="p-4 border-b border-slate-100    text-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="p-4 border-b border-slate-100    text-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>

              <Link
                to="/account"
                className="p-4    text-slate-800 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
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
                onChange={(e) => {
                  setQ(e.target.value);
                }}
                placeholder="Search for toys, dolls, games..."
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 focus:border-slate-300 focus:bg-white rounded-xl outline-none text-sm transition-all placeholder:text-slate-400 text-slate-800   "
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bottom-1.5 bg-[#BFDDF0] hover:bg-[#BFDDF0]/80 text-slate-950  px-4 rounded-lg text-xs flex items-center transition-colors border border-[#BFDDF0]"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
            {!q.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 px-4 py-12">
                <Sparkles className="size-12 text-[#BFDDF0] mb-3 animate-pulse fill-current" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Start Typing...
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Discover the best toys and deals instantly.
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-slate-500 font-medium">
                  No results matched "<strong>{q}</strong>".
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Found {searchResults.length} Matches
                </h4>
                {searchResults.map((p) => {
                  const fp = effectivePrice(p.price, p.offerPct);
                  return (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={() => {
                        setSidebarSearchOpen(false);
                        setQ("");
                      }}
                      className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-[#BFDDF0] hover:shadow-md transition-all shadow-xs group"
                    >
                      <div className="size-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center p-1">
                        <img
                          src={resolveImage(p.image)}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-black text-slate-800 truncate group-hover:text-slate-950 uppercase tracking-wide">
                          <HighlightText text={p.name} highlight={q} />
                        </h5>
                        <p className="text-[10px] text-slate-400    tracking-wide">
                          {p.category_name || "Toys"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-black text-slate-950">
                            ₹{fp.toLocaleString("en-IN")}
                          </span>
                          {p.offerPct > 0 && (
                            <span className="text-[10px] line-through text-slate-400   ">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
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
