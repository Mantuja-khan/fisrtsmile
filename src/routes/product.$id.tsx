import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useCatalog";
import { discountPct, effectivePrice, type Product, resolveImage } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { useShop } from "@/store/shop";
import { Heart, ShoppingCart, Zap, Truck, RotateCcw, ShieldCheck, Star, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [{ title: "Product — First Smile" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: products = [] } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [isEnlarged, setIsEnlarged] = useState(false);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading product...</div>;
  }
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="text-primary underline">Browse products</Link>
      </div>
    );
  }

  const wished = isInWishlist(product.id);
  const finalPrice = effectivePrice(product.price, product.offerPct);
  const off = discountPct(finalPrice, product.mrp);
  const related = products.filter((p: Product) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="bg-surface rounded-2xl shadow-card p-4 md:p-6 grid md:grid-cols-[1fr_1.4fr] gap-6">
        <div>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Thumbnails — left column on desktop, row below on mobile (rendered after main) */}
            <div className="hidden md:flex md:flex-col gap-2 order-1">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`size-16 rounded-md overflow-hidden border-2 ${activeImg === i ? "border-primary" : "border-border"}`}
                >
                  <img src={resolveImage(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main image — top on mobile, right on desktop */}
            <div className="flex-1 order-1 md:order-2">
              <div 
                className="aspect-square rounded-xl overflow-hidden bg-muted group cursor-zoom-in"
                onClick={() => setIsEnlarged(true)}
              >
                <img
                  src={resolveImage(product.images[activeImg])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            {/* Thumbnails row — shown below main image on mobile only */}
            <div className="flex md:hidden gap-2 order-2 justify-center">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`size-14 rounded-md overflow-hidden border-2 ${activeImg === i ? "border-primary" : "border-border"}`}
                >
                  <img src={resolveImage(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="hidden md:flex gap-3 mt-4">
            <button
              onClick={() => { addToCart(product.id, qty); toast.success("Added to cart"); }}
              disabled={!product.inStock}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-md bg-secondary text-secondary-foreground font-semibold hover:brightness-105 disabled:opacity-50"
            >
              <ShoppingCart className="size-4" /> Add to Cart
            </button>
            <button
              onClick={() => { addToCart(product.id, qty); navigate({ to: "/checkout" }); }}
              disabled={!product.inStock}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-md bg-warning text-warning-foreground font-semibold hover:brightness-105 disabled:opacity-50"
            >
              <Zap className="size-4" /> Buy Now
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">{product.category_name}</div>
          <h1 className="text-xl md:text-2xl font-bold mt-1">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-0.5 bg-rating text-white text-xs px-2 py-0.5 rounded font-semibold">
              {product.rating} <Star className="size-3 fill-white" />
            </span>
            <span className="text-sm text-muted-foreground">{product.ratingCount.toLocaleString("en-IN")} ratings</span>
          </div>

          <div className="mt-3 flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold">₹{finalPrice.toLocaleString("en-IN")}</span>
            <span className="text-base text-muted-foreground line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
            <span className="text-sm font-semibold text-discount">{off}% off</span>
            {product.badge && String(product.badge).split(",").filter(Boolean).map((b) => (
              <span key={b} className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200 shadow-xs">
                <Sparkles className="size-3 fill-current text-amber-500 animate-pulse" /> {b.trim()}
              </span>
            ))}
          </div>

          {/* Dynamic Expiry Timer if product is NOT already expired */}
          {product.offerExpiresAt && product.offerPct > 0 && (
            <div className="mt-3">
              <Countdown deadline={product.offerExpiresAt} />
            </div>
          )}
          <div className="text-xs text-discount font-semibold mt-1">
            {product.inStock ? "In stock · Ships within 24 hours" : "Out of stock"}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2 text-slate-900">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {(product.weight || product.length) && (
            <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Specifications</h3>
               <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                 {product.weight !== undefined && (
                   <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                     <span className="text-slate-500">Weight</span>
                     <span className="font-bold text-slate-800">{product.weight} KG</span>
                   </div>
                 )}
                 <div className="flex justify-between border-b border-slate-200/50 pb-1.5 col-span-2 sm:col-span-1">
                   <span className="text-slate-500">Dimensions (L×B×H)</span>
                   <span className="font-bold text-slate-800">
                     {product.length ?? 10} × {product.breadth ?? 10} × {product.height ?? 10} CM
                   </span>
                 </div>
               </div>
            </div>
          )}
          {product.ageRange && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Recommended Age Range</span>
              <div className="flex flex-wrap gap-2">
                {String(product.ageRange).split(",").filter(Boolean).map((age) => (
                  <span key={age} className="text-xs font-extrabold bg-[#BFDDF0]/30 text-slate-800 px-3 py-1 rounded-full border border-[#BFDDF0]/60 shadow-xs uppercase tracking-wide">
                    {age.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-semibold">Quantity</span>
            <div className="inline-flex items-center border border-input rounded-md">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1.5">−</button>
              <span className="px-3 w-10 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-1.5">+</button>
            </div>
            <button
              onClick={() => { toggleWishlist(product.id); toast(wished ? "Removed from wishlist" : "Added to wishlist ❤️"); }}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Heart className={`size-4 ${wished ? "fill-destructive text-destructive" : ""}`} /> Wishlist
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" /> Safely Dispatched
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { icon: Truck, t: "Fast Dispatch", c: "bg-[#BFDDF0]/30 text-slate-800 border-[#BFDDF0]/50" },
                { icon: ShieldCheck, t: "Safe Packaging", c: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { icon: RotateCcw, t: "Easy Exchange", c: "bg-purple-50 text-purple-700 border-purple-100" },
                { icon: Sparkles, t: "100% Genuine", c: "bg-amber-50 text-amber-800 border-amber-100" },
              ].map((b) => (
                <div key={b.t} className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg border shadow-xs text-[11px] font-bold leading-none ${b.c}`}>
                  <b.icon className="size-4 shrink-0" />
                  <span>{b.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-14 inset-x-0 z-30 bg-surface border-t border-border p-2 flex gap-2">
        <button
          onClick={() => { addToCart(product.id, qty); toast.success("Added to cart"); }}
          disabled={!product.inStock}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-md bg-secondary text-secondary-foreground font-semibold disabled:opacity-50"
        >
          <ShoppingCart className="size-4" /> Add
        </button>
        <button
          onClick={() => { addToCart(product.id, qty); navigate({ to: "/checkout" }); }}
          disabled={!product.inStock}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-md bg-warning text-warning-foreground font-semibold disabled:opacity-50"
        >
          <Zap className="size-4" /> Buy Now
        </button>
      </div>

      <ProductReviews productId={product.id} />

      {related.length > 0 && (
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="text-center py-6 border-b border-slate-100 bg-slate-50/30">
             <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Related Products</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}
      {isEnlarged && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[10000] flex items-center justify-center select-none" onClick={() => setIsEnlarged(false)}>
          <button 
            onClick={() => setIsEnlarged(false)} 
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-white/10 rounded-full transition hover:bg-white/20 z-50"
          >
            <X className="size-8" />
          </button>
          
          {product.images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + product.images.length) % product.images.length); }}
                className="absolute left-4 text-white/80 hover:text-white p-3 bg-white/10 rounded-full transition hover:bg-white/20 md:left-8 z-50"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % product.images.length); }}
                className="absolute right-4 text-white/80 hover:text-white p-3 bg-white/10 rounded-full transition hover:bg-white/20 md:right-8 z-50"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
            <img 
              src={resolveImage(product.images[activeImg])} 
              alt={product.name} 
              className="max-w-full max-h-[90vh] object-contain cursor-zoom-out animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Countdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(deadline).getTime();
    
    const calc = () => {
      const now = new Date().getTime();
      const dist = target - now;
      if (dist <= 0) return setTimeLeft("Offer Expired");

      const d = Math.floor(dist / (1000 * 60 * 60 * 24));
      const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((dist % (1000 * 60)) / 1000);

      let str = "";
      if (d > 0) str += `${d}d `;
      str += `${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
      setTimeLeft(str);
    };

    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft || timeLeft === "Offer Expired") return null;

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm inline-flex">
      <Clock className="size-4 animate-pulse" />
      <span className="text-xs font-semibold">Deal ends in:</span>
      <span className="text-sm font-mono font-bold">{timeLeft}</span>
    </div>
  );
}

