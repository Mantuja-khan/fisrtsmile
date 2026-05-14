import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";
import { 
  Shield, 
  LayoutGrid, 
  Package, 
  ShoppingBag, 
  Tag, 
  Users, 
  Image as ImageIcon, 
  Sparkles, 
  Lock,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Smile,
  Cloud,
  ArrowLeft
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — First Smile" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground font-medium">Loading...</div>;
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

  // Strictly use the user's existing application buttons/features to preserve clean live mapping
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row relative font-sans">
      
      {/* 
        Masterclass Left Sidebar Structure matching reference screenshot:
        Composed of the extreme-left thick Solid Purple Column and the next adjacent White Panel.
      */}
      <div className="hidden md:flex flex-col w-16 bg-[#7C3AED] shrink-0 border-r border-[#7C3AED] items-center pt-6 z-20">
        {/* Purple column top icon replica */}
        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner">
          <Cloud className="size-5 fill-current" />
        </div>
      </div>
      
      {/* Main Sidebar Links Menu Panel */}
      <aside className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col shrink-0 relative z-10">
        
        {/* Back Button Area replacing MyCloud PRO */}
        <div className="h-16 px-6 flex items-center border-b border-slate-50">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#7C3AED] transition-colors"
          >
            <ArrowLeft className="size-4 stroke-[2.5]" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Tab Links Menu area */}
        <nav className="flex-1 p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible no-scrollbar">
          {tabs.map((t) => {
            const active = t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to);
            return (
              <div key={t.to} className="relative group shrink-0 md:shrink">
                
                {/* 
                  Masterpiece overlapping active icon box matching reference screenshot precisely:
                  Pops out across the border bounding the left solid purple column and the white sidebar panel.
                */}
                {active && (
                  <div className="hidden md:flex absolute -left-11 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white shadow-md border border-slate-100 items-center justify-center z-30 text-[#7C3AED]">
                    <t.icon className="size-4 stroke-[2.5]" />
                  </div>
                )}

                <Link
                  to={t.to}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-xs tracking-wide transition-all block ${
                    active 
                      ? "bg-[#F3EEFF] text-[#7C3AED] ml-1" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <t.icon className={`size-4 stroke-[2.5] shrink-0 ${active ? "text-[#7C3AED]" : "text-slate-400"}`} />
                  <span className="truncate">{t.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Logout Button Area matching screenshot placement */}
        <div className="p-4 border-t border-slate-50 mt-auto">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-xs text-[#1D4ED8] hover:bg-blue-50 transition-all tracking-wide cursor-pointer"
          >
            <LogOut className="size-4 stroke-[2.5] shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Right Contents Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Premium Top Bar matching screenshot elements */}
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between gap-4 sticky top-0 z-10">
          {/* Custom Search Box */}
          <div className="flex items-center gap-3 w-full max-w-md bg-slate-50/50 px-3.5 py-2 rounded-xl border border-slate-100">
            <Search className="size-4 text-slate-400 shrink-0" />
            <input 
              placeholder="Search for orders, products, customers..." 
              className="w-full text-xs outline-none bg-transparent placeholder:text-slate-400 font-medium text-slate-700" 
            />
          </div>

          <div className="flex items-center gap-5 shrink-0">
            {/* Bell notification badge matching reference UI */}
            <div className="relative cursor-pointer hover:opacity-80 p-1">
              <Bell className="size-4 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1D4ED8] text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-xs">
                3
              </span>
            </div>

            {/* Admin Avatar Profile block */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 cursor-pointer">
                <span className="text-xs font-bold text-slate-800 tracking-tight">Admin User</span>
                <ChevronDown className="size-3 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Outlet Wrapper */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
