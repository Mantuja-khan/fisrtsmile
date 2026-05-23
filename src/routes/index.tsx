import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories, useBanners } from "@/hooks/useCatalog";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  Zap,
  Star,
  Plus,
  Rocket,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { resolveImage } from "@/data/products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import under199 from "@/assets/shopbyprice/under199.png";
import under399 from "@/assets/shopbyprice/under399.png";
import under699 from "@/assets/shopbyprice/under699.png";
import under999 from "@/assets/shopbyprice/under999.png";
import under1499 from "@/assets/shopbyprice/under1499.png";
import above1500 from "@/assets/shopbyprice/above1500.png";

import age0_2 from "@/assets/0_2.png";
import age18_36 from "@/assets/18_36.png";
import age3_5 from "@/assets/3_5.png";
import age5_7 from "@/assets/5_7.png";
import age7_9 from "@/assets/7_9.png";
import age9_12 from "@/assets/9_12.png";
import age12Plus from "@/assets/12+.png";

import slider1 from "@/assets/slider/Barbie_570x.webp";
import slider2 from "@/assets/slider/Funskool_570x.webp";
import slider3 from "@/assets/slider/Hot_Wheels_570x.webp";
import slider4 from "@/assets/slider/Lego_570x.webp";
import slider5 from "@/assets/slider/Marvel_570x.webp";
import slider6 from "@/assets/slider/Mattel_Games_570x.webp";
import slider7 from "@/assets/slider/disney-logo-square_570x.webp";
import slider8 from "@/assets/slider/majorettelogo.avif";
import { se } from "date-fns/locale";

const AGE_RANGES = [
  { label: "0-18 month", value: "0-18 month", image: age0_2 },
  { label: "18-36 month", value: "18-36 month", image: age18_36 },
  { label: "3-5 year", value: "3-5 year", image: age3_5 },
  { label: "5-7 year", value: "5-7 year", image: age5_7 },
  { label: "7-9 year", value: "7-9 year", image: age7_9 },
  { label: "9-12 year", value: "9-12 year", image: age9_12 },
  { label: "12 +years", value: "12 +years", image: age12Plus },
];

const INSTAGRAM_REELS = [
  {
    id: "reel-1",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-child-playing-with-toys-in-a-crib-41761-large.mp4",
    instagramUrl: "https://www.instagram.com/toyhaat/",
    caption: "THIS KEPT MY CHILD BUSY LONGER THAN CARTOONS 😂",
  },
  {
    id: "reel-2",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-little-child-playing-with-wooden-toys-at-home-43033-large.mp4",
    instagramUrl: "https://www.instagram.com/toyhaat/",
    caption: "PREMIUM WOODEN BLOCKS & LEARNING TOYS 🪵",
  },
  {
    id: "reel-3",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-kids-hands-playing-with-colorful-building-blocks-42323-large.mp4",
    instagramUrl: "https://www.instagram.com/toyhaat/",
    caption: "CREATIVE & IMAGINATIVE PLAY FOR TODDLERS 🧩",
  },
  {
    id: "reel-4",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-toddler-girl-playing-with-soft-plush-toys-in-bed-48866-large.mp4",
    instagramUrl: "https://www.instagram.com/toyhaat/",
    caption: "SUPER CUTE SOFT TOYS FOR THE PERFECT SLEEP 🧸",
  },
  {
    id: "reel-5",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-happy-baby-playing-with-colorful-toys-43026-large.mp4",
    instagramUrl: "https://www.instagram.com/toyhaat/",
    caption: "SMART TOYS BY TOY HAAT 😊",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toy Haat — Shop Toys Online | Dolls, Vehicles, Soft Toys & more" },
      {
        name: "description",
        content:
          "Discover thousands of toys at unbeatable prices. Free shipping on prepaid orders.",
      },
      { property: "og:title", content: "Toy Haat — Shop Toys Online" },
      { property: "og:description", content: "Discover thousands of toys at unbeatable prices." },
    ],
  }),
  component: HomePage,
});

