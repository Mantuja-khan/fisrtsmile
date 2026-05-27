import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/store/shop";
import { useProducts } from "@/hooks/useCatalog";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Trivoxo Toys" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useShop();
  const { data: products = [] } = useProducts();
  const items = products.filter((p: Product) => wishlist.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <h1 className="text-2xl    mb-4">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-card p-10 text-center">
          <div className="text-6xl mb-3">💝</div>
          <p className="font-semibold">No items in your wishlist yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tap the heart on any product to save it.
          </p>
          <Link
            to="/products"
            className="inline-block mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold"
          >
            Browse Toys
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
