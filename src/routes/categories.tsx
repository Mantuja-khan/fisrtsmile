import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/useCatalog";
import { resolveImage } from "@/data/products";
import { Search, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Browse Toy Categories — Trivoxo Toys" },
      {
        name: "description",
        content: "Explore our premium selection of toy categories and find the perfect match.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");

  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parent_id);
  }, [categories]);

  // Compute children matching the search term or if their parent matches
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return parentCategories.map((p) => ({
        parent: p,
        children: categories.filter((c) => c.parent_id === p.id),
      }));
    }

    return parentCategories
      .map((p) => {
        const children = categories.filter((c) => c.parent_id === p.id);
        const matchesParent = p.name.toLowerCase().includes(term);
        const filteredChildren = children.filter((c) => c.name.toLowerCase().includes(term));

        if (matchesParent || filteredChildren.length > 0) {
          return {
            parent: p,
            children: matchesParent ? children : filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as { parent: any; children: any[] }[];
  }, [categories, parentCategories, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Clean Minimalist Header */}
      <section className="bg-slate-50 border-b border-slate-150 py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="font-display text-3xl md:text-4xl text-slate-900 uppercase tracking-wide">
            Toy Categories
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Browse our wide selection of toys, games, and learning kits sorted by categories and
            collections.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto mt-6 px-4">
            <div className="relative flex items-center bg-white rounded-xl border border-slate-255 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all p-1">
              <Search className="size-4 text-slate-400 ml-2.5 animate-pulse" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-transparent px-2.5 py-1.5 border-0 outline-none text-xs text-slate-800 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="container mx-auto px-4 max-w-7xl mt-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-10 border-4 border-indigo-100 border-t-slate-800 rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-400">Loading categories...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="max-w-lg mx-auto bg-white border border-slate-150 rounded-2xl p-10 text-center shadow-xs">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No categories match your search
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Try searching for other keywords like "Soft", "Remote", or "Blocks".
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              Show All Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 md:gap-6 px-2 lg:px-0 justify-items-center">
            {filteredData.map(({ parent, children }, idx) => {
              return (
                <Link
                  key={parent.id}
                  to="/products"
                  search={{ category: parent.slug } as never}
                  className="group flex flex-col items-center w-full transition-transform hover:-translate-y-1"
                >
                  <div className="w-full aspect-square flex items-center justify-center relative transition-all duration-300">
                    {parent.image ? (
                      <img
                        src={resolveImage(parent.image)}
                        alt={parent.name}
                        className="w-full h-full object-contain select-none"
                      />
                    ) : (
                      <span className="text-6xl sm:text-7xl transition-transform duration-300 group-hover:scale-110">
                        {parent.icon ?? "🎁"}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 max-w-7xl mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-slate-150 text-center">
          {[
            { icon: "🎁", title: "Premium Brands", desc: "100% genuine toys" },
            { icon: "⚡", title: "Fast Dispatch", desc: "Shipping across India" },
            { icon: "🛡️", title: "Secure Checkout", desc: "Safe payment methods" },
            { icon: "💬", title: "24/7 Support", desc: "Customer assistance" },
          ].map((item, idx) => (
            <div key={idx} className="p-2">
              <span className="text-lg block mb-1">{item.icon}</span>
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
