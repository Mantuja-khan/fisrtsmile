import { Outlet, Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies")({
  component: PoliciesLayout,
});

function PoliciesLayout() {
  const links = [
    { to: "/policies/returns" as const, label: "Returns & Exchange" },
    { to: "/policies/shipping" as const, label: "Shipping & Delivery" },
    { to: "/policies/privacy" as const, label: "Privacy Policy" },
    { to: "/policies/terms" as const, label: "Terms & Conditions" },
    { to: "/policies/legal" as const, label: "Legal Notice" },
  ];
  return (
    <div className="container mx-auto px-4 py-6 grid md:grid-cols-[240px_1fr] gap-4">
      <aside className="bg-surface rounded-xl shadow-card p-4 h-max md:sticky md:top-24">
        <h2 className="font-bold mb-3">Policies</h2>
        <nav className="space-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block px-2 py-1.5 rounded hover:bg-muted" activeProps={{ className: "block px-2 py-1.5 rounded bg-accent text-primary font-semibold" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="bg-surface rounded-xl shadow-card p-5 md:p-7 prose prose-sm max-w-none">
        <Outlet />
      </article>
    </div>
  );
}
