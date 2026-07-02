import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, X, Ticket } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

type Coupon = {
  _id: string;
  code: string;
  discount: number;
  heading: string;
  content: string;
  active: boolean;
};

function AdminCoupons() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await api.get("/coupons/admin");
      return data as Coupon[];
    },
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const code = String(fd.get("code") || "").trim().toUpperCase();
    const discount = Number(fd.get("discount") || 5);
    const heading = String(fd.get("heading") || "").trim();
    const content = String(fd.get("content") || "").trim();

    if (!code || !discount || !heading || !content) {
      return toast.error("All fields are required");
    }

    try {
      const payload = { code, discount, heading, content, active: true };
      await api.post("/coupons", payload);
      toast.success("Coupon added successfully!");
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted successfully!");
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Ticket className="size-5 text-primary" />
          Coupons Management ({coupons.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold hover:brightness-105"
        >
          <Plus className="size-4" /> New Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-surface rounded-xl shadow-card p-5 space-y-4 relative max-w-xl border border-border/50">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
          <h3 className="font-bold text-base">New Coupon</h3>
          
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Coupon Code *
              </label>
              <input
                name="code"
                required
                placeholder="e.g. SAVE20"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background uppercase placeholder:text-muted-foreground/50"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Discount Percentage *
              </label>
              <input
                name="discount"
                type="number"
                min={1}
                max={100}
                required
                placeholder="e.g. 20"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Heading / Title *
              </label>
              <input
                name="heading"
                required
                placeholder="e.g. Get 20% Instant Discount"
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Content / Description *
              </label>
              <textarea
                name="content"
                required
                rows={3}
                placeholder="e.g. Apply code to get 20% discount on order above ₹999.00."
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background resize-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="bg-primary text-primary-foreground px-5 py-2 rounded font-bold text-sm shadow-sm hover:brightness-105">
              Save Coupon
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-muted px-4 py-2 rounded font-semibold text-sm hover:bg-muted/80 text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-muted-foreground font-semibold">
          Loading coupons...
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-card divide-y divide-border border border-border/50 overflow-hidden">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-base px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {coupon.discount}% Off
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base mt-2">
                  {coupon.heading}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {coupon.content}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => remove(coupon._id)}
                  className="p-2 hover:bg-destructive/10 rounded-full transition"
                  title="Delete Coupon"
                >
                  <Trash2 className="size-4.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}

          {coupons.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No coupons added yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
