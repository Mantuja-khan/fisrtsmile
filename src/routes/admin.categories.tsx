import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, ImageIcon, Loader2 } from "lucide-react";
import { compressImage } from "@/utils/imageCompressor";
import { resolveImage } from "@/data/products";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Category = {
  _id: string;
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
  parent?: any;
  sort_order: number;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const matrixData = [
  { name: "BLOCKS", subs: ["BLOCKS", "BULLET BLOCKS", "CONSTRUCTION BLOCK", "INTELOCKING BLOCKS", "LIGHT BLOCKS", "MAGNETIC", "MEGA BLOCK"] },
  { name: "DOLL & DOLL SETS", subs: ["DOLL", "DOLL HOUSE", "DOLL SET", "DOLLS & PLAYSETS", "ROLEPLAY"] },
  { name: "RIDE ON & CYCLES", subs: ["BATTERY OPERATED", "BATTERY TOY ASSESSORIES", "CYCLE", "CYCLE ASSESSORIES", "MANUAL RIDE ON", "RIDE ON", "SCOOTER", "SWING CAR", "TRICYCLE"] },
  { name: "BOARD GAME & PUZZLE", subs: ["ART & CRAFT", "BOARD GAME", "CARD GAME", "CHESS", "CONSTRUCTION BLOCK", "CUBE", "FISHING GAME", "LUDO & SNAKES", "MIND GAME", "PLAYING CARDS", "PUZZLE", "SCIENCE GAME", "TABLE TOP GAME"] },
  { name: "SCHOOL", subs: ["COLORING & STATIONERY", "DIARY", "GEOMETRY PENCIL BOX", "LUNCH BOX", "PENCIL BOX", "POUCH", "SCHOOL BAG", "SIPPER", "WATER BOTTLE"] },
  { name: "PARTY DECORATION", subs: ["BALLOON", "CANDLE", "CURTAINS", "COMBO SETS"] },
  { name: "ELECTRONIC TOYS", subs: ["CAMERA", "VIDEO GAME"] },
  { name: "KIDS FURNITURE", subs: ["CHAIR", "ROCKING CHAIR", "STOOL", "STUDY TABLE", "TABLE AND CHAIR"] },
  { name: "SOFT TOYS", subs: ["BAG", "BOY", "CAT", "CHRACTER", "DOG", "PENGUINE", "SOFA", "Soft Toys", "STUFFED ANIMAL", "PILLOW"] },
  { name: "FIGURE & PLAYSET", subs: ["ANIMAL FIGURE", "AVENGER", "BEAUTY", "DOCTOR", "KITCHEN", "MIX", "Peppa Pig", "SHOPPING", "TEA SET", "TENT HOUSE", "TOOL KIT", "WENDING MACHINE"] },
  { name: "KIDS ASSESSORIES", subs: ["HAIR BAND", "MAKE UP", "OTHERS", "SLING BAG", "TOOTH BRUSH", "WATCH", "UMBRELLA"] },
  { name: "GIFT", subs: ["CLOCK", "Fan", "GIFT", "HEADPHONE", "KEYCHAIN", "LAMP", "LAZER LIGHT", "PENS"] },
  { name: "MUSICAL", subs: ["GUITAR", "MIKE", "MOUTH ORGAN", "PIANO", "SPEAKER"] },
  { name: "VEHICLES & TRACKS", subs: ["DIE CAST TOY", "DIY", "FRICTION TOY", "RC TOYS", "TRACK SET", "DIE CAST TOY & FRICTION", "TRAIN AND TRACK SET"] },
  { name: "WEAPONS & GUNS", subs: ["BOW & ARROW", "BUBBLE GUN", "BULLET", "BULLET GUN", "MUSICAL GUN", "SWORD", "GUNS AND BULLET", "MUSICAL GUNS", "WEAPONS"] },
  { name: "NOVELTY TOYS", subs: ["BINOCULAR", "CUP", "MINI TOYS", "PIGGY BANK", "STICKER", "YOYO", "HOOPLA", "HOP BALL"] },
  { name: "FESTIVAL", subs: ["HOLI", "RAKHSA BANDHAN", "XMAS"] },
  { name: "INFANT & PRESCHOOL", subs: ["GIFT PACK", "MOTHER BAG", "BEDDING SET & BLANKET", "BABAY CARE PRODUCTS", "BABY TOYS", "BABY GEAR & UTILITY", "BABY PERSONAL CARE", "EDUCATIONAL", "KIDS BAG", "INFANT ASSESSORIES", "KIDS FURNITURE", "INFANT TOYS / PUZZLE", "FEEDING ASSESSORIES"] },
  { name: "SPORTS & OUTDOOR", subs: ["BADMINTON", "BALACING BOARD", "BASKET BALL", "BEYBLADE & FLYIG DISC", "BOW & ARROW", "BOWLING", "BOXING", "CARROM", "CRICKET", "DART GAME", "FOOTBALL", "GOLF", "HOCKEY", "HOWER BALL", "JUMPING ROPE", "POOL", "PUMP", "RACKET", "SAFETY ACCESSORIES", "SKATE", "SWIMMING", "TABLE TENNIS", "VOLLEY BALL", "YOGA", "OUTDOOR SPORTS", "INDOOR SPORTS"] },
  { name: "LIFE STYLE", subs: ["MUSIC", "BUBBLE PLAY", "NOVELTY TOYS", "SCHOOL ACCESSORIES", "GADGETS", "KIDS ACCESSORIES"] }
];

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [presetParentId, setPresetParentId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
        const { data } = await api.get("/categories");
        return data as Category[];
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
       const base64 = await compressImage(file, 600, 0.8); 
       const isTransparent = file.type.includes('png') || file.type.includes('webp') || file.type.includes('gif');
       const ext = isTransparent ? 'png' : 'jpg';
       const { data } = await api.post("/upload", { 
           image: base64, 
           name: `cat-${file.name.replace(/\.[^/.]+$/, "")}.${ext}` 
       });
       const inputElement = document.getElementById("cat_image_input") as HTMLInputElement;
       if (inputElement) {
           inputElement.value = data.url;
       }
       toast.success("Image uploaded!");
    } catch (error) {
       toast.error("Failed to upload image");
    } finally {
       setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = String(fd.get("name") || "").trim();
    const icon = String(fd.get("icon") || "").trim() || null;
    const image = String(fd.get("image") || "").trim() || null;
    const parent = String(fd.get("parent") || "").trim() || null;
    const sort_order = Number(fd.get("sort_order") || 0);
    const slug = String(fd.get("slug") || "").trim() || slugify(name);
    if (!name) return toast.error("Name is required");

    try {
        const payload = { name, icon, image, slug, sort_order, parent };
        if (editing) {
            await api.put(`/categories/${editing._id}`, payload);
            toast.success("Category updated");
        } else {
            await api.post("/categories", payload);
            toast.success("Category added");
        }
        setEditing(null);
        setShowForm(false);
        setPresetParentId("");
        qc.invalidateQueries({ queryKey: ["admin-categories"] });
        qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category? Products in it will become uncategorized.")) return;
    try {
        await api.delete(`/categories/${id}`);
        toast.success("Category deleted");
        qc.invalidateQueries({ queryKey: ["admin-categories"] });
        qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const seedMatrixClientSide = async () => {
    if (!confirm("Populate the complete database catalog with standard Parent Categories and Subcategories matrix via live API integration? This will take ~20-30 seconds.")) return;
    
    setIsSeeding(true);
    setSeedStatus("Clearing stale category records...");
    
    try {
        // 1. Delete all current categories to reset cleanly
        for (const cat of categories) {
            try {
                await api.delete(`/categories/${cat._id}`);
            } catch (err) {
                // proceed smoothly
            }
        }

        // Calculate total target count for accurate user status display
        const totalItems = matrixData.length + matrixData.reduce((acc, curr) => acc + new Set(curr.subs).size, 0);
        let createdCount = 0;
        let pOrder = 1;

        // 2. Loop through main categories sequentially to respect server load limits
        for (const pItem of matrixData) {
            createdCount++;
            setSeedStatus(`Creating (${createdCount}/${totalItems}): ${pItem.name}`);
            const pSlug = slugify(pItem.name);
            
            // Create parent via standard frontend authenticated POST
            const { data: parentRes } = await api.post('/categories', {
                name: pItem.name,
                slug: pSlug,
                sort_order: pOrder++
            });

            let sOrder = 1;
            const uniqueSubNames = [...new Set(pItem.subs)];
            for (const subName of uniqueSubNames) {
                createdCount++;
                setSeedStatus(`Creating (${createdCount}/${totalItems}): ${subName}`);
                const subSlug = `${pSlug}-${slugify(subName)}`;
                
                await api.post('/categories', {
                    name: subName,
                    slug: subSlug,
                    parent: parentRes._id,
                    sort_order: sOrder++
                });
            }
        }

        toast.success("Complete Categories Matrix fully synchronized with live Cloud Database!");
        qc.invalidateQueries({ queryKey: ["admin-categories"] });
        qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
        toast.error("Process stopped or encountered an API load limit. Refreshing state...");
        qc.invalidateQueries({ queryKey: ["admin-categories"] });
        qc.invalidateQueries({ queryKey: ["categories"] });
    } finally {
        setIsSeeding(false);
        setSeedStatus("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-lg">Categories</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={seedMatrixClientSide}
            disabled={isSeeding || isLoading}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-3 py-2 rounded-md text-sm font-semibold transition"
            title="Populate the complete standard categories and subcategories matrix"
          >
            {isSeeding ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Seeding Live DB...
              </>
            ) : (
              "⚡ Seed Matrix Data"
            )}
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); setPresetParentId(""); }}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="size-4" /> New Category
          </button>
        </div>
      </div>

      {isSeeding && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-center gap-3 shadow-sm animate-pulse">
           <Loader2 className="size-5 animate-spin text-amber-600 shrink-0" />
           <div className="text-sm font-medium leading-tight">
             <span className="font-bold block mb-0.5">Live Remote Seeding in Progress</span>
             {seedStatus}
           </div>
        </div>
      )}


      {showForm && !isSeeding && (
        <form onSubmit={save} className="bg-surface rounded-xl shadow-card p-4 space-y-3 relative">
          <button type="button" onClick={() => { setShowForm(false); setEditing(null); setPresetParentId(""); }} className="absolute top-3 right-3 text-muted-foreground">
            <X className="size-4" />
          </button>
          <h3 className="font-semibold">{editing ? "Edit category" : "New category"}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Category Name</label>
              <input name="name" required defaultValue={editing?.name} placeholder="e.g. Soft Toys" className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">URL Slug</label>
              <input name="slug" defaultValue={editing?.slug} placeholder="auto-generated" className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Emoji Icon (Fallback)</label>
              <input name="icon" defaultValue={editing?.icon ?? ""} placeholder="🧸" className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Parent Category <span className="text-[10px] font-normal lowercase italic">(Optional)</span></label>
              <select 
                name="parent" 
                defaultValue={editing?.parent?._id || editing?.parent || presetParentId || ""} 
                key={editing?._id || presetParentId}
                className="w-full px-3 py-2 text-sm border border-input rounded-none bg-white"
              >
                <option value="">— Top Level Category —</option>
                {categories
                  .filter(cat => !cat.parent) // Only show top-level as parents to prevent infinite/3-deep recursion
                  .filter(cat => !editing || cat._id !== editing._id) // Prevent circular parent to self
                  .map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))
                }
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Category Image URL</label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline flex items-center gap-1">
                  <ImageIcon className="size-3" />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <input id="cat_image_input" name="image" defaultValue={editing?.image ?? ""} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>
          </div>
          <button className="bg-primary text-primary-foreground px-5 py-2 rounded font-bold text-sm shadow-sm hover:brightness-105">
            {editing ? "Update Category" : "Save Category"}
          </button>
        </form>
      )}

      <div className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden">
        {categories
          .filter(cat => !cat.parent) // Get roots
          .map((root) => {
            const children = categories.filter(child => (child.parent?._id || child.parent) === root._id);
            
            return (
              <div key={root._id}>
                {/* Parent Category Row */}
                <div className="p-4 flex items-center gap-4 hover:bg-muted/30 transition bg-muted/5 border-l-4 border-primary">
                  <div className="size-12 shrink-0 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center shadow-sm">
                    {root.image ? (
                      <img src={resolveImage(root.image)} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-2xl">{root.icon ?? "🎁"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm md:text-base text-foreground uppercase tracking-wide">{root.name}</div>
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold border border-primary/10 uppercase">Parent</span>
                    </div>
                    <div className="text-xs text-muted-foreground">slug: <span className="font-mono text-foreground">{root.slug}</span> · order: <span className="font-bold">{root.sort_order}</span></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditing(null);
                        setPresetParentId(root._id);
                        setShowForm(true);
                        window.scrollTo({top: 0, behavior: 'smooth'});
                      }}
                      disabled={isSeeding}
                      title="Add subcategory"
                      className="p-2 hover:bg-muted rounded disabled:opacity-50"
                    >
                       <Plus className="size-4 text-muted-foreground" />
                    </button>
                    <button disabled={isSeeding} onClick={() => { setEditing(root); setShowForm(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 hover:bg-primary/10 rounded-full transition disabled:opacity-50">
                      <Pencil className="size-4 text-primary" />
                    </button>
                    <button disabled={isSeeding} onClick={() => remove(root._id)} className="p-2 hover:bg-muted rounded disabled:opacity-50">
                      <Trash2 className="size-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Children Loop */}
                {children.map(child => (
                  <div key={child._id} className="p-3 pl-8 md:pl-14 flex items-center gap-3 hover:bg-muted/30 transition border-t border-border/50">
                    <span className="text-muted-foreground opacity-40 text-lg">↳</span>
                    <div className="size-10 shrink-0 rounded-full border border-border bg-surface overflow-hidden flex items-center justify-center shadow-sm scale-90">
                      {child.image ? (
                        <img src={resolveImage(child.image)} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="text-xl">{child.icon ?? "📦"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-700">{child.name}</div>
                      <div className="text-[10px] text-muted-foreground">slug: <span className="font-mono">{child.slug}</span></div>
                    </div>
                    <button disabled={isSeeding} onClick={() => { setEditing(child); setShowForm(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 hover:bg-primary/10 rounded-full transition scale-90 disabled:opacity-50">
                      <Pencil className="size-3.5 text-primary" />
                    </button>
                    <button disabled={isSeeding} onClick={() => remove(child._id)} className="p-2 hover:bg-muted rounded scale-90 disabled:opacity-50">
                      <Trash2 className="size-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        
        {/* If any orphaned sub-categories exist (parent not found/null but has parent value) display them here safely */}
        {categories.filter(cat => cat.parent && !categories.find(r => r._id === (cat.parent?._id || cat.parent))).map(cat => (
           <div key={cat._id} className="p-4 flex items-center gap-4 bg-yellow-50/30">
              <div className="flex-1 font-semibold">{cat.name} <span className="text-xs text-destructive">(Orphaned Subcategory)</span></div>
              <button disabled={isSeeding} onClick={() => { setEditing(cat); setShowForm(true); }} className="p-2"><Pencil className="size-4 text-primary"/></button>
           </div>
        ))}

        {categories.length === 0 && !isLoading && !isSeeding && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet. Click "⚡ Seed Matrix Data" above to populate the catalog.</div>}
      </div>
    </div>
  );
}

export default AdminCategories;
