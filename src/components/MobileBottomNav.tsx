import { Link } from "@tanstack/react-router";
import { Home, Grid3x3, ShoppingCart, User, Package } from "lucide-react";
import { useShop } from "@/store/shop";

export function MobileBottomNav() {
  const { cartCount } = useShop();
  const item =
    "flex flex-col items-center justify-center gap-0.5 text-[11px] flex-1 py-2 text-muted-foreground";
  const active = { className: `${item} text-primary` };
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border shadow-pop">
      <div className="flex items-stretch">
        <Link to="/" className={item} activeOptions={{ exact: true }} activeProps={active}>
          <Home className="size-5" /> Home
        </Link>
        <Link to="/products" className={item} activeProps={active}>
          <Grid3x3 className="size-5" /> Products
        </Link>
        <Link to="/cart" className={`${item} relative`} activeProps={active}>
          <ShoppingCart className="size-5" /> Cart
          {cartCount > 0 && (
            <span className="absolute top-1 right-4 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full px-1">
              {cartCount}
            </span>
          )}
        </Link>
        <Link
          to="/account"
          search={{ view: "orders" } as any}
          className={item}
          activeProps={active}
        >
          <Package className="size-5" /> My Orders
        </Link>
        <Link
          to="/account"
          search={{ view: "profile" } as any}
          className={item}
          activeProps={active}
        >
          <User className="size-5" /> Account
        </Link>
      </div>
    </nav>
  );
}
