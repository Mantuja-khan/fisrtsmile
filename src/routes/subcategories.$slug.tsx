import { createFileRoute, Link } from "@tanstack/react-router";
import { useCategories } from "@/hooks/useCatalog";
import { resolveImage } from "@/data/products";

export const Route = createFileRoute("/subcategories/$slug")({
  head: () => ({
    meta: [{ title: "Sub Categories — First Smile" }],
  }),
  component: SubCategoriesPage,
});

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
        <h2 className="text-xl font-bold">Category not found</h2>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }

  const children = categories.filter((c) => c.parent_id === parent.id);

  // Fallback redirection could go here, but explicit view is safer
  if (children.length === 0) {
     // Just automatically push them towards products? Or show one link.
     // Let's just show direct products link
  }

  return (
    <div className="min-h-[60vh] bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        
        {/* Header breadcrumb style */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">{parent.name}</h1>
          <p className="text-muted-foreground text-sm md:text-base">Explore collections in {parent.name}</p>
        </div>

        {children.length === 0 ? (
           <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
             <span className="text-5xl mb-4 block">🎁</span>
             <h3 className="text-lg font-bold mb-4">Explore Products Directly</h3>
             <Link 
               to="/products" 
               search={{ category: parent.slug } as never}
               className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full shadow-card hover:brightness-110 transition"
             >
               View All {parent.name} Toys
             </Link>
           </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {children.map((cat) => (
              <Link
                key={cat.id}
                to="/products"
                search={{ category: cat.slug } as never}
                className="group bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden p-4 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col items-center text-center"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-slate-50">
                  {cat.image ? (
                    <img 
                      src={resolveImage(cat.image)} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">{cat.icon ?? "📦"}</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-primary transition-colors uppercase tracking-wide">{cat.name}</h3>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 group-hover:text-slate-500 underline decoration-dotted">VIEW COLLECTION</span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
