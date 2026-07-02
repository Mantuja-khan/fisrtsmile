import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Package,
  RefreshCw,
  ChevronRight,
  FileText,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import api from "@/services/api";
import { toast } from "sonner";
import { redirectToPayU } from "@/utils/payu";
import ShiprocketLoginButton from "@/components/ShiprocketLoginButton";

export const Route = createFileRoute("/my-orders")({
  head: () => ({ meta: [{ title: "My Orders — Trivoxo Toys" }] }),
  component: MyOrdersPage,
});

type MyOrder = {
  _id: string;
  order_number: string;
  status:
    | "placed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "return requested"
    | "returned";
  total: number;
  createdAt: string;
  payment_method: string;
  isPaid?: boolean;
  refund_status?: string;
  shiprocket_status?: string;    // live status from Shiprocket API
  shiprocket_awb?: string;       // AWB tracking number
  items: { name: string; quantity: number; price: number; image?: string; product: string }[];
};


type RefundReport = {
  order_id?: string;
  refund_amount?: number;
  refund_status?: string;
  initiated_at?: string;
  completed_at?: string;
  [key: string]: any;
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; colors: string; dot: string }> = {
  placed: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: "Placed",
    colors: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    label: "Processing",
    colors: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  shipped: {
    icon: <Truck className="w-3.5 h-3.5" />,
    label: "Shipped",
    colors: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  delivered: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: "Delivered",
    colors: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Cancelled",
    colors: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  "return requested": {
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    label: "Return Requested",
    colors: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  returned: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: "Returned",
    colors: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status, refundStatus }: { status: string; refundStatus?: string }) {
  const cfg = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG["placed"];
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${cfg.colors}`}>
        {cfg.icon}
        {cfg.label}
      </span>
      {refundStatus && (
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">
          Refund: {refundStatus}
        </span>
      )}
    </div>
  );
}

function OrderProgressBar({ status }: { status: string }) {
  const steps = ["placed", "processing", "shipped", "delivered"];
  const cancelledStates = ["cancelled", "return requested", "returned"];
  const isCancelled = cancelledStates.includes(status.toLowerCase());
  const currentIdx = steps.indexOf(status.toLowerCase());

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1.5 bg-rose-100 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-rose-400 rounded-full" />
        </div>
        <span className="text-[10px] font-bold text-rose-500 uppercase">
          {STATUS_CONFIG[status.toLowerCase()]?.label || status}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => {
        const isDone = i <= currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isDone ? "bg-slate-800" : "bg-slate-100"}`} />
            {i < steps.length - 1 && (
              <div className={`size-2 rounded-full shrink-0 ring-2 transition-all ${isActive ? "ring-slate-800 bg-slate-800 scale-125" : isDone ? "ring-slate-800 bg-slate-800" : "ring-slate-200 bg-white"}`} />
            )}
          </div>
        );
      })}
      <div className={`size-2 rounded-full shrink-0 ring-2 transition-all ${currentIdx === steps.length - 1 ? "ring-emerald-500 bg-emerald-500 scale-125" : "ring-slate-200 bg-white"}`} />
    </div>
  );
}

