import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreditCard, Smartphone, Banknote, MapPin, Tag } from "lucide-react";
import api from "@/services/api";
import { z } from "zod";
import { effectivePrice, resolveImage } from "@/data/products";
import { redirectToPayU } from "@/utils/payu";
import ShiprocketLoginButton from "@/components/ShiprocketLoginButton";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Trivoxo Toys" }] }),
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
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [pay, setPay] = useState<"online" | "cod">("online");
  const [busy, setBusy] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Controlled Address Input States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState("");

  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  // Hydrate form states once user profile loads
  useEffect(() => {
    if (user && !hasLoadedProfile) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setPincode(user.pincode || "");
      setCity(user.city || "");
      setState(user.state || "");
      setAddress(user.address || "");
      setHasLoadedProfile(true);
    }
  }, [user, hasLoadedProfile]);

  const applyCoupon = () => {
    if (!couponCode) return;
    const saved = JSON.parse(localStorage.getItem("toyhaat_coupons") || "[]");
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
  const shipping = pay === "cod" ? 49 : (newSubtotal >= 888 ? 0 : 49);
  const total = newSubtotal + codCharge + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-pop border border-slate-100 p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-2">
            <span className="bg-amber-100 text-amber-700 px-3.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-widest inline-block shadow-sm animate-pulse">
              ⚡ Recommended
            </span>
            <h1 className="text-2xl font-display font-black tracking-wide text-slate-800 uppercase">
              Secure Checkout
            </h1>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              Login in seconds using Shiprocket mobile OTP checkout.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Express OTP Login */}
            <ShiprocketLoginButton
              buttonText="Express Checkout via OTP"
              className="w-full py-4 text-sm"
            />
          </div>

          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            By checking out, you agree to ToyHaat's Terms & Conditions. OTP services are powered
            securely by Shiprocket.
          </p>
        </div>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const v = addressSchema.safeParse({
        fullName,
        phone,
        pincode,
        city,
        state,
        landmark: landmark || undefined,
        address,
      });
      if (!v.success) {
        toast.error(v.error.issues[0].message);
        return;
      }

      // Automatically persist/update user's delivery address on their profile in the database
      try {
        await updateProfile({
          full_name: v.data.fullName,
          phone: v.data.phone,
          pincode: v.data.pincode,
          city: v.data.city,
          state: v.data.state,
          address: v.data.address,
        });
      } catch (err) {
        console.error("Failed to automatically update user profile with address:", err);
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

      if (pay === "online") {
        // Get PayU session Hash from backend
        const { data: payuData } = await api.post(`/orders/${data._id}/payu`);

        // CLEAR LOCAL STATE BEFORE REDIRECT so user doesn't see double cart
        clearCart();
        if (appliedCoupon) {
          const saved = JSON.parse(localStorage.getItem("toyhaat_coupons") || "[]");
          const updated = saved.map((c: any) =>
            c.code === appliedCoupon.code ? { ...c, active: false } : c,
          );
          localStorage.setItem("toyhaat_coupons", JSON.stringify(updated));
        }

        // Execute secure dynamic POST to PayU
        redirectToPayU(payuData);
        return; // Browser exits to PayU
      } else {
        clearCart();
        if (appliedCoupon) {
          const saved = JSON.parse(localStorage.getItem("toyhaat_coupons") || "[]");
          const updated = saved.map((c: any) =>
            c.code === appliedCoupon.code ? { ...c, active: false } : c,
          );
          localStorage.setItem("toyhaat_coupons", JSON.stringify(updated));
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
            <h2 className="font-bold flex items-center gap-2 mb-3">
              <MapPin className="size-4 text-primary" /> Delivery Address
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="px-3 py-2 text-sm border border-input rounded"
              />
              <input
                name="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (10 digits)"
                pattern="[0-9]{10}"
                className="px-3 py-2 text-sm border border-input rounded"
              />
              <input
                name="pincode"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode"
                pattern="[0-9]{6}"
                className="px-3 py-2 text-sm border border-input rounded"
              />
              <input
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="px-3 py-2 text-sm border border-input rounded"
              />
              <input
                name="state"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="px-3 py-2 text-sm border border-input rounded"
              />
              <input
                name="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Landmark (optional)"
                className="px-3 py-2 text-sm border border-input rounded"
              />
              <textarea
                name="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address (House no, street, area)"
                className="md:col-span-2 px-3 py-2 text-sm border border-input rounded min-h-20"
              />
            </div>
          </section>

          <section className="bg-surface rounded-xl shadow-card p-5">
            <h2 className="font-bold mb-3">Payment Method</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                {
                  id: "online" as const,
                  icon: CreditCard,
                  label: "Pay Online",
                  note: "PayU (UPI, Card, NetBanking)",
                },
                {
                  id: "cod" as const,
                  icon: Banknote,
                  label: "Cash on Delivery",
                  note: "+ ₹60 charge",
                },
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
            <p className="text-xs text-discount mt-3 font-semibold">
              ✓ Free shipping on prepaid orders or above ₹888
            </p>
          </section>
        </div>

        <aside className="bg-surface rounded-xl shadow-card p-5 h-max space-y-3">
          <h2 className="font-bold">Order Summary</h2>
          <div className="space-y-2 max-h-60 overflow-auto pr-1">
            {cartItems.map((i) => (
              <div key={i.id} className="flex gap-2 text-sm">
                <img
                  src={resolveImage(i.product.image)}
                  alt=""
                  className="size-12 rounded object-cover bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-1">{i.product.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {i.qty}</div>
                </div>
                <div className="font-semibold">
                  ₹
                  {(effectivePrice(i.product.price, i.product.offerPct) * i.qty).toLocaleString(
                    "en-IN",
                  )}
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
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-3 py-2 bg-muted text-foreground text-sm rounded font-medium hover:bg-muted/80"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-[#d4eedb] text-[#009b4d] px-3 py-2 rounded">
                <div className="flex items-center gap-2">
                  <Tag className="size-4" />
                  <span className="font-bold text-sm">Code {appliedCoupon.code} applied!</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-[#009b4d] font-medium">
                <span>Discount ({appliedCoupon.discount}%)</span>
                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-discount font-semibold" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
            {codCharge > 0 && (
              <div className="flex justify-between">
                <span>COD charge</span>
                <span>₹{codCharge}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button
            disabled={busy}
            type="submit"
            className="w-full bg-warning text-warning-foreground font-semibold py-2.5 rounded-md hover:brightness-105 disabled:opacity-60"
          >
            {busy ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
