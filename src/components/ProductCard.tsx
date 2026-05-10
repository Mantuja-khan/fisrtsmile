import { Link } from "@tanstack/react-router";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { type Product, discountPct, effectivePrice, resolveImage } from "@/data/products";
import { useShop } from "@/store/shop";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const wished = isInWishlist(product.id);
  const finalPrice = effectivePrice(product.price, product.offerPct);
  const off = discountPct(finalPrice, product.mrp);

  return (
    <div className="product-card group relative bg-surface rounded-xl shadow-card overflow-hidden flex flex-col">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
          toast(wished ? "Removed from wishlist" : "Added to wishlist ❤️");
        }}
        aria-label="Wishlist"
        className="absolute top-2 right-2 z-10 size-8 grid place-items-center rounded-full bg-surface/90 backdrop-blur shadow-card hover:scale-110 transition"
      >
        <Heart className={`size-4 ${wished ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
      </button>

      {product.badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded bg-secondary text-secondary-foreground">
          {product.badge}
        </span>
      )}
      {product.offerPct > 0 && (
        <span className="absolute top-10 left-2 z-10 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded bg-destructive text-destructive-foreground">
          Offer {product.offerPct}%
        </span>
      )}

      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="aspect-[4/3] bg-white overflow-hidden p-3 flex items-center justify-center">
          <img
            src={resolveImage(product.image)}
            alt={product.name}
            loading="lazy"
            width={800}
            height={600}
            className="w-full h-full object-contain"
          />
        </div>
      </Link>

      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <Link to="/product/$id" params={{ id: product.id }} className="text-sm font-medium line-clamp-2">
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 bg-rating text-white text-[11px] px-1.5 py-0.5 rounded font-semibold">
            {product.rating} <Star className="size-2.5 fill-white" />
          </span>
          <span className="text-xs text-muted-foreground">({product.ratingCount.toLocaleString("en-IN")})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
          <span className="font-bold text-base">₹{finalPrice.toLocaleString("en-IN")}</span>
          <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
          <span className="text-xs font-semibold text-discount">{off}% off</span>
        </div>
        <button
          onClick={() => {
            addToCart(product.id);
            toast.success("Added to cart");
          }}
          disabled={!product.inStock}
          className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-md bg-secondary text-secondary-foreground hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ShoppingCart className="size-3.5" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
