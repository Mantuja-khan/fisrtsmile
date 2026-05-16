import { Link, useSearch } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type Product, effectivePrice, resolveImage } from "@/data/products";
import { useShop } from "@/store/shop";
import { toast } from "sonner";
import { HighlightText } from "@/components/HighlightText";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const wished = isInWishlist(product.id);
  const finalPrice = effectivePrice(product.price, product.offerPct);
  
  // Safely retrieve the current active search context for term highlighting
  const activeSearch = useSearch({ strict: false }) as any;
  const highlightTerm = activeSearch?.q || "";

  // Helper function to truncate title to 3-4 words on small screen viewports
  const getTruncatedName = (name: string) => {
    const words = name.split(" ");
    if (words.length > 4) {
      return words.slice(0, 4).join(" ") + " ....";
    }
    return name;
  };

  return (
    <div className="product-card group relative bg-white border border-gray-100 rounded shadow-sm flex flex-col text-center h-full overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Badges */}
      <div className="absolute top-2 sm:top-3 left-0 z-10 flex flex-col gap-1 items-start">
        {product.isSale && (
          <span className="text-[9px] sm:text-[10px] font-black uppercase bg-[#BFDDF0] text-slate-900 px-1.5 sm:px-2 py-0.5 shadow-xs animate-[pulse_1.2s_infinite] tracking-wider border border-slate-200/50">
            ⚡ Flash Sale
          </span>
        )}
        {product.offerPct > 0 && (
          <span className="text-[9px] sm:text-[10px] font-black uppercase bg-[#BFDDF0] text-slate-900 px-1.5 sm:px-2 py-0.5 shadow-xs border border-slate-200/50">
            Sale {product.offerPct}%
          </span>
        )}
        {product.badge && String(product.badge).split(",")
          .map(b => b.trim())
          .filter(b => Boolean(b) && !["best seller", "best seller product", "bestseller"].includes(b.toLowerCase()))
          .map((b) => (
          <span key={b} className="text-[9px] sm:text-[10px] font-bold uppercase bg-amber-500 text-white px-1.5 sm:px-2 py-0.5 shadow-sm">
            {b}
          </span>
        ))}
        {!product.inStock && (
          <span className="text-[9px] sm:text-[10px] font-bold uppercase bg-slate-600 text-white px-1.5 sm:px-2 py-0.5 shadow-sm">
            Sold Out
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
          toast(wished ? "Removed from wishlist" : "Added to wishlist ❤️");
        }}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1 text-gray-400 hover:text-[#DC2626] transition-colors hover:scale-110"
      >
        <Heart className={`size-4 sm:size-5 ${wished ? "fill-[#DC2626] text-[#DC2626]" : ""}`} />
      </button>

      {/* Image Container - Optimized square aspect */}
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="aspect-square bg-white p-1 sm:p-2 flex items-center justify-center overflow-hidden border-b border-gray-50">
          <img
            src={resolveImage(product.image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-1.5 sm:p-2.5 flex flex-col flex-1 justify-between">
        {/* Responsive Centered Name with Dynamic Highlight */}
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="text-[11px] sm:text-[13px] font-bold text-gray-700 hover:text-slate-950 hover:underline decoration-[#BFDDF0] decoration-2 line-clamp-2 leading-relaxed mb-1 sm:mb-1.5 transition-all min-h-[2rem] sm:min-h-[2.3rem] flex items-center justify-center px-0.5"
        >
          {/* Truncated view for mobile screens */}
          <span className="sm:hidden block">
            <HighlightText text={getTruncatedName(product.name)} highlight={highlightTerm} />
          </span>
          {/* Full detail view for desktop screens */}
          <span className="hidden sm:block">
            <HighlightText text={product.name} highlight={highlightTerm} />
          </span>
        </Link>

        {/* Age Ranges */}
        {product.age_range && (
          <div className="flex flex-wrap items-center justify-center gap-1 mb-1.5">
            {String(product.age_range).split(",").filter(Boolean).map((age) => (
              <span key={age} className="text-[9px] font-extrabold bg-[#BFDDF0]/30 text-slate-800 px-1.5 py-0.5 rounded border border-[#BFDDF0]/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] uppercase tracking-wider">
                {age.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Spacer push downward layout components */}
        <div className="mt-auto flex flex-col gap-1 sm:gap-1.5">
          {/* Price Section */}
          <div className="flex flex-col lg:flex-row items-center lg:items-baseline lg:justify-center lg:gap-2">
            <div className="text-slate-900 font-black text-xs sm:text-base tracking-wide">
              Rs. {finalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] sm:text-[11px] text-gray-500 font-semibold lg:mt-0 mt-0.5">
              M.R.P.: <span className="line-through ml-0.5">Rs. {product.mrp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Outlined Action Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.inStock) {
                addToCart(product.id);
                toast.success("Added to cart 🛒");
              }
            }}
            className={`w-full py-1 sm:py-1.5 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 border rounded-full ${
              product.inStock
                ? "border-slate-300 text-slate-700 bg-white hover:bg-[#FEFD99] hover:border-[#FEFD99] hover:text-slate-900"
                : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "ADD TO CART" : "NOTIFY ME"}
          </button>
        </div>
      </div>
    </div>
  );
}
