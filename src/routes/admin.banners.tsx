import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import { resolveImage } from "@/data/products";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

type Banner = {
  _id: string;
  image: string;
  category: { _id: string; name: string; slug: string };
  position: 'hero' | 'promo';
};

function AdminBanners() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: allBanners = [] } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data } = await api.get("/banners");
      return data as Banner[];
    },
  });

  const banners = allBanners.filter(b => b.position !== 'promo');

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data as { _id: string; name: string }[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
       const base64 = reader.result;
       setUploading(true);
       try {
           const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5003/api";
           const { data } = await api.post("/upload", { image: base64, name: file.name });
           const baseUrl = apiHost.replace("/api", "");
           const fullUrl = `${baseUrl}${data.url}`;
           setImagePreview(fullUrl);
           toast.success("Image uploaded!");
       } catch (error) {
           toast.error("Failed to upload image");
       } finally {
           setUploading(false);
       }
    };
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    
    const payload = {
      image: imagePreview || String(fd.get("image") || ""),
      category: fd.get("category"),
      position: 'hero',
    };

    if (!payload.image) return toast.error("Image required");
    if (!payload.category) return toast.error("Category required");

    try {
      await api.post("/banners", payload);
      toast.success("Banner added");
      setShowForm(false);
      setImagePreview("");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save banner");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success("Deleted");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Hero Banners ({banners.length})</h2>
        <button
          onClick={() => { setShowForm(true); setImagePreview(""); }}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold"
        >
          <Plus className="size-4" /> Add Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-surface rounded-xl shadow-card p-4 space-y-3 relative">
          <button type="button" onClick={() => { setShowForm(false); }} className="absolute top-3 right-3 text-muted-foreground">
            <X className="size-4" />
          </button>
          <h3 className="font-semibold text-lg">New Banner</h3>
          
          <div className="grid gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Link Category</label>
              <select name="category" required className="w-full px-3 py-2 text-sm border border-input rounded">
                <option value="">— Select category to open on click —</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Banner Image URL</label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  {uploading ? "Uploading..." : "Upload from device"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <input 
                name="image" 
                value={imagePreview} 
                onChange={(e) => setImagePreview(e.target.value)}
                placeholder="https://... (or upload from device)" 
                className="w-full px-3 py-2 text-sm border border-input rounded mb-2" 
                required
              />
              {imagePreview && (
                <div className="aspect-[21/9] w-full max-w-lg rounded-lg overflow-hidden border border-border mt-2">
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button disabled={uploading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded font-bold text-sm shadow-sm hover:brightness-110 disabled:opacity-50">
              Save Banner
            </button>
            <button type="button" onClick={() => { setShowForm(false); }} className="bg-muted px-4 py-2.5 rounded font-semibold text-sm hover:bg-muted/80">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden">
        {banners.map((b) => (
          <div key={b._id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition">
            <div className="relative shrink-0 w-32 aspect-[21/9] bg-muted border border-border rounded-md overflow-hidden">
               <img src={resolveImage(b.image)} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm md:text-base line-clamp-1">Link: {b.category?.name || 'Unknown Category'}</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => remove(b._id)} className="p-2 hover:bg-destructive/10 rounded-full transition">
                <Trash2 className="size-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">No hero banners added yet</div>}
      </div>
    </div>
  );
}