const ALL_TESTIMONIALS = [
  {
    n: "Priya Sharma",
    c: "Mumbai",
    r: 5,
    t: "Quality is fantastic and delivery was super quick. My daughter adores the unicorn plush!",
    d: "2 days ago",
    i: "👩",
  },
  {
    n: "Rahul Mehta",
    c: "Bangalore",
    r: 5,
    t: "The building blocks set is genuinely premium. Keep my kids engaged for hours. Highly recommended!",
    d: "5 days ago",
    i: "👨",
  },
  {
    n: "Aarti Kapur",
    c: "Delhi",
    r: 5,
    t: "Amazing experience! The gift wrapping was beautiful and the educational toys are absolute top quality.",
    d: "Yesterday",
    i: "👩",
  },
  {
    n: "Vikram Singh",
    c: "Jaipur",
    r: 5,
    t: "Super fast shipping to Rajasthan. The remote control vehicle is robust and powerful. Will order again!",
    d: "1 week ago",
    i: "👨",
  },
  {
    n: "Sneha Patel",
    c: "Ahmedabad",
    r: 5,
    t: "Extremely happy with the learning board sets. Best e-commerce site to buy safe toys in India.",
    d: "3 days ago",
    i: "👩",
  },
  {
    n: "Deepak Nair",
    c: "Chennai",
    r: 5,
    t: "Got my order within 48 hours! Very safe packaging. Kids absolutely loved the puzzle gifts.",
    d: "4 days ago",
    i: "👨",
  },
  {
    n: "Ananya Sen",
    c: "Kolkata",
    r: 5,
    t: "Value for money deals are crazy good. Got three premium brand dolls under ₹999. Genuine products!",
    d: "2 days ago",
    i: "👧",
  },
  {
    n: "Rohit Varma",
    c: "Pune",
    r: 5,
    t: "Top notch building blocks. No cheap plastics, completely safe for my toddler. Fantastic work Toy Haat!",
    d: "1 week ago",
    i: "🧑",
  },
];

