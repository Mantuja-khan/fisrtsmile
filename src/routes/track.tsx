import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Package, Truck, Home, CheckCircle2, XCircle, MapPin } from "lucide-react";
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
  awb_code?: string;
  tracking_url?: string;
};

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { orderId?: string } =>
    typeof s.orderId === "string" ? { orderId: s.orderId } : {},
  head: () => ({ meta: [{ title: "Track Order — First Smile" }] }),
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

          {/* Live Shiprocket Info */}
          {order.status !== "cancelled" && order.awb_code && (
             <div className="mt-6 pt-6 border-t border-dashed border-border">
               <LiveShiprocketTracking orderId={order._id} awb={order.awb_code} fallbackUrl={order.tracking_url} />
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
            Need help? Email{" "}
            <a className="text-primary font-semibold" href="mailto:support@toyhaat.com">support@toyhaat.com</a>.
          </p>
        </div>
      )}
    </div>
  );
}

function LiveShiprocketTracking({ orderId, awb, fallbackUrl }: { orderId: string, awb: string, fallbackUrl?: string }) {
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function getTracking() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/orders/${orderId}/track-shipment`);
        if (!active) return;
        setTracking(data);
      } catch (err: any) {
        if (active) setError("Temporary technical lag fetching live scan data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    getTracking();
    return () => { active = false; };
  }, [orderId]);

  // Parse core data safely from Shiprocket dynamic response format
  const trackingData = tracking?.tracking_data || {};
  const tracks = trackingData.shipment_track?.[0] || {};
  const activities = trackingData.shipment_track_activities || [];
  
  const currentStatus = tracks.current_status || "Preparing dispatch";
  const courier = tracks.courier_name || "Shiprocket Partner";

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-extrabold tracking-widest text-white bg-indigo-600 px-2 py-0.5 rounded shadow-sm uppercase">Shiprocket Live</span>
             <span className="text-xs text-slate-500 font-medium">Via {courier}</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">AWB {awb}</div>
        </div>
        {fallbackUrl && (
          <a href={fallbackUrl} target="_blank" rel="noreferrer" className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 shadow-sm">
            View Full Details ↗
          </a>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center text-center gap-3 text-slate-400 font-medium animate-pulse">
          <Truck className="size-6" />
          <span className="text-sm">Connecting to global tracking satellites...</span>
        </div>
      ) : error ? (
        <div className="text-center py-4 bg-amber-50 text-amber-700 text-xs rounded border border-amber-100">
          <span className="font-bold">Note:</span> Tracking credentials verification in progress. {fallbackUrl ? "You can track manually below." : ""}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
           <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
              <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-emerald-200 shadow-md animate-pulse">
                <Package className="size-4 text-white" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Current Status</div>
                <div className="text-sm font-bold text-emerald-900">{currentStatus}</div>
              </div>
           </div>

           {activities.length > 0 ? (
             <div className="p-5 space-y-6 relative before:content-[''] before:absolute before:left-[27px] before:top-[35px] before:bottom-[35px] before:w-0.5 before:bg-slate-100">
               {activities.map((act: any, i: number) => (
                 <div key={i} className="flex gap-4 relative z-10">
                   <div className={`size-4 mt-1 rounded-full shrink-0 border-2 bg-white transition-colors ${i === 0 ? "border-emerald-500" : "border-slate-300"}`} />
                   <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${i === 0 ? "text-slate-900" : "text-slate-600"}`}>{act.activity}</div>
                      <div className="flex items-center justify-between text-xs mt-0.5 font-medium">
                         <span className="text-slate-500 flex items-center gap-1"><MapPin className="size-3" /> {act.location || "Distribution Center"}</span>
                         <span className="text-slate-400 italic font-mono">{act.date ? new Date(act.date).toLocaleString("en-IN", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ""}</span>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="p-6 text-center text-sm text-slate-500 italic font-medium">
               Dispatched from source. Carrier will update scanning checkpoints shortly.
             </div>
           )}
        </div>
      )}
    </div>
  );
}