function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "refunds">("orders");
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Refund report state
  const [refundReports, setRefundReports] = useState<RefundReport[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);

  // Map Shiprocket live statuses to our DB status keys
  const mapShiprocketStatus = (srStatus: string): string => {
    const s = srStatus.toLowerCase();
    if (s.includes("deliver")) return "delivered";
    if (s.includes("ship") || s.includes("transit") || s.includes("dispatch")) return "shipped";
    if (s.includes("process") || s.includes("confirm") || s.includes("pack")) return "processing";
    if (s.includes("cancel")) return "cancelled";
    if (s.includes("return") && s.includes("request")) return "return requested";
    if (s.includes("return")) return "returned";
    return "placed";
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch live Shiprocket statuses (using user phone if available)
      let srOrders: any[] = [];
      if (user.phone) {
        try {
          const { data: srData } = await api.post("/shiprocket/order-list", {
            phone: user.phone,
            page: 1,
            per_page: 50,
          });
          srOrders = Array.isArray(srData)
            ? srData
            : srData?.data?.orders || srData?.orders || srData?.data || [];
        } catch {
          // Shiprocket fetch failed
        }
      }

      // Map Shiprocket orders directly to the MyOrder schema
      const mapped = srOrders.map((sr: any) => {
        const ref =
          sr.channel_order_id ||
          sr.reference_number ||
          sr.order_id?.toString();

        const mappedItems = (sr.products || sr.items || sr.line_items || []).map((p: any) => ({
          name: p.name || p.title || "Toy Product",
          quantity: Number(p.quantity || p.qty || 1),
          price: Number(p.price || 0),
          image: p.image || p.image_url || p.image_src || "https://placehold.co/80x80?text=Toy",
          product: p.product_id || p.sku || "",
        }));

        return {
          _id: sr.order_id?.toString() || sr.channel_order_id || ref,
          order_number: ref,
          status: mapShiprocketStatus(sr.status || sr.current_status || "placed") as MyOrder["status"],
          shiprocket_status: sr.status || sr.current_status || "Placed",
          shiprocket_awb: sr.shipments?.[0]?.awb || sr.awb_code || "",
          total: Number(sr.total || sr.total_price || sr.order_total || mappedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)),
          createdAt: sr.created_at || sr.date || new Date().toISOString(),
          payment_method: sr.payment_method || sr.payment_type || "COD",
          isPaid: sr.is_paid || (sr.payment_status && sr.payment_status.toLowerCase() === "paid") || false,
          items: mappedItems,
        };
      });

      setOrders(mapped);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user]);


  const loadRefundReport = useCallback(async () => {
    if (!user) return;
    setRefundLoading(true);
    try {
      const { data } = await api.post("/shiprocket/refund-report", {});
      const reports = Array.isArray(data) ? data : data?.data || data?.reports || [];
      setRefundReports(reports);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load refund reports");
    } finally {
      setRefundLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (activeTab === "refunds") loadRefundReport();
  }, [activeTab, loadRefundReport]);

  const payOnline = async (o: MyOrder) => {
    setPayingId(o._id);
    try {
      const { data } = await api.post(`/orders/${o._id}/payu`);
      redirectToPayU(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPayingId(null);
    }
  };

  const cancel = async (id: string) => {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled successfully.");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const requestReturn = async (id: string) => {
    if (!confirm("Request a return for this order? Our support will contact you.")) return;
    setCancellingId(id);
    try {
      await api.put(`/orders/${id}/return`);
      toast.success("Return request submitted!");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit return");
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#BFDDF0]/30 mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-bold text-lg text-slate-800 mb-2">Sign in to view orders</h2>
          <p className="text-xs text-slate-400 mb-6">Please log in to track your orders, refunds, and more.</p>
          <ShiprocketLoginButton
            buttonText="Login with Phone Number"
            className="w-full py-3.5 text-xs font-black tracking-widest uppercase rounded-full shadow-md bg-[#802a8f] hover:bg-[#802a8f]/90 text-white transition-all transform hover:scale-[1.02]"
            onSuccess={load}
          />
        </div>
      </div>
    );
  }

  // Filter + search
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search.trim() ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || o.status.toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts: Record<string, number> = { all: orders.length };
  orders.forEach((o) => {
    const s = o.status.toLowerCase();
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "placed", label: "Placed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
    { key: "return requested", label: "Returns" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/" })}
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Track, manage, and view refund status of all your orders
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={load}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 px-4 py-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xs w-fit">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "orders" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            <Package className="w-4 h-4" />
            Orders
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "refunds" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            <FileText className="w-4 h-4" />
            Refund Reports
          </button>
        </div>

        {/* ======= ORDERS TAB ======= */}
        {activeTab === "orders" && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Orders", value: orders.length, icon: <Package className="w-4 h-4" />, color: "text-slate-700 bg-slate-50" },
                { label: "Delivered", value: statusCounts["delivered"] || 0, icon: <CheckCircle className="w-4 h-4" />, color: "text-emerald-700 bg-emerald-50" },
                { label: "In Transit", value: (statusCounts["shipped"] || 0) + (statusCounts["processing"] || 0), icon: <Truck className="w-4 h-4" />, color: "text-violet-700 bg-violet-50" },
                { label: "Returns", value: (statusCounts["return requested"] || 0) + (statusCounts["returned"] || 0), icon: <RotateCcw className="w-4 h-4" />, color: "text-orange-700 bg-orange-50" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order number or product name..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#BFDDF0] focus:ring-2 focus:ring-[#BFDDF0]/30 transition text-slate-700 font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 outline-none font-semibold text-slate-700 focus:border-[#BFDDF0] transition cursor-pointer"
                >
                  {filterTabs.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label} {statusCounts[t.key] ? `(${statusCounts[t.key]})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">Loading your orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-4 border border-slate-100">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">
                  {orders.length === 0 ? "No orders placed yet" : "No matching orders"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  {orders.length === 0 ? "Explore our collections to place your first order." : "Try adjusting your search or filter."}
                </p>
                {orders.length === 0 && (
                  <Link
                    to="/products"
                    className="inline-block bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm hover:bg-slate-800 transition"
                  >
                    Browse Products
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => {
                  const lstatus = o.status.toLowerCase();
                  const isCancelled = lstatus === "cancelled";
                  const isDelivered = lstatus === "delivered";
                  const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  const canReturn = isDelivered && diffDays <= 4;

                  return (
                    <div key={o._id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden hover:shadow-md transition-shadow duration-200">
                      {/* Order Header */}
                      <div className="px-5 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Order #{o.order_number}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            {" · "}
                            {o.payment_method?.toUpperCase() || "COD"}
                            {" · "}
                            {o.isPaid ? (
                              <span className="text-emerald-600 font-bold">PAID</span>
                            ) : (
                              <span className="text-amber-600 font-bold">UNPAID</span>
                            )}
                          </span>
                          {/* Live Shiprocket status label */}
                          {o.shiprocket_status && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full mt-0.5 w-fit uppercase tracking-wide">
                              <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                              Shiprocket: {o.shiprocket_status}
                            </span>
                          )}
                        </div>


                        <div className="flex items-center gap-2 flex-wrap">
                          {!o.isPaid && lstatus !== "cancelled" && lstatus !== "returned" && (
                            <button
                              onClick={() => payOnline(o)}
                              disabled={payingId === o._id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                              {payingId === o._id ? "Connecting..." : "Pay Online"}
                            </button>
                          )}
                          {canReturn && (
                            <button
                              onClick={() => requestReturn(o._id)}
                              disabled={cancellingId === o._id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50 transition"
                            >
                              Request Return
                            </button>
                          )}
                          {!isDelivered && !isCancelled && lstatus !== "return requested" && lstatus !== "returned" && (
                            <button
                              onClick={() => cancel(o._id)}
                              disabled={cancellingId === o._id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                            >
                              {cancellingId === o._id ? "Wait..." : "Cancel"}
                            </button>
                          )}
                          <StatusBadge status={o.status} refundStatus={o.refund_status} />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="px-5 pt-3 pb-1">
                        <OrderProgressBar status={o.status} />
                      </div>

                      {/* Items */}
                      <div className="px-5 pb-4">
                        {o.items?.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 py-3 cursor-pointer hover:bg-slate-50 rounded-xl px-1 -mx-1 transition"
                            onClick={() => navigate({ to: "/track", search: { orderId: o.order_number } as any })}
                          >
                            <img
                              src={it.image || "https://placehold.co/80x80?text=Toy"}
                              alt={it.name}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-slate-800 truncate">{it.name}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Qty: {it.quantity} × ₹{Number(it.price).toLocaleString("en-IN")}
                              </p>
                              {o.shiprocket_status ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full mt-1.5 w-fit uppercase tracking-wide">
                                  <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                                  Shiprocket: {o.shiprocket_status}
                                </span>
                              ) : o.status ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full mt-1.5 w-fit uppercase tracking-wide">
                                  Status: {o.status}
                                </span>
                              ) : null}
                            </div>
                            <div className="shrink-0 text-right flex items-center gap-1">
                              <span className="font-black text-sm text-slate-900">
                                ₹{(it.quantity * it.price).toLocaleString("en-IN")}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Total */}
                      <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">{o.items?.length || 0} item(s)</span>
                        <span className="text-sm font-black text-slate-900">
                          Total: ₹{Number(o.total || o.items?.reduce((s, i) => s + i.quantity * i.price, 0) || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ======= REFUNDS TAB ======= */}
        {activeTab === "refunds" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Refund Reports</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Status of all your refund requests
                </p>
              </div>
              <button
                onClick={loadRefundReport}
                disabled={refundLoading}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refundLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {refundLoading ? (
              <div className="p-16 text-center">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-medium">Fetching refund reports...</p>
              </div>
            ) : refundReports.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-4 border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">No refund reports found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Refunds will appear here once initiated and processed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {refundReports.map((r, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-col gap-1">
                        {r.order_id && (
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            Order: {r.order_id}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
                          {r.initiated_at && (
                            <span>Initiated: {new Date(r.initiated_at).toLocaleDateString("en-IN")}</span>
                          )}
                          {r.completed_at && (
                            <span>Completed: {new Date(r.completed_at).toLocaleDateString("en-IN")}</span>
                          )}
                        </div>
                        {/* Show all remaining fields as key:value */}
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                          {Object.entries(r)
                            .filter(([k]) => !["order_id", "initiated_at", "completed_at", "refund_amount", "refund_status"].includes(k))
                            .map(([k, v]) => (
                              <span key={k} className="text-[10px] text-slate-400">
                                <span className="font-bold text-slate-500">{k.replace(/_/g, " ")}:</span>{" "}
                                {String(v)}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {r.refund_amount != null && (
                          <span className="font-black text-lg text-slate-900">
                            ₹{Number(r.refund_amount).toLocaleString("en-IN")}
                          </span>
                        )}
                        {r.refund_status && (
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${
                            r.refund_status.toLowerCase().includes("complet") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            r.refund_status.toLowerCase().includes("fail") ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {r.refund_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