function HomePage() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: banners = [] } = useBanners();
  const { isAdmin } = useAuth();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollReels = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const [randomReviews, setRandomReviews] = useState<typeof ALL_TESTIMONIALS>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    // Select 3 random unique reviews on component mount
    const shuffled = [...ALL_TESTIMONIALS].sort(() => 0.5 - Math.random()).slice(0, 3);
    setRandomReviews(shuffled);
  }, []);

  const offers = products.filter((p) => p.isSale);
  const trendingProducts = products.filter(
    (p) =>
      p.badge &&
      p.badge
        .toLowerCase()
        .split(",")
        .some((b) => ["trending", "trending product"].includes(b.trim())),
  );
  const bestSellers = products.filter(
    (p) =>
      p.badge &&
      p.badge
        .toLowerCase()
        .split(",")
        .some((b) => ["best seller", "best seller product", "bestseller"].includes(b.trim())),
  );

  const heroBanners = banners.filter((b) => b.position !== "promo");
  const promoBanners = banners.filter((b) => b.position === "promo").slice(0, 2);

  const [api, setApi] = useState<CarouselApi>();
  const [heroIdx, setHeroIdx] = useState(0);
  const [brandApi, setBrandApi] = useState<CarouselApi>();

  // Pre-filter for performance
  const rootCats = categories.filter((c) => !c.parent_id);

  useEffect(() => {
    if (!api || heroBanners.length < 2) return;
    const t = setInterval(() => {
      api.scrollNext();
    }, 3500);
    return () => clearInterval(t);
  }, [api, heroBanners.length]);

  useEffect(() => {
    if (!api) return;
    setHeroIdx(api.selectedScrollSnap());
    api.on("select", () => {
      setHeroIdx(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!brandApi) return;
    const t = setInterval(() => {
      brandApi.scrollNext();
    }, 3000);
    return () => clearInterval(t);
  }, [brandApi]);

  return (
    <div>
      {/* Brand Carousel */}
      <section className="bg-pink-50 py-4 border-b border-slate-100">
        <Carousel setApi={setBrandApi} opts={{ align: "start", loop: true, slidesToScroll: 1 }} className="w-full">
          <CarouselContent className="items-center -ml-4">
            {[slider1, slider2, slider3, slider4, slider5, slider6, slider7, slider8, slider1, slider2, slider3, slider4, slider5, slider6, slider7, slider8].map((src, i) => (
              <CarouselItem key={i} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-[12.5%]">
                <div className="flex items-center justify-center h-[76px] w-full">
                  <img src={src} className="h-full w-full object-contain scale-[1.15] select-none" alt={`Brand ${i + 1}`} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>


      {/* Hero Banners */}
      <section className="bg-surface relative overflow-hidden">
        {heroBanners.length > 0 ? (
          <div className="relative w-full overflow-hidden group">
            <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
              <CarouselContent className="-ml-0">
                {heroBanners.map((b, i) => (
                  <CarouselItem key={i} className="pl-0">
                    <Link
                      to="/products"
                      search={b.category?.slug ? { category: b.category.slug } : undefined}
                      className="block w-full cursor-grab active:cursor-grabbing"
                    >
                      <img
                        src={resolveImage(b.image)}
                        alt="Hero Banner"
                        className="w-full h-auto min-h-[150px] object-cover select-none"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {heroBanners.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-2 rounded-full shadow-sm transition-all duration-300 ${i === heroIdx ? "w-8 bg-primary" : "w-2 bg-white/70"}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 md:py-14 text-center">
            <h1 className="font-display text-4xl md:text-6xl text-primary drop-shadow-md">
              Welcome to Toy Haat
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

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <section className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-y border-orange-100 py-8 relative overflow-hidden my-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Rocket className="size-6 text-orange-600 animate-bounce" />
                  <h2 className="font-display text-xl md:text-3xl lg:text-4xl text-orange-950">
                    Trending Products
                  </h2>
                </div>
              </div>
              <Link
                to="/products"
                search={{ badge: "Trending" } as never}
                className="text-xs md:text-sm font-semibold text-orange-700 underline hover:opacity-80"
              >
                View more →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pt-1 snap-x snap-mandatory touch-pan-x">
              {trendingProducts.slice(0, 16).map((p) => (
                <div key={p.id} className="w-[165px] sm:w-[220px] md:w-[250px] shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="w-full bg-indigo-50/40 border-y border-indigo-100/40 py-8 relative overflow-hidden my-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="absolute -top-6 -right-6 size-32 rounded-full bg-indigo-400/5 blur-2xl pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="size-6 text-slate-800 fill-current" />
                  <h2 className="font-display text-xl md:text-3xl lg:text-4xl text-slate-900">
                    Best Sellers
                  </h2>
                </div>
              </div>
              <Link
                to="/products"
                search={{ badge: "Best Seller" } as never}
                className="text-xs md:text-sm font-extrabold text-slate-900 underline decoration-[#BFDDF0] decoration-2 hover:text-slate-700 transition-all"
              >
                View More →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pt-1 snap-x snap-mandatory touch-pan-x relative z-10">
              {bestSellers.slice(0, 16).map((p) => (
                <div key={p.id} className="w-[165px] sm:w-[220px] md:w-[250px] shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Categories Section */}
      <section className="w-full bg-pink-100 py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore our wide selection of premium toys
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 md:gap-6 px-2 lg:px-0 justify-items-center">
            {(() => {
              const displayedCats = showAllCategories ? rootCats : rootCats.slice(0, 10);
              return displayedCats.map((c, idx) => {
                return (
                  <Link
                    key={c.id}
                    to="/subcategories/$slug"
                    params={{ slug: c.slug } as never}
                    className="group flex flex-col items-center w-full transition-transform hover:-translate-y-2"
                  >
                    <div className="w-full max-w-[200px] aspect-square flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-all duration-300">
                      {c.image ? (
                        <img
                          src={resolveImage(c.image)}
                          alt={c.name}
                          className="w-full h-full object-contain select-none group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-5xl sm:text-6xl transition-transform duration-300 group-hover:scale-110">
                          {c.icon ?? "🎁"}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
          {!showAllCategories && rootCats.length > 10 && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowAllCategories(true)}
                className="bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all"
              >
                View More Categories
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Shop by Age (New Section) */}
      <section className="container mx-auto px-4 py-8 bg-slate-50/50 border-y border-slate-100">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Age</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Find perfect toys suited for every stage
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pt-1 snap-x snap-mandatory touch-pan-x px-2 lg:px-0">
          {AGE_RANGES.map((age, i) => (
            <Link
              key={i}
              to="/products"
              search={{ age: age.value } as never}
              className="group flex flex-col items-center w-[165px] sm:w-[200px] shrink-0 snap-start transition-transform hover:-translate-y-2"
            >
              <div className="w-full aspect-square overflow-hidden relative rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-sm border border-slate-100 bg-white">
                <img
                  src={age.image}
                  alt={age.label}
                  className="w-full h-full object-cover select-none"
                />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              val: 199,
              img: under199,
              query: { minPrice: 0, maxPrice: 199, sort: "price_desc" as const },
            },
            {
              val: 399,
              img: under399,
              query: { minPrice: 200, maxPrice: 399, sort: "price_desc" as const },
            },
            {
              val: 699,
              img: under699,
              query: { minPrice: 400, maxPrice: 699, sort: "price_desc" as const },
            },
            {
              val: 999,
              img: under999,
              query: { minPrice: 700, maxPrice: 999, sort: "price_desc" as const },
            },
            {
              val: 1499,
              img: under1499,
              query: { minPrice: 1000, maxPrice: 1499, sort: "price_desc" as const },
            },
            { val: "1500+", img: above1500, query: { minPrice: 1500, sort: "price_asc" as const } },
          ].map((tier, idx) => (
            <Link
              key={idx}
              to="/products"
              search={tier.query as never}
              className="block rounded-2xl overflow-hidden shadow-card hover:scale-[1.02] transition-transform duration-300"
            >
              <img
                src={tier.img}
                className="w-full h-auto object-contain"
                alt={`Price tier ${tier.val}`}
              />
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
                <img
                  src={resolveImage(banner.image)}
                  alt="Promo"
                  className="w-full h-auto object-contain rounded-2xl"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shop Our Reels Section */}
      <section className="container mx-auto px-4 py-8 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-black text-slate-800 tracking-wide uppercase">
              Shop Our Reels
            </h2>
          </div>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex md:grid gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide md:grid-cols-5 pb-4 md:pb-0 snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {INSTAGRAM_REELS.map((reel) => (
            <a
              key={reel.id}
              href={reel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[150px] sm:w-[180px] md:w-full shrink-0 block relative aspect-[9/16] overflow-hidden group snap-start bg-slate-100 border-r border-b border-slate-950"
            >
              {/* Floating Instagram Shopping Bag Icon */}
              <div className="absolute top-3 right-3 size-8 rounded-full bg-black/45 backdrop-blur-xs flex items-center justify-center text-white z-10 group-hover:scale-105 transition duration-300">
                <ShoppingBag className="size-4" />
              </div>

              {/* Video Player */}
              <video
                src={reel.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
              />
            </a>
          ))}
        </div>
      </section>

      {/* Verified Testimonials (Dynamic Random Selector) */}
      <section className="container mx-auto px-4 py-12 bg-gradient-to-b from-transparent to-slate-50/40 rounded-3xl mt-6">
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center gap-1.5 bg-[#BFDDF0]/30 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-[#BFDDF0]/50 mb-3 shadow-xs">
            <Star className="size-3 fill-amber-400 text-amber-400" /> Real Customer Feedback
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Loved by Parents</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
            Genuine, verified reviews from real families shopping with us every day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {randomReviews.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 hover:border-[#BFDDF0] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_-10px_rgba(191,221,240,0.4)] p-6 relative transition-all duration-300 flex flex-col"
            >
              <div className="absolute -top-3 right-6 bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-[9px] tracking-wider uppercase px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                <ShieldCheck className="size-3 fill-emerald-100" /> VERIFIED BUYER
              </div>

              <div className="flex items-center gap-0.5 mb-3.5 text-amber-400">
                {[...Array(r.r)].map((_, idx) => (
                  <Star key={idx} className="size-4 fill-current" />
                ))}
              </div>

              <p className="text-[13px] leading-relaxed font-medium text-slate-700 italic mb-6 flex-1">
                "{r.t}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mt-auto">
                <div className="size-10 rounded-full bg-slate-100 border border-slate-200 text-xl flex items-center justify-center shadow-xs shrink-0">
                  {r.i}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold text-slate-800 truncate">{r.n}</div>
                  <div className="flex items-center gap-1.5 text-[10px]    text-slate-400 tracking-wide uppercase">
                    <span>{r.c}</span>
                    <span className="opacity-50">•</span>
                    <span>{r.d}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
