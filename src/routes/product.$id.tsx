import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProduct, useProducts } from "@/hooks/useCatalog";
import { discountPct, effectivePrice, type Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { useShop } from "@/store/shop";
import { Heart, ShoppingCart, Zap, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [{ title: "Product — ToyKart" }],
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
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main image — top on mobile, right on desktop */}
            <div className="flex-1 order-1 md:order-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted group">
                <img
                  src={product.images[activeImg]}
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
                  <img src={img} alt="" className="w-full h-full object-cover" />
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
            {product.offerPct > 0 && (
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-destructive text-destructive-foreground">
                Special Offer {product.offerPct}%
              </span>
            )}
          </div>
          <div className="text-xs text-discount font-semibold mt-1">
            {product.inStock ? "In stock · Ships within 24 hours" : "Out of stock"}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Recommended age: {product.ageRange}</div>

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

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { icon: Truck, t: "Free shipping", s: "On prepaid" },
              { icon: RotateCcw, t: "Exchange", s: "Same product" },
              { icon: ShieldCheck, t: "Genuine", s: "Brand verified" },
            ].map((b) => (
              <div key={b.t} className="bg-muted rounded-lg p-3">
                <b.icon className="size-5 mx-auto text-primary mb-1" />
                <div className="font-semibold text-foreground">{b.t}</div>
                <div className="text-muted-foreground">{b.s}</div>
              </div>
            ))}
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
        <div className="mt-6 bg-surface rounded-2xl shadow-card p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {related.map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
