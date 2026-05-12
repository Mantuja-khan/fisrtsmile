import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";
import { Shield, LayoutGrid, Package, ShoppingBag, Tag, Users, Image as ImageIcon, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — First Smile" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;
  }

  // Allow login page to render without admin check
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="size-12 mx-auto text-primary mb-3" />
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Please log in to the admin panel.
        </p>
        <Link to="/admin/login" className="inline-block mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold">
          Go to Admin Login
        </Link>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="size-12 mx-auto text-destructive mb-3" />
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your account ({user.email}) does not have admin privileges.
        </p>
      </div>
    );
  }

  const tabs: { to: "/admin" | "/admin/banners" | "/admin/promo" | "/admin/products" | "/admin/categories" | "/admin/orders" | "/admin/users"; label: string; icon: any; exact?: boolean }[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
    { to: "/admin/banners", label: "Hero Banners", icon: ImageIcon },
    { to: "/admin/promo", label: "Promo Banners", icon: Sparkles },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="bg-primary text-primary-foreground rounded-xl p-4 md:p-5 mb-4 flex items-center gap-3">
        <Shield className="size-6" />
        <div>
          <h1 className="text-lg md:text-xl font-bold">Admin Panel</h1>
          <p className="text-xs opacity-80">Signed in as {user.email}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        <aside className="bg-surface rounded-xl shadow-card p-2 h-max md:sticky md:top-4">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
            {tabs.map((t) => {
              const active = t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shrink-0 whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <t.icon className="size-4" /> {t.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
