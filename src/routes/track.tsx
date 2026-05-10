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

  const currentIdx = order ? STAGES.findIndex((s) => s.key === order.status) : -1;
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
            <div className="mt-6 relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
              <ol className="space-y-6">
                {STAGES.map((s, i) => {
                  const done = i <= currentIdx;
                  return (
                    <li key={s.key} className="flex gap-4 items-start relative">
                      <div className={`size-10 grid place-items-center rounded-full shrink-0 z-10 ${done ? "bg-discount text-white" : "bg-muted text-muted-foreground"}`}>
                        <s.icon className="size-5" />
                      </div>
                      <div>
                        <div className={`font-semibold ${done ? "" : "text-muted-foreground"}`}>{s.label}</div>
                        {i === currentIdx && <div className="text-xs text-discount font-semibold">Current status</div>}
                      </div>
                    </li>
                  );
                })}
              </ol>
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
