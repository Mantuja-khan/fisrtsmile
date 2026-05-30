import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { type Product, effectivePrice, resolveImage } from "@/data/products";
import { useShop } from "@/store/shop";
import { toast } from "sonner";
import { HighlightText } from "@/components/HighlightText";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const wished = isInWishlist(product.id);
  const finalPrice = effectivePrice(product.price, product.offerPct);

  // Use useRouterState to safely read search params without throwing on routes
  // that don't define validateSearch (e.g. /product/$id).
  // location.search may be a raw string ("?q=toy") or a parsed object.
  const locationSearch = useRouterState({ select: (s) => s.location.search });
  const highlightTerm = (() => {
    if (!locationSearch) return "";
    if (typeof locationSearch === "string") {
      return new URLSearchParams(locationSearch).get("q") || "";
    }
    return (locationSearch as any)?.q || "";
  })();

  const discountPct = product.offerPct > 0
    ? product.offerPct
    : product.mrp > finalPrice
    ? Math.round(((product.mrp - finalPrice) / product.mrp) * 100)
    : 0;


  return (
    <div className="product-card group relative bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300 border border-slate-100 h-full">

      {/* ─── Top Row: Sale badge | Wishlist ─── */}
      <div className="flex items-start justify-between px-2 pt-2 gap-1">
        {/* Sale % badge */}
        <div className="shrink-0 min-w-[44px]">
          {discountPct > 0 ? (
            <span className="inline-block bg-[#BFDDF0] text-slate-900 text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-sm tracking-wide whitespace-nowrap">
              SALE {discountPct}%
            </span>
          ) : product.isSale ? (
            <span className="inline-block bg-[#BFDDF0] text-slate-900 text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-sm tracking-wide whitespace-nowrap">
              ⚡ SALE
            </span>
          ) : (
            <span className="invisible text-[9px]">—</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
            toast(wished ? "Removed from wishlist" : "Added to wishlist ❤️");
          }}
          className="shrink-0 p-0.5 text-gray-300 hover:text-[#DC2626] transition-colors hover:scale-110"
        >
          <Heart className={`size-4 sm:size-5 ${wished ? "fill-[#DC2626] text-[#DC2626]" : ""}`} />
        </button>
      </div>

      {/* ─── Product Image ─── */}
      <Link to="/product/$id" params={{ id: product.id }} className="block px-2 pt-1 pb-1">
        <div className="aspect-square bg-white flex items-center justify-center overflow-hidden rounded-xl relative">
          <img
            src={resolveImage(product.image)}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${
              product.images && product.images.length > 1 ? "group-hover:hidden" : ""
            }`}
          />
          {product.images && product.images.length > 1 && (
            <img
              src={resolveImage(product.images[1])}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain hidden group-hover:block bg-white"
            />
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
              <span className="bg-slate-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ─── Product Name ─── */}
      <div className="px-2 pb-0.5 text-center">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="text-[10px] sm:text-[12px] font-semibold text-gray-700 hover:text-slate-950 hover:underline decoration-[#BFDDF0] decoration-2 line-clamp-2 leading-snug transition-all"
        >
          <HighlightText text={product.name} highlight={highlightTerm} />
        </Link>
      </div>



      {/* ─── Price + Add to Cart ─── */}
      <div className="mt-auto px-2 pb-2 flex flex-col gap-1">
        {/* Price row */}
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-slate-900 font-black text-sm sm:text-base tracking-wide">
            Rs.{" "}
            {finalPrice.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          {product.mrp > finalPrice && (
            <span className="text-[9px] sm:text-[11px] text-gray-400 line-through">
              Rs.{" "}
              {product.mrp.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (product.inStock) {
              addToCart(product.id);
              toast.success("Added to cart 🛒");
            }
          }}
          className={`w-full flex items-center justify-center gap-1 py-1 sm:py-1.5 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300 ${
            product.inStock
              ? "bg-[#1c4f82] text-white hover:bg-[#163d65] active:scale-95 shadow-sm hover:shadow-md"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="size-3 sm:size-3.5" />
          {product.inStock ? "Add to Cart" : "Notify Me"}
        </button>
      </div>
    </div>
  );
}
