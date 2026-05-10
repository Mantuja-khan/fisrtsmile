import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Smartphone, Banknote, MapPin, Tag } from "lucide-react";
import api from "@/services/api";
import { z } from "zod";
import { effectivePrice, resolveImage } from "@/data/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — ToyKart" }] }),
  component: CheckoutPage,
});

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  city: z.string().trim().min(1).max(60),
  state: z.string().trim().min(1).max(60),
  landmark: z.string().max(120).optional(),
  address: z.string().trim().min(5).max(300),
});

function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pay, setPay] = useState<"razorpay" | "cod">("razorpay");
  const [busy, setBusy] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const applyCoupon = () => {
    if (!couponCode) return;
    const saved = JSON.parse(localStorage.getItem("firstsmile_coupons") || "[]");
    const found = saved.find((c: any) => c.code === couponCode && c.active);
    if (found) {
      if (found.phone && user?.phone && found.phone !== user.phone) {
        toast.error("This coupon is not valid for your account.");
        return;
      }
      setAppliedCoupon(found);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid or expired coupon code.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  const newSubtotal = subtotal - discountAmount;

  const codCharge = pay === "cod" ? 60 : 0;
  const shipping = pay === "cod" ? 49 : 0;
  const total = newSubtotal + codCharge + shipping;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Please log in to place your order</h1>
        <Link to="/account" className="inline-block mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold">
          Login / Sign up
        </Link>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const v = addressSchema.safeParse({
        fullName: fd.get("fullName"),
        phone: fd.get("phone"),
        pincode: fd.get("pincode"),
        city: fd.get("city"),
        state: fd.get("state"),
        landmark: fd.get("landmark") || undefined,
        address: fd.get("address"),
      });
      if (!v.success) {
        toast.error(v.error.issues[0].message);
        return;
      }

      const items = cartItems.map((i) => {
        let finalPrice = effectivePrice(i.product.price, i.product.offerPct);
        if (appliedCoupon) {
          finalPrice = Math.round(finalPrice * (1 - appliedCoupon.discount / 100));
        }
        return {
          product_id: i.id,
          name: i.product.name,
          qty: i.qty,
          price: finalPrice,
          image: i.product.image,
        };
      });

      const orderData = {
        orderItems: items,
        shippingAddress: v.data,
        paymentMethod: pay,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: 0,
        totalPrice: total,
        customer_name: v.data.fullName,
        customer_email: user.email!,
        customer_phone: v.data.phone,
      };

      const { data } = await api.post("/orders", orderData);

      if (pay === "razorpay") {
        const res = await loadRazorpay();
        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setBusy(false);
          return;
        }

        // Create Razorpay order on backend
        const { data: rzOrder } = await api.post(`/orders/${data._id}/razorpay`, {
          amount: total,
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder", // Replace with your key
          amount: rzOrder.amount,
          currency: "INR",
          name: "First Smile",
          description: "Order Payment",
          order_id: rzOrder.id,
          handler: async function (response: any) {
            try {
              await api.put(`/orders/${data._id}/pay`, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              clearCart();
              if (appliedCoupon) {
                const saved = JSON.parse(localStorage.getItem("firstsmile_coupons") || "[]");
                const updated = saved.map((c: any) => c.code === appliedCoupon.code ? { ...c, active: false } : c);
                localStorage.setItem("firstsmile_coupons", JSON.stringify(updated));
              }
              toast.success(`Payment successful! Order ID: ${data.order_number}`);
              navigate({ to: "/track", search: { orderId: data.order_number } as never });
            } catch (err) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: v.data.fullName,
            email: user.email,
            contact: v.data.phone,
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        if (appliedCoupon) {
          const saved = JSON.parse(localStorage.getItem("firstsmile_coupons") || "[]");
          const updated = saved.map((c: any) => c.code === appliedCoupon.code ? { ...c, active: false } : c);
          localStorage.setItem("firstsmile_coupons", JSON.stringify(updated));
        }
        toast.success(`Order placed! ID: ${data.order_number}`);
        navigate({ to: "/track", search: { orderId: data.order_number } as never });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          <section className="bg-surface rounded-xl shadow-card p-5">
            <h2 className="font-bold flex items-center gap-2 mb-3"><MapPin className="size-4 text-primary" /> Delivery Address</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input name="fullName" required defaultValue={user?.full_name || ""} placeholder="Full Name" className="px-3 py-2 text-sm border border-input rounded" />
              <input name="phone" required defaultValue={user?.phone || ""} placeholder="Phone (10 digits)" pattern="[0-9]{10}" className="px-3 py-2 text-sm border border-input rounded" />
              <input name="pincode" required defaultValue={user?.pincode || ""} placeholder="Pincode" pattern="[0-9]{6}" className="px-3 py-2 text-sm border border-input rounded" />
              <input name="city" required defaultValue={user?.city || ""} placeholder="City" className="px-3 py-2 text-sm border border-input rounded" />
              <input name="state" required defaultValue={user?.state || ""} placeholder="State" className="px-3 py-2 text-sm border border-input rounded" />
              <input name="landmark" placeholder="Landmark (optional)" className="px-3 py-2 text-sm border border-input rounded" />
              <textarea name="address" required defaultValue={user?.address || ""} placeholder="Address (House no, street, area)" className="md:col-span-2 px-3 py-2 text-sm border border-input rounded min-h-20" />
            </div>
          </section>

          <section className="bg-surface rounded-xl shadow-card p-5">
            <h2 className="font-bold mb-3">Payment Method</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { id: "razorpay" as const, icon: CreditCard, label: "Online Payment", note: "Razorpay (UPI, Card, NetBanking)" },
                { id: "cod" as const, icon: Banknote, label: "Cash on Delivery", note: "+ ₹60 charge" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPay(opt.id)}
                  className={`p-3 rounded-lg border text-left transition ${pay === opt.id ? "border-primary bg-accent" : "border-border bg-surface"}`}
                >
                  <opt.icon className="size-5 mb-1 text-primary" />
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.note}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-discount mt-3 font-semibold">✓ Free shipping on prepaid orders (Razorpay)</p>
          </section>
        </div>

        <aside className="bg-surface rounded-xl shadow-card p-5 h-max space-y-3">
          <h2 className="font-bold">Order Summary</h2>
          <div className="space-y-2 max-h-60 overflow-auto pr-1">
            {cartItems.map((i) => (
              <div key={i.id} className="flex gap-2 text-sm">
                <img src={resolveImage(i.product.image)} alt="" className="size-12 rounded object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-1">{i.product.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {i.qty}</div>
                </div>
                <div className="font-semibold">
                  ₹{(effectivePrice(i.product.price, i.product.offerPct) * i.qty).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
          
          {/* Coupon Section */}
          <div className="border-t border-border pt-3">
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="Enter Coupon Code" 
                  className="flex-1 px-3 py-2 text-sm border border-input rounded outline-none focus:ring-1 focus:ring-primary uppercase"
                />
                <button type="button" onClick={applyCoupon} className="px-3 py-2 bg-muted text-foreground text-sm rounded font-medium hover:bg-muted/80">Apply</button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-[#d4eedb] text-[#009b4d] px-3 py-2 rounded">
                <div className="flex items-center gap-2">
                  <Tag className="size-4" />
                  <span className="font-bold text-sm">Code {appliedCoupon.code} applied!</span>
                </div>
                <button type="button" onClick={removeCoupon} className="text-xs font-semibold hover:underline">Remove</button>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            {appliedCoupon && (
              <div className="flex justify-between text-[#009b4d] font-medium"><span>Discount ({appliedCoupon.discount}%)</span><span>-₹{discountAmount.toLocaleString("en-IN")}</span></div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-discount font-semibold" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            {codCharge > 0 && <div className="flex justify-between"><span>COD charge</span><span>₹{codCharge}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button disabled={busy} type="submit" className="w-full bg-warning text-warning-foreground font-semibold py-2.5 rounded-md hover:brightness-105 disabled:opacity-60">
            {busy ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
