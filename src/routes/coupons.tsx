import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, Copy, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/coupons")({
  head: () => ({ meta: [{ title: "My Coupons — Trivoxo Toys" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState("");

  const loadCoupons = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load coupons");
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

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
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon, i) => {
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#802a8f]/15 text-[#802a8f] uppercase tracking-wider">
                      Coupon
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                      {coupon.discount}% Off
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    {coupon.heading || `Get ${coupon.discount}% Off`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {coupon.content || "Valid on all products"}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-50">
                  <span className="font-mono font-bold text-slate-900 tracking-wider text-sm">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#802a8f] bg-[#802a8f]/5 hover:bg-[#802a8f]/10 px-3.5 py-2 rounded-xl transition"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-green-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
