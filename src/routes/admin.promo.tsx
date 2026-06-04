import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Image as ImageIcon } from "lucide-react";
import { resolveImage } from "@/data/products";
import { compressImage } from "@/utils/imageCompressor";

export const Route = createFileRoute("/admin/promo")({
  component: AdminPromo,
});

type Banner = {
  _id: string;
  image: string;
  category: { _id: string; name: string; slug: string };
  position: "hero" | "promo";
};

function AdminPromo() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const { data: allBanners = [] } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data } = await api.get("/banners");
      return data as Banner[];
    },
  });

  const banners = allBanners.filter((b) => b.position === "promo");

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      const collections = data.data?.collections || [];
      return collections.map((cat: any) => ({
        ...cat,
        _id: cat._id || (cat.id ? String(cat.id) : ""),
        name: cat.name || cat.title || "",
        slug: cat.slug || cat.handle || "",
        image: cat.image && typeof cat.image === "object" ? cat.image.src || cat.image.url || "" : cat.image || "",
      })) as { _id: string; name: string; parent?: any; slug: string }[];
    },
  });

  const sortedCategories = [...categories].sort((a, b) => {
    const pA = a.parent ? (typeof a.parent === "object" ? a.parent.name || a.parent.title || "Sub" : "Sub") : "";
    const pB = b.parent ? (typeof b.parent === "object" ? b.parent.name || b.parent.title || "Sub" : "Sub") : "";
    const labelA = pA ? `${pA} > ${(a.name || "")}` : (a.name || "");
    const labelB = pB ? `${pB} > ${(b.name || "")}` : (b.name || "");
    return labelA.localeCompare(labelB);
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await compressImage(file, 1600, 0.8);
      const isTransparent =
        file.type.includes("png") || file.type.includes("webp") || file.type.includes("gif");
      const ext = isTransparent ? "png" : "jpg";

      const { data } = await api.post("/upload", {
        image: base64,
        name: `${file.name.replace(/\.[^/.]+$/, "")}.${ext}`,
      });
      const relativePath = data.url;
      setImagePreview(relativePath);
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

    const payload = {
      image: imagePreview || String(fd.get("image") || ""),
      category: fd.get("category"),
      position: "promo",
    };

    if (!payload.image) return toast.error("Image required");
    if (!payload.category) return toast.error("Category required");

    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, payload);
        toast.success("Promo Banner updated");
      } else {
        await api.post("/banners", payload);
        toast.success("Promo Banner added");
      }
      setShowForm(false);
      setImagePreview("");
      setEditingBanner(null);
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save promo banner");
    }
  };

  const startEdit = (b: Banner) => {
    setEditingBanner(b);
    setImagePreview(b.image);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this promo banner?")) return;
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
        <h2 className="font-bold text-lg">Promo Banners ({banners.length})</h2>
        <button
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
            setImagePreview("");
          }}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold"
        >
          <Plus className="size-4" /> Add Promo Banner
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-0">
        These banners will appear side-by-side right below the categories on the home page.
      </p>

      {showForm && (
        <form
          onSubmit={save}
          className="bg-surface rounded-xl shadow-card p-4 space-y-3 relative mt-4"
        >
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingBanner(null);
            }}
            className="absolute top-3 right-3 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
          <h3 className="font-semibold text-lg">
            {editingBanner ? "Edit Promo Banner" : "New Promo Banner"}
          </h3>

          <div className="grid gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Link Category / Subcategory
              </label>
              <select
                name="category"
                defaultValue={editingBanner?.category?._id || ""}
                required
                className="w-full px-3 py-2 text-sm border border-input rounded-none bg-white"
              >
                <option value="">— Select category/subcategory to open on click —</option>
                {sortedCategories.map((c) => {
                  const parentName = c.parent
                    ? typeof c.parent === "object"
                      ? c.parent.name
                      : "Subcategory"
                    : "";
                  const label = parentName ? `${parentName} > ${c.name}` : c.name;
                  return (
                    <option key={c._id} value={c._id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">
                  Banner Image URL
                </label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  {uploading ? "Uploading..." : "Upload from device"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
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
                  <img
                    src={resolveImage(imagePreview)}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              disabled={uploading}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded font-bold text-sm shadow-sm hover:brightness-110 disabled:opacity-50"
            >
              {editingBanner ? "Update Banner" : "Save Banner"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBanner(null);
              }}
              className="bg-muted px-4 py-2.5 rounded font-semibold text-sm hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden mt-4">
        {banners.map((b) => (
          <div key={b._id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition">
            <div className="relative shrink-0 w-32 aspect-[21/9] bg-muted border border-border rounded-md overflow-hidden">
              <img src={resolveImage(b.image)} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm md:text-base line-clamp-1">
                Link: {b.category?.name || "Unknown Category"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(b)}
                className="p-2 hover:bg-primary/10 rounded-full transition"
                title="Edit Promo Banner"
              >
                <Pencil className="size-4 text-primary" />
              </button>
              <button
                onClick={() => remove(b._id)}
                className="p-2 hover:bg-destructive/10 rounded-full transition"
                title="Delete Promo Banner"
              >
                <Trash2 className="size-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No promo banners added yet
          </div>
        )}
      </div>
    </div>
  );
}
