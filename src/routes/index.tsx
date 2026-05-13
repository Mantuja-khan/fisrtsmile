import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories, useBanners } from "@/hooks/useCatalog";
import { ShieldCheck, Truck, RotateCcw, Headphones, Sparkles, Zap, Star, Plus } from "lucide-react";
import { useAuth } from "@/store/auth";
import { resolveImage } from "@/data/products";

import under199 from "@/assets/shopbyprice/under199.png";
import under399 from "@/assets/shopbyprice/under399.png";
import under699 from "@/assets/shopbyprice/under699.png";
import under999 from "@/assets/shopbyprice/under999.png";

import age0_2 from "@/assets/0_2.png";
import age2_4 from "@/assets/2_4.png";
import age4_7 from "@/assets/4_7.png";
import age7_9 from "@/assets/7_9.png";
import age9_12 from "@/assets/9_12.png";
import age12Plus from "@/assets/12+.png";

const AGE_RANGES = [
  { label: "0-2 years", value: "0-2 years", image: age0_2 },
  { label: "2-4 years", value: "2-4 years", image: age2_4 },
  { label: "4-7 years", value: "4-7 years", image: age4_7 },
  { label: "7-9 years", value: "7-9 years", image: age7_9 },
  { label: "9-12 years", value: "9-12 years", image: age9_12 },
  { label: "12+ years", value: "12+ years", image: age12Plus },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "First Smile — Shop Toys Online | Dolls, Vehicles, Soft Toys & more" },
      { name: "description", content: "Discover thousands of toys at unbeatable prices. Free shipping on prepaid orders." },
      { property: "og:title", content: "First Smile — Shop Toys Online" },
      { property: "og:description", content: "Discover thousands of toys at unbeatable prices." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: banners = [] } = useBanners();
  const { isAdmin } = useAuth();

  const offers = products.filter((p) => p.badge === "Flash Deal");
  const featured = products.slice(0, 8);

  const heroBanners = banners.filter(b => b.position !== 'promo');
  const promoBanners = banners.filter(b => b.position === 'promo').slice(0, 2);

  const [heroIdx, setHeroIdx] = useState(0);

  // Pre-filter for performance
  const rootCats = categories.filter(c => !c.parent_id);

  useEffect(() => {
    if (heroBanners.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroBanners.length), 3500);
    return () => clearInterval(t);
  }, [heroBanners.length]);

  return (
    <div>
      {/* Hero Banners */}
      <section className="bg-surface relative overflow-hidden">
        {heroBanners.length > 0 ? (
          <div className="relative w-full overflow-hidden group">
            <Link to="/products" search={heroBanners[heroIdx].category?.slug ? { category: heroBanners[heroIdx].category.slug } : undefined} className="block w-full">
              <img src={resolveImage(heroBanners[heroIdx].image)} alt="Hero Banner" className="w-full h-auto min-h-[150px] object-cover animate-fade-in" />
            </Link>
            {heroBanners.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`h-2 rounded-full shadow-sm ${i === heroIdx ? "w-8 bg-primary" : "w-2 bg-white/70"}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 md:py-14 text-center">
            <h1 className="font-display text-4xl md:text-6xl text-primary drop-shadow-md">
              Welcome to First Smile
            </h1>
            <p className="mt-3 text-sm md:text-lg text-muted-foreground max-w-md mx-auto">
              Premium toys, fast delivery across India.
            </p>
          </div>
        )}
      </section>

      {/* Marquee announcement */}
      <div className="bg-secondary text-secondary-foreground overflow-hidden border-y border-secondary-foreground/10">
        <div className="marquee-track py-2 text-sm font-semibold">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-10 px-5 shrink-0">
              <span>🚚 Free shipping on prepaid orders</span>
              <span>·</span>
              <span>🎁 New arrivals every week</span>
              <span>·</span>
              <span>💯 100% genuine brands</span>
              <span>·</span>
              <span>⚡ Same-day dispatch</span>
              <span>·</span>
              <span>🏆 Trusted by 50,000+ families</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <section className="bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { icon: Truck, t: "Free Shipping", s: "On prepaid orders" },
            { icon: ShieldCheck, t: "100% Genuine", s: "Trusted brands only" },
            { icon: RotateCcw, t: "Easy Exchange", s: "Same product, 1 per order" },
            { icon: Headphones, t: "24h Support", s: "Email & WhatsApp" },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 group">
              <div className="size-12 grid place-items-center rounded-2xl bg-accent text-primary">
                <f.icon className="size-5" />
              </div>
              <div>
                <div className="font-semibold">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flash sale / offers */}
      {offers.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-warm rounded-3xl p-5 md:p-8 shadow-pop relative overflow-hidden">
            <div className="absolute -top-8 -right-8 size-40 rounded-full bg-white/15 blur-2xl" />
            <div className="flex items-center justify-between mb-5 relative">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="size-6 fill-destructive text-destructive animate-pulse" />
                  <h2 className="font-display text-3xl md:text-4xl">Flash Sale</h2>
                </div>
                <p className="text-xs md:text-sm opacity-80 mt-1">Limited time. Limited stock. Grab yours now!</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {isAdmin && (
                  <Link to="/admin/products" className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5">
                    <Plus className="size-3.5" /> Add Product
                  </Link>
                )}
                <Link to="/products" search={{ badge: "Flash Deal" } as never} className="text-sm font-semibold underline">
                  View all →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 relative">
              {offers.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-4">
          <div className="bg-surface rounded-3xl shadow-card p-5 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-3xl md:text-4xl">Featured Toys</h2>
                <p className="text-sm text-muted-foreground mt-1">Hand-picked favourites our customers love</p>
              </div>
              <Link to="/products" className="text-sm font-semibold text-primary">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-foreground">
            Shop by Category
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Explore our wide selection of premium toys</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 px-2 lg:px-0 justify-items-center">
          {rootCats.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              to="/subcategories/$slug"
              params={{ slug: c.slug } as never}
              className="group flex flex-col items-center w-full transition-transform hover:-translate-y-2"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 flex items-center justify-center overflow-visible relative group-hover:scale-110 transition-transform duration-300">
                {c.image ? (
                  <img 
                    src={resolveImage(c.image)} 
                    alt={c.name} 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">{c.icon ?? "🎁"}</span>
                )}
              </div>
              
              {/* Rectangular Box Text matching Shop by Age design */}
              <div className="mt-4 border-2 border-black bg-white px-2 py-1.5 w-full max-w-[160px] text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white transition-colors">
                <span className="font-bold text-xs tracking-wider uppercase whitespace-nowrap truncate block">
                  {c.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* Shop by Age (New Section) */}
      <section className="container mx-auto px-4 py-8 bg-slate-50/50 border-y border-slate-100">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Age</h2>
          <p className="text-sm text-muted-foreground mt-1">Find perfect toys suited for every stage</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 px-2 lg:px-0">
          {AGE_RANGES.map((age, i) => (
            <Link
              key={i}
              to="/products"
              search={{ age_range: age.value } as never}
              className="group flex flex-col items-center w-full transition-transform hover:-translate-y-2"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 flex items-center justify-center overflow-visible relative group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={age.image} 
                  alt={age.label} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* The Rectangular Box Text below - matching user design */}
              <div className="mt-4 border-2 border-black bg-white px-2 py-1.5 w-full max-w-[160px] text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white transition-colors">
                <span className="font-bold text-xs tracking-wider uppercase whitespace-nowrap">
                  {age.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* Shop by Price */}
      <section className="container mx-auto px-4 py-4 mb-8">
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Price</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { max: 199, img: under199 },
            { max: 399, img: under399 },
            { max: 699, img: under699 },
            { max: 999, img: under999 },
          ].map((tier) => (
            <Link
              key={tier.max}
              to="/products"
              search={{ maxPrice: tier.max }}
              className="block rounded-2xl overflow-hidden shadow-card"
            >
              <img src={tier.img} className="w-full h-auto object-contain" alt={`Under ₹${tier.max}`} />
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banners */}
      {promoBanners.length > 0 && (
        <section className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoBanners.map((banner) => (
              <Link
                key={banner._id}
                to="/products"
                search={banner.category?.slug ? { category: banner.category.slug } : undefined}
                className="block rounded-2xl overflow-hidden shadow-card bg-muted"
              >
                <img src={resolveImage(banner.image)} alt="Promo" className="w-full h-auto object-contain rounded-2xl" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl md:text-4xl">Loved by Parents</h2>
          <p className="text-sm text-muted-foreground mt-1">Real reviews from happy First Smile families</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "Priya S.", c: "Mumbai", t: "Quality is fantastic and delivery was super quick. My daughter adores the unicorn plush!" },
            { n: "Rahul M.", c: "Bangalore", t: "The wooden blocks set is genuinely premium. Worth every rupee." },
            { n: "Aarti K.", c: "Delhi", t: "Loved the packaging and the surprise note. Will order again!" },
          ].map((r) => (
            <div key={r.n} className="bg-surface rounded-2xl shadow-card p-6 relative">
              <div className="absolute -top-3 left-6 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">VERIFIED</div>
              <div className="text-secondary text-lg mb-2">★★★★★</div>
              <p className="text-sm italic text-foreground/80">"{r.t}"</p>
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
                <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">
                  {r.n[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.n}</div>
                  <div className="text-xs text-muted-foreground">{r.c}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
