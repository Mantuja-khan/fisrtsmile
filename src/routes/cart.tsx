import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/store/shop";
import { Trash2, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — ToyKart" }] }),
  component: CartPage,
});

function CartPage() {
  const { cartItems, setQty, removeFromCart, subtotal } = useShop();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "TOY10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Coupon TOY10 applied — 10% off!");
    } else if (code === "FIRST5") {
      setDiscount(Math.round(subtotal * 0.05));
      toast.success("Coupon FIRST5 applied — 5% off!");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon");
    }
  };

  const shipping = subtotal > 0 && subtotal < 999 ? 49 : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add some toys to get started!</p>
        <Link to="/products" className="inline-block mt-5 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="bg-surface rounded-xl shadow-card divide-y divide-border">
          {cartItems.map((item) => (
            <div key={item.id} className="p-4 flex gap-3">
              <Link to="/product/$id" params={{ id: item.id }} className="size-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/product/$id" params={{ id: item.id }} className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary">
                  {item.product.name}
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5">{item.product.category_name ?? ""}</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold">₹{Math.round(item.product.price * (1 - (item.product.offerPct || 0) / 100)).toLocaleString("en-IN")}</span>
                  <span className="text-xs line-through text-muted-foreground">₹{item.product.mrp.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="inline-flex items-center border border-input rounded-md text-sm">
                    <button onClick={() => setQty(item.id, item.qty - 1)} className="px-3 py-1">−</button>
                    <span className="px-3 w-10 text-center">{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)} className="px-3 py-1">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive text-sm font-semibold inline-flex items-center gap-1">
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-surface rounded-xl shadow-card p-5 h-max lg:sticky lg:top-24 space-y-4">
          <h2 className="font-bold text-lg">Price Details</h2>

          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code (try FIRST5 or TOY10)"
              className="flex-1 px-2 py-1.5 text-sm border border-input rounded"
            />
            <button onClick={applyCoupon} className="text-sm font-semibold text-primary">Apply</button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            {discount > 0 && <div className="flex justify-between text-discount"><span>Coupon discount</span><span>− ₹{discount.toLocaleString("en-IN")}</span></div>}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-discount font-semibold" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Link to="/checkout" className="block text-center bg-warning text-warning-foreground font-semibold py-2.5 rounded-md hover:brightness-105 transition">
            Place Order
          </Link>
          <p className="text-xs text-discount font-semibold text-center">Free shipping on orders above ₹999</p>
        </aside>
      </div>
    </div>
  );
}
