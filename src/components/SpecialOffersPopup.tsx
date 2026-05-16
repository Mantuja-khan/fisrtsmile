import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, ShoppingBag, Percent } from "lucide-react";
import { useProducts } from "@/hooks/useCatalog";
import { resolveImage, effectivePrice } from "@/data/products";

export function SpecialOffersPopup() {
  const [open, setOpen] = useState(false);
  const { data: products = [] } = useProducts();

  useEffect(() => {
    // Ensure it only pops up once per browser session so users aren't annoyed
    const hasSeen = sessionStorage.getItem("special_offers_popup_seen");
    if (!hasSeen) {
      // Give page time to load first
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("special_offers_popup_seen", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Get top discounted items available
  const featuredOffers = products
    .filter((p) => p.offerPct > 10 && p.inStock)
    .sort((a, b) => b.offerPct - a.offerPct)
    .slice(0, 3);

  if (!open || featuredOffers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">

      <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

        {/* Glossy Header Bar */}
        <div className="bg-gradient-to-br from-[#BFDDF0] to-[#FEFD99] p-6 text-center relative overflow-hidden border-b border-[#BFDDF0]/50">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 p-1.5 bg-slate-950/5 hover:bg-slate-950/10 rounded-full text-slate-800 transition-colors z-10"
          >
            <X className="size-5" />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-slate-950/5 backdrop-blur-sm px-4 py-1 rounded-full border border-slate-950/10 inline-flex items-center gap-2 text-slate-950 font-black text-xs uppercase tracking-widest mb-2">
              <Percent className="size-3" /> Limited Time
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-slate-950 tracking-wide flex items-center gap-2">
              <Sparkles className="size-6 fill-slate-950 text-slate-950" /> Best Offers! <Sparkles className="size-6 fill-slate-950 text-slate-950" />
            </h2>
            <p className="text-slate-800/80 text-sm font-   mt-1">Don't miss out on our biggest discounts today.</p>
          </div>
        </div>

        {/* Product Offers List */}
        <div className="p-6 bg-slate-50 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {featuredOffers.map((p) => {
              const final = effectivePrice(p.price, p.offerPct);
              return (
                <Link
                  key={p.id}
                  to="/product/$id"
                  params={{ id: p.id }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm hover:shadow-md hover:border-[#BFDDF0] transition-all group relative overflow-hidden"
                >
                  {/* Top Left Tag */}
                  <div className="absolute top-0 left-0 bg-[#FEFD99] text-slate-950 font-extra   text-[10px] px-3 py-1 rounded-br-xl border-r border-b border-slate-200/80 shadow-xs z-10">
                    Save {p.offerPct}%
                  </div>

                  <div className="size-24 rounded-xl bg-slate-50 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={resolveImage(p.image)}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-extra   text-slate-800 text-sm md:text-base truncate group-hover:text-slate-950 transition-colors">{p.name}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">{p.category_name || 'Trending Product'}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-slate-950 font-black text-lg">₹{final}</span>
                      <span className="text-slate-400 text-xs line-through">₹{p.mrp}</span>
                    </div>
                  </div>

                  <div className="size-10 rounded-full bg-[#BFDDF0]/40 border border-[#BFDDF0]/60 text-slate-900 grid place-items-center group-hover:bg-[#BFDDF0] group-hover:text-slate-950 transition-all shrink-0 shadow-xs">
                    <ShoppingBag className="size-5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-100 text-center">
          <Link
            to="/products"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center w-full py-3.5 bg-slate-950 border border-[#BFDDF0]/20 hover:bg-slate-800 text-white font-   rounded-xl transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
          >
            Explore More Offers →
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-slate-400 mt-3 underline hover:text-slate-600 font-medium"
          >
            Continue to Site
          </button>
        </div>

      </div>
    </div>
  );
}
