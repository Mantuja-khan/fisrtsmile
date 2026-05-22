import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { MessageCircle, Search, Filter } from "lucide-react";

type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return requested"
  | "returned"
  | "rejected";

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
  refund_status?: string;
  awb_code?: string;
  shipment_id?: string;
  tracking_url?: string;
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
  "return requested": "bg-purple-600 text-white",
  returned: "bg-slate-800 text-white",
  rejected: "bg-gray-400 text-white",
};

function AdminOrders() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data as Order[];
    },
  });
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();
    if (!matchesStatus) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(term) ||
      o.customer_name.toLowerCase().includes(term) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(term)) ||
      (o.customer_phone && o.customer_phone.toLowerCase().includes(term))
    );
  });

  const getCount = (statusId: string) => {
    if (statusId === "all") return orders.length;
    return orders.filter((o) => o.status.toLowerCase() === statusId).length;
  };
  const sendWhatsApp = (o: Order, status: "shipped" | "delivered") => {
    if (!o.customer_phone) {
      toast.error("No phone number on this order");
      return;
    }
    const phone = o.customer_phone.replace(/[^\d]/g, "");
    const intl = phone.length === 10 ? `91${phone}` : phone;
    const msg =
      status === "shipped"
        ? `Hi ${o.customer_name}! 📦 Great news — your Toy Haat order ${o.order_number} has been *shipped* and is on its way. Track it anytime at https://toyhaat.com/track . Thank you for shopping with us!`
        : `Hi ${o.customer_name}! 🎉 Your Toy Haat order ${o.order_number} has been *delivered successfully*. We hope your little one loves it! Please share a review — it means a lot to us. ❤️`;
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
        const msg =
          status === "shipped"
            ? `Hi ${o.customer_name}! 📦 Great news — your Toy Haat order ${o.order_number} has been *shipped* and is on its way. Track it anytime at https://toyhaat.com/track . Thank you for shopping with us!`
            : `Hi ${o.customer_name}! 🎉 Your Toy Haat order ${o.order_number} has been *delivered successfully*. We hope your little one loves it! Please share a review — it means a lot to us. ❤️`;
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

  const saveTrackingInfo = async (oId: string, payload: any) => {
    try {
      await api.put(`/orders/${oId}/status`, payload);
      toast.success(`Tracking information updated`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save tracking info");
    }
  };

  const processRefund = async (o: Order) => {
    if (
      !confirm(
        "Mark this order as Refunded? This only updates status; make sure to issue money via Gateway panel if needed.",
      )
    )
      return;
    try {
      await api.put(`/orders/${o._id}/status`, {
        refund_status: "Refunded",
        status: o.status === "cancelled" ? "cancelled" : "Returned",
      });
      toast.success("Order marked as Refunded!");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error: any) {
      toast.error("Failed to update refund status");
    }
  };

  const resolveReturn = async (o: Order, action: "approve" | "reject") => {
    const status = action === "approve" ? "Returned" : "Rejected";
    if (!confirm(`Are you sure you want to ${action} this return request?`)) return;
    try {
      await api.put(`/orders/${o._id}/status`, { status });
      toast.success(`Return request ${action}d!`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error: any) {
      toast.error("Failed to resolve return request");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl border border-border p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            Orders{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({filteredOrders.length} listed)
            </span>
          </h2>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search order ID, customer name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-input rounded-lg w-full bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          {[
            { id: "all", label: "All" },
            { id: "placed", label: "Placed" },
            { id: "processing", label: "Processing" },
            { id: "shipped", label: "Shipped" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
            { id: "return requested", label: "Returns" },
          ].map((f) => {
            const isActive = statusFilter === f.id;
            const count = getCount(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-[11px] tracking-wide transition flex items-center gap-2 border select-none ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-white border-border text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{f.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-card divide-y divide-border border border-border overflow-hidden">
        {filteredOrders.map((o) => (
          <div key={o._id} className="p-3">
            <button
              onClick={() => setOpen(open === o._id ? null : o._id)}
              className="w-full text-left flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{o.order_number}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {o.customer_name} · {new Date(o.createdAt).toLocaleString("en-IN")} ·{" "}
                  <span className={o.isPaid ? "text-success font-bold" : "text-warning font-bold"}>
                    {o.isPaid ? "PAYMENT DONE" : "PENDING"}
                  </span>{" "}
                  ({o.payment_method.toUpperCase()})
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">₹{Number(o.total).toLocaleString("en-IN")}</div>
                <div className="flex flex-col items-end gap-1 mt-1">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[o.status.toLowerCase() as OrderStatus] || "bg-muted text-muted-foreground"}`}
                  >
                    {o.status}
                  </span>
                  {o.refund_status && (
                    <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-sm animate-pulse">
                      {o.refund_status}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {open === o._id && (
              <div className="mt-3 border-t border-border pt-3 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Items</div>
                  <ul className="space-y-1 text-xs">
                    {o.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="truncate pr-2">
                          {it.name} × {it.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-muted-foreground mt-2">
                    Subtotal: ₹{Number(o.subtotal).toLocaleString("en-IN")} · Shipping: ₹
                    {Number(o.shipping).toLocaleString("en-IN")}
                    {Number(o.cod_charge) > 0 && (
                      <> · COD: ₹{Number(o.cod_charge).toLocaleString("en-IN")}</>
                    )}
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

                  <div className="font-semibold mt-3 mb-1">Payment & Refund</div>
                  <div className="flex flex-wrap items-center gap-2">
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

                    {(o.status.toLowerCase() === "cancelled" ||
                      o.status.toLowerCase() === "returned" ||
                      o.status.toLowerCase() === "return requested") &&
                      !o.refund_status && (
                        <button
                          onClick={() => processRefund(o)}
                          className="text-xs px-3 py-1.5 rounded font-semibold bg-emerald-600 text-white hover:brightness-110 shadow-sm"
                        >
                          Trigger Refund
                        </button>
                      )}
                    {o.refund_status && (
                      <div className="text-xs font-bold text-emerald-600 border border-emerald-200 px-2 py-1 rounded bg-emerald-50 flex items-center gap-1">
                        💰 {o.refund_status}
                      </div>
                    )}
                  </div>

                  <div className="font-semibold mt-4 mb-1 text-primary flex items-center justify-between">
                    <span className="uppercase tracking-wider text-xs font-bold">
                      Shipment Tracking
                    </span>
                    {(o.awb_code || o.tracking_url) && (
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 rounded">
                        Configured
                      </span>
                    )}
                  </div>
                  <form
                    className="bg-muted/40 p-3 rounded border border-border flex flex-col gap-2 shadow-sm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      saveTrackingInfo(o._id, {
                        awb_code: fd.get("awb_code"),
                        shipment_id: fd.get("shipment_id"),
                        tracking_url: fd.get("tracking_url"),
                      });
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-muted-foreground font-bold uppercase">
                          AWB / Courier Code
                        </label>
                        <input
                          name="awb_code"
                          placeholder="e.g. 12345678"
                          defaultValue={o.awb_code}
                          className="text-xs p-1.5 border rounded w-full outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-muted-foreground font-bold uppercase">
                          Shipment ID
                        </label>
                        <input
                          name="shipment_id"
                          placeholder="Vendor system ID"
                          defaultValue={o.shipment_id}
                          className="text-xs p-1.5 border rounded w-full outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground font-bold uppercase">
                        Direct Tracking URL
                      </label>
                      <input
                        name="tracking_url"
                        placeholder="https://track.shiprocket.com/..."
                        defaultValue={o.tracking_url}
                        className="text-xs p-1.5 border rounded w-full outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      className="text-xs font-bold bg-primary text-white py-1.5 rounded hover:brightness-110 transition shadow-sm"
                    >
                      Save Tracking Data
                    </button>
                  </form>

                  {o.status.toLowerCase() === "return requested" && (
                    <div className="mt-4 bg-purple-50 border border-purple-200 p-3 rounded shadow-sm animate-in zoom-in-95">
                      <div className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide">
                        🔄 Resolve Return Request
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => resolveReturn(o, "approve")}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded transition"
                        >
                          Approve Return
                        </button>
                        <button
                          onClick={() => resolveReturn(o, "reject")}
                          className="flex-1 border border-purple-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded transition"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="font-semibold mt-3 mb-1">Quick Status Toggle</div>
                  <div className="flex flex-wrap gap-1">
                    {(
                      ["placed", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(o, s)}
                        className={`text-[11px] px-2 py-1 rounded font-bold uppercase tracking-tight border transition ${o.status.toLowerCase() === s.toLowerCase() ? statusColors[s] : "bg-white border-border text-slate-600 hover:bg-slate-50"}`}
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
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {" "}
                          No phone number on file
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground bg-slate-50/50">
            {orders.length === 0
              ? "No orders placed in store yet."
              : "No orders match your search or filter."}
          </div>
        )}
      </div>
    </div>
  );
}
