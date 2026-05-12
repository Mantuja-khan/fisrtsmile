import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, ImageIcon } from "lucide-react";
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

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [presetParentId, setPresetParentId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({
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
       const { data } = await api.post("/upload", { 
           image: base64, 
           name: `cat-${file.name.replace(/\.[^/.]+$/, "")}.jpg` 
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Categories</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); setPresetParentId(""); }}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold"
        >
          <Plus className="size-4" /> New Category
        </button>
      </div>

      {showForm && (
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
                className="w-full px-3 py-2 text-sm border border-input rounded bg-white"
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
                      title="Add subcategory"
                      className="p-2 hover:bg-muted rounded"
                    >
                       <Plus className="size-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => { setEditing(root); setShowForm(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 hover:bg-primary/10 rounded-full transition">
                      <Pencil className="size-4 text-primary" />
                    </button>
                    <button onClick={() => remove(root._id)} className="p-2 hover:bg-muted rounded">
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
                    <button onClick={() => { setEditing(child); setShowForm(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 hover:bg-primary/10 rounded-full transition scale-90">
                      <Pencil className="size-3.5 text-primary" />
                    </button>
                    <button onClick={() => remove(child._id)} className="p-2 hover:bg-muted rounded scale-90">
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
              <button onClick={() => { setEditing(cat); setShowForm(true); }} className="p-2"><Pencil className="size-4 text-primary"/></button>
           </div>
        ))}

        {categories.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet</div>}
      </div>
    </div>
  );
}
