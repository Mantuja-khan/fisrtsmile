import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Package, ShoppingBag, Tag, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/orders"),
      ]);
      
      const products = productsRes.data ?? [];
      const categories = categoriesRes.data ?? [];
      const orders = ordersRes.data ?? [];
      const totalRevenue = orders.reduce((s: number, r: any) => {
        const isPaid = r.isPaid;
        const isDeliveredCOD = r.payment_method?.toLowerCase() === 'cod' && r.status?.toLowerCase() === 'delivered';
        if (isPaid || isDeliveredCOD) {
          return s + Number(r.total);
        }
        return s;
      }, 0);
      
      return {
        products: products.length,
        categories: categories.length,
        orders: orders.length,
        revenue: totalRevenue,
      };
    },
  });

  const cards = [
    { label: "Products", value: stats?.products ?? "—", icon: Package, color: "bg-primary" },
    { label: "Categories", value: stats?.categories ?? "—", icon: Tag, color: "bg-secondary" },
    { label: "Orders", value: stats?.orders ?? "—", icon: ShoppingBag, color: "bg-warning" },
    { label: "Revenue", value: `₹${(stats?.revenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-discount" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface rounded-xl shadow-card p-4">
            <div className={`size-10 rounded-lg ${c.color} text-white grid place-items-center mb-2`}>
              <c.icon className="size-5" />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-xl shadow-card p-5">
        <h2 className="font-bold mb-2">Welcome to the Admin Panel</h2>
        <p className="text-sm text-muted-foreground">
          Use the tabs on the left to manage products, categories, and orders. You can add offers
          on each product (% off) and view all customer orders in real time.
        </p>
      </div>
    </div>
  );
}
