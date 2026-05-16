import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories } from "@/hooks/useCatalog";
import { resolveImage } from "@/data/products";

export const Route = createFileRoute("/subcategories/$slug")({
  head: () => ({
    meta: [{ title: "Sub Categories — First Smile" }],
  }),
  component: SubCategoriesPage,
});

const bgColors = [
  "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-950",
  "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-950",
  "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950",
  "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-950",
  "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950",
  "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-950",
];

function SubCategoriesPage() {
  const { slug } = Route.useParams();
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading categories...
      </div>
    );
  }

  const parent = categories.find((c) => c.slug === slug);

  if (!parent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl   ">Category not found</h2>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }

  const children = categories.filter((c) => c.parent_id === parent.id);

  return (
    <div className="min-h-[60vh] bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2 uppercase tracking-wide">{parent.name}</h1>
          <p className="text-muted-foreground text-sm md:text-base">Select a subcategory to view associated products</p>
        </div>

        {children.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <span className="text-5xl mb-4 block">🎁</span>
            <h3 className="text-lg    mb-4">Explore Products Directly</h3>
            <Link
              to="/products"
              search={{ category: parent.slug } as never}
              className="inline-block bg-primary text-white    px-8 py-3 rounded-full shadow-card hover:brightness-110 transition"
            >
              View All {parent.name} Toys
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {children.map((cat, index) => {
              const colorClass = bgColors[index % bgColors.length];
              return (
                <Link
                  key={cat.id}
                  to="/products"
                  search={{ category: cat.slug } as never}
                  className={`group border rounded-2xl shadow-sm hover:shadow-md overflow-hidden p-5 transition-all hover:-translate-y-1 flex flex-col justify-center items-center text-center min-h-[120px] ${colorClass}`}
                >
                  {/* Image block is coded for when you add images inside the category item later */}
                  {cat.image && (
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 flex items-center justify-center bg-white/80">
                      <img
                        src={resolveImage(cat.image)}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <h3 className="   text-sm md:text-base transition-colors uppercase tracking-wider leading-snug">{cat.name}</h3>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
