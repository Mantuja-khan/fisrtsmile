import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Package, Truck, Home, CheckCircle2, XCircle } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

type OrderRow = {
  _id: string;
  order_number: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  total: number;
  payment_method: string;
  customer_name: string;
};

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { orderId?: string } =>
    typeof s.orderId === "string" ? { orderId: s.orderId } : {},
  head: () => ({ meta: [{ title: "Track Order — ToyKart" }] }),
  component: TrackPage,
});

const STAGES = [
  { key: "placed", icon: CheckCircle2, label: "Order Placed" },
  { key: "processing", icon: Package, label: "Packed / Processing" },
  { key: "shipped", icon: Truck, label: "Shipped" },
  { key: "delivered", icon: Home, label: "Delivered" },
] as const;

function TrackPage() {
  const search = Route.useSearch();
  const [orderId, setOrderId] = useState(search.orderId ?? "");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(async (num: string) => {
    if (!num) return;
    setLoading(true);
    try {
      // We need a way to fetch order by order_number
      // For now, I'll fetch all orders and filter or add a backend endpoint
      // Adding backend endpoint for track is better.
      const { data } = await api.get(`/orders/track/${num.trim().toUpperCase()}`);
      
      if (!data) {
        toast.error("No order found with that ID");
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load order");
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search.orderId) loadOrder(search.orderId);
  }, [search.orderId, loadOrder]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
        await api.put(`/orders/${order._id}/cancel`);
        toast.success("Order cancelled. Refund (if prepaid) in 4–10 working days.");
        setOrder({ ...order, status: "cancelled" });
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
        setCancelling(false);
    }
  };

  const currentIdx = order ? STAGES.findIndex((s) => s.key === order.status.toLowerCase()) : -1;
  const canCancel = order && (order.status === "placed" || order.status === "processing");

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); loadOrder(orderId); }}
        className="bg-surface rounded-xl shadow-card p-5 flex flex-col md:flex-row gap-3"
      >
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID (e.g. TK12345678)"
          className="flex-1 px-3 py-2.5 text-sm border border-input rounded"
          required
        />
        <button disabled={loading} className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded disabled:opacity-60">
          {loading ? "Loading..." : "Track"}
        </button>
      </form>

      {order && (
        <div className="bg-surface rounded-xl shadow-card mt-4 p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Order ID</div>
              <div className="font-bold">{order.order_number}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleString("en-IN")} · ₹{Number(order.total).toLocaleString("en-IN")} · {order.payment_method.toUpperCase()}
              </div>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded text-white ${
              order.status === "cancelled" ? "bg-destructive" : order.status === "delivered" ? "bg-discount" : "bg-primary"
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          {order.status === "cancelled" ? (
            <div className="mt-6 flex items-center gap-3 bg-destructive/10 text-destructive rounded-lg p-4">
              <XCircle className="size-6" />
              <div>
                <div className="font-semibold">Order cancelled</div>
                <div className="text-xs">Refund (if prepaid) is processed in 4–10 working days.</div>
              </div>
            </div>
          ) : (
            <div className="mt-12 mb-8 relative">
              {/* Progress Track Line background */}
              <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 bg-muted rounded-full" />
              
              {/* Animated / Filled Progress Line */}
              <div 
                className="absolute left-[12.5%] top-5 h-1 bg-discount rounded-full transition-all duration-1000 ease-out"
                style={{ width: currentIdx === -1 ? "0%" : `${(Math.max(0, currentIdx) / (STAGES.length - 1)) * 75}%` }}
              />

              <div className="relative flex justify-between items-start">
                {STAGES.map((s, i) => {
                  const done = i <= currentIdx;
                  const isActive = i === currentIdx;
                  return (
                    <div key={s.key} className="flex flex-col items-center flex-1 text-center group">
                      {/* Icon Container */}
                      <div className={`size-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${done ? "bg-discount text-white shadow-md scale-110" : "bg-white border-2 border-muted text-muted-foreground"}`}>
                        <s.icon className="size-5" />
                        {isActive && (
                          <span className="absolute inset-0 rounded-full border-2 border-discount animate-ping opacity-75"></span>
                        )}
                      </div>
                      {/* Label */}
                      <div className="mt-3 flex flex-col items-center">
                        <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide transition-colors ${done ? "text-foreground" : "text-muted-foreground/70"}`}>
                          {s.label}
                        </span>
                        {isActive && (
                          <span className="inline-block mt-1 text-[9px] font-extrabold bg-discount/10 text-discount px-1.5 py-0.5 rounded border border-discount/20 animate-pulse uppercase">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {canCancel && (
            <div className="mt-5 border-t border-border pt-4">
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground font-semibold px-4 py-2 rounded-md hover:brightness-110 disabled:opacity-60"
              >
                <XCircle className="size-4" /> {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Cancellation is allowed only before dispatch. Read our <a href="/policies/returns" className="text-primary font-semibold">Cancellation Policy</a>.
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            You'll receive WhatsApp & email updates at every stage. Need help? Email{" "}
            <a className="text-primary font-semibold" href="mailto:firstsmile19@gmail.com">firstsmile19@gmail.com</a>.
          </p>
        </div>
      )}
    </div>
  );
}
