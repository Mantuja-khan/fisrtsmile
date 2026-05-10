import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

type Order = {
  _id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, unknown>;
  items: { product: string; name: string; quantity: number; price: number; image?: string }[];
  subtotal: number;
  shipping: number;
  cod_charge: number;
  total: number;
  payment_method: string;
  isPaid: boolean;
  status: OrderStatus;
  createdAt: string;
};

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statusColors: Record<OrderStatus, string> = {
  placed: "bg-primary text-primary-foreground",
  processing: "bg-warning text-warning-foreground",
  shipped: "bg-secondary text-secondary-foreground",
  delivered: "bg-discount text-white",
  cancelled: "bg-destructive text-destructive-foreground",
};

function AdminOrders() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
        const { data } = await api.get("/orders");
        return data as Order[];
    },
  });

  const sendWhatsApp = (o: Order, status: "shipped" | "delivered") => {
    if (!o.customer_phone) {
      toast.error("No phone number on this order");
      return;
    }
    const phone = o.customer_phone.replace(/[^\d]/g, "");
    const intl = phone.length === 10 ? `91${phone}` : phone;
    const msg =
      status === "shipped"
        ? `Hi ${o.customer_name}! 📦 Great news — your First Smile order ${o.order_number} has been *shipped* and is on its way. Track it anytime at https://firstsmile.app/track . Thank you for shopping with us!`
        : `Hi ${o.customer_name}! 🎉 Your First Smile order ${o.order_number} has been *delivered successfully*. We hope your little one loves it! Please share a review — it means a lot to us. ❤️`;
    const url = `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const setStatus = async (o: Order, status: OrderStatus) => {
    let newWin: Window | null = null;
    if ((status === "shipped" || status === "delivered") && o.customer_phone) {
        newWin = window.open("about:blank", "_blank");
    }

    try {
        const capStatus = status.charAt(0).toUpperCase() + status.slice(1);
        await api.put(`/orders/${o._id}/status`, { status: capStatus });
        toast.success(`Order marked as ${status}`);
        qc.invalidateQueries({ queryKey: ["admin-orders"] });

        // Auto-open WhatsApp with a pre-filled message for shipped / delivered
        if (newWin && o.customer_phone) {
            const phone = o.customer_phone.replace(/[^\d]/g, "");
            const intl = phone.length === 10 ? `91${phone}` : phone;
            const msg = status === "shipped"
                ? `Hi ${o.customer_name}! 📦 Great news — your First Smile order ${o.order_number} has been *shipped* and is on its way. Track it anytime at https://firstsmile.app/track . Thank you for shopping with us!`
                : `Hi ${o.customer_name}! 🎉 Your First Smile order ${o.order_number} has been *delivered successfully*. We hope your little one loves it! Please share a review — it means a lot to us. ❤️`;
            newWin.location.href = `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
        }
    } catch (error: any) {
        if (newWin) newWin.close();
        toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const setPaymentPaid = async (o: Order) => {
    if (!confirm("Are you sure you want to mark this order as paid?")) return;
    try {
        await api.put(`/orders/${o._id}/status`, { isPaid: true });
        toast.success(`Order marked as paid`);
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update payment status");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Orders ({orders.length})</h2>
      <div className="bg-surface rounded-xl shadow-card divide-y divide-border">
        {orders.map((o) => (
          <div key={o._id} className="p-3">
            <button
              onClick={() => setOpen(open === o._id ? null : o._id)}
              className="w-full text-left flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{o.order_number}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {o.customer_name} · {new Date(o.createdAt).toLocaleString("en-IN")} · <span className={o.isPaid ? 'text-success font-bold' : 'text-warning font-bold'}>{o.isPaid ? 'PAYMENT DONE' : 'PENDING'}</span> ({o.payment_method.toUpperCase()})
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">₹{Number(o.total).toLocaleString("en-IN")}</div>
                <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[o.status.toLowerCase() as OrderStatus] || "bg-muted text-muted-foreground"}`}>
                  {o.status}
                </span>
              </div>
            </button>

            {open === o._id && (
              <div className="mt-3 border-t border-border pt-3 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Items</div>
                  <ul className="space-y-1 text-xs">
                    {o.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                        <span className="font-semibold">₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-muted-foreground mt-2">
                    Subtotal: ₹{Number(o.subtotal).toLocaleString("en-IN")} · Shipping: ₹{Number(o.shipping).toLocaleString("en-IN")}
                    {Number(o.cod_charge) > 0 && <> · COD: ₹{Number(o.cod_charge).toLocaleString("en-IN")}</>}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Customer</div>
                  <div className="text-xs">{o.customer_email}</div>
                  {o.customer_phone && <div className="text-xs">{o.customer_phone}</div>}
                  <div className="font-semibold mt-3 mb-1">Shipping</div>
                  <pre className="text-xs whitespace-pre-wrap bg-muted rounded p-2">
                    {JSON.stringify(o.shipping_address, null, 2)}
                  </pre>
                  
                  <div className="font-semibold mt-3 mb-1">Payment</div>
                  {!o.isPaid ? (
                    <button
                      onClick={() => setPaymentPaid(o)}
                      className="text-xs px-3 py-1.5 rounded font-semibold bg-success text-success-foreground hover:brightness-110"
                    >
                      Mark Payment Done
                    </button>
                  ) : (
                    <div className="text-xs font-semibold text-success">✓ Payment Done</div>
                  )}

                  <div className="font-semibold mt-3 mb-1">Update status</div>
                  <div className="flex flex-wrap gap-1">
                    {(["placed", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(o, s)}
                        className={`text-xs px-2 py-1 rounded font-semibold ${o.status.toLowerCase() === s.toLowerCase() ? statusColors[s] : "bg-muted hover:bg-accent"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {(o.status === "shipped" || o.status === "delivered") && (
                    <>
                      <div className="font-semibold mt-3 mb-1">Customer notification</div>
                      <button
                        onClick={() => sendWhatsApp(o, o.status as "shipped" | "delivered")}
                        disabled={!o.customer_phone}
                        className="inline-flex items-center gap-1.5 bg-success text-success-foreground text-xs font-semibold px-3 py-2 rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <MessageCircle className="size-3.5" />
                        Send WhatsApp {o.status === "shipped" ? "shipping" : "delivery"} update
                      </button>
                      {!o.customer_phone && (
                        <div className="text-[10px] text-muted-foreground mt-1"> No phone number on file</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No orders yet</div>}
      </div>
    </div>
  );
}
