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

  return (
    <div className="product-card group relative bg-white border border-gray-100 rounded shadow-sm flex flex-col text-center h-full overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Badges */}
      <div className="absolute top-3 left-0 z-10 flex flex-col gap-1 items-start">
        {product.offerPct > 0 && (
          <span className="text-[10px] font-bold uppercase bg-[#E43E3D] text-white px-2 py-0.5 shadow-sm">
            Sale {product.offerPct}%
          </span>
        )}
        {!product.inStock && (
          <span className="text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 shadow-sm">
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
        className="absolute top-3 right-3 z-10 p-1 text-gray-400 hover:text-[#E43E3D] transition-colors hover:scale-110"
      >
        <Heart className={`size-5 ${wished ? "fill-[#E43E3D] text-[#E43E3D]" : ""}`} />
      </button>

      {/* Image Container - Optimized square aspect */}
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="aspect-square bg-white p-4 flex items-center justify-center overflow-hidden border-b border-gray-50">
          <img
            src={resolveImage(product.image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Centered Name with Dynamic Highlight */}
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="text-[12px] sm:text-[13px] font-medium text-gray-700 hover:text-[#E43E3D] line-clamp-2 leading-relaxed mb-3 transition-colors min-h-[2.8rem] flex items-center justify-center px-1"
        >
          <HighlightText text={product.name} highlight={highlightTerm} />
        </Link>

        {/* Spacer push downward layout components */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Price Section */}
          <div className="flex flex-col items-center">
            <div className="text-[#E43E3D] font-bold text-base tracking-wide">
              Rs. {finalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
              M.R.P.: <span className="line-through ml-1">Rs. {product.mrp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Outlined Action Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.inStock) {
                addToCart(product.id);
                toast.success("Added to cart");
              }
            }}
            className={`w-full py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 border rounded-sm ${
              product.inStock
                ? "border-gray-900 text-gray-900 bg-white hover:bg-gray-900 hover:text-white"
                : "border-gray-400 text-gray-500 bg-gray-50 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "ADD TO CART" : "NOTIFY ME"}
          </button>
        </div>
      </div>
    </div>
  );
}
