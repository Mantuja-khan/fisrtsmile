import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";
import { Ticket, Copy, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/coupons")({
  head: () => ({ meta: [{ title: "My Coupons — Toy Haat" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState("");
  const [isOfferClaimed, setIsOfferClaimed] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");

  const loadCoupons = () => {
    const saved = JSON.parse(localStorage.getItem("toyhaat_coupons") || "[]");
    if (user && user.phone) {
      setCoupons(saved.filter((c: any) => c.phone === user.phone));
    }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("toyhaat_coupons") || "[]");
    if (user && user.phone) {
      const hasCoupon = saved.some((c: any) => c.phone === user.phone);
      setIsOfferClaimed(hasCoupon);
    } else {
      setIsOfferClaimed(false);
    }
    loadCoupons();
  }, [user]);

  const handleClaimOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimPhone) return;
    if (user && user.phone && claimPhone !== user.phone) {
      toast.error("Please enter the mobile number you registered with.");
      return;
    }

    const code = "FS5OFF-" + Math.floor(1000 + Math.random() * 9000);
    const saved = JSON.parse(localStorage.getItem("toyhaat_coupons") || "[]");
    saved.push({ code, discount: 5, active: true, phone: claimPhone });
    localStorage.setItem("toyhaat_coupons", JSON.stringify(saved));

    setIsOfferClaimed(true);
    loadCoupons();
    toast.success(`Coupon code ${code} unlocked successfully! 🎉`);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl    mb-4">Please log in</h2>
        <p className="text-muted-foreground">You need to log in to view your coupons.</p>
      </div>
    );
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied to clipboard!");
    setTimeout(() => setCopiedCode(""), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="size-8 text-[#802a8f]" />
        <h1 className="text-3xl font-display text-foreground">My Coupons</h1>
      </div>

      {!isOfferClaimed && (
        <div className="bg-gradient-to-br from-[#802a8f]/5 via-white to-secondary/5 rounded-2xl p-6 border border-[#802a8f]/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex-1 max-w-md">
            <div className="inline-block px-2.5 py-1 bg-warning/20 text-warning-foreground text-[10px] font-extrabold uppercase rounded mb-2 tracking-wider">Available Offer</div>
            <h2 className="text-xl    text-foreground">Get 5% Instant Discount</h2>
            <p className="text-sm text-muted-foreground mt-1">Unlock a 5% discount on all purchases by entering your mobile number.</p>
          </div>
          <form onSubmit={handleClaimOffer} className="flex gap-2 w-full md:w-auto shrink-0">
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="10-digit mobile"
              value={claimPhone}
              onChange={e => setClaimPhone(e.target.value.replace(/\D/g, ''))}
              className="px-4 py-3 border border-border bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#802a8f]/30 max-w-[180px]"
            />
            <button type="submit" className="px-5 py-3 bg-[#802a8f] text-white text-sm    rounded-xl shadow-sm hover:brightness-110 transition shrink-0">Get Offer</button>
          </form>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-border shadow-sm">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="size-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl    mb-2">No Active Coupons</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have any active coupons at the moment. Keep shopping to unlock new offers!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((coupon, i) => {
            const isUsed = !coupon.active;
            return (
              <div key={i} className={`bg-gradient-to-r from-[#802a8f]/10 to-transparent rounded-2xl border border-[#802a8f]/20 overflow-hidden relative shadow-sm transition-all duration-300 ${isUsed ? 'opacity-60 grayscale blur-[1px] cursor-not-allowed select-none' : ''}`}>
                <div className={`absolute top-0 left-0 bottom-0 w-2 ${isUsed ? 'bg-gray-400' : 'bg-[#802a8f]'}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs    uppercase rounded-md mb-2 ${isUsed ? 'bg-gray-400/20 text-gray-500' : 'bg-[#802a8f]/20 text-[#802a8f]'}`}>
                        {isUsed ? 'Used Offer' : 'Special Offer'}
                      </span>
                      <h3 className="text-xl    text-foreground">Get {coupon.discount}% Off</h3>
                      <p className="text-sm text-muted-foreground">Valid on all products</p>
                    </div>
                    <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-xl border border-border">
                      {isUsed ? '🔒' : '🎁'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-border border-dashed">
                    <span className={`font-mono    text-lg text-foreground tracking-wider ${isUsed ? 'line-through text-muted-foreground' : ''}`}>{coupon.code}</span>
                    <button
                      disabled={isUsed}
                      onClick={() => handleCopy(coupon.code)}
                      className={`p-2 text-muted-foreground hover:text-[#802a8f] transition rounded-lg ${isUsed ? 'bg-gray-100 cursor-not-allowed' : 'bg-muted'}`}
                    >
                      {isUsed ? (
                        <span className="text-xs    uppercase text-red-500 tracking-wider">Used</span>
                      ) : copiedCode === coupon.code ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <Copy className="size-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
