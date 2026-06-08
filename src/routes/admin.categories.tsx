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
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const matrixData = [
  "BLOCKS",
  "DOLL & DOLL SETS",
  "RIDE ON",
  "BOARD GAME & PUZZLE",
  "SCHOOL",
  "DECORATION",
  "ELECTRONIC TOYS",
  "KIDS FURNITURE",
  "SOFT TOYS",
  "FIGURE & PLAYSET",
  "KIDS ASSESSORIES",
  "GIFT",
  "MUSICAL",
  "VEHICLES & TRACKS",
  "GUNS & WEAPONS",
  "NOVELTY TOYS",
  "FESTIVAL",
  "INFANT & TOODLER",
  "SPORTS"
];

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [presetParentId, setPresetParentId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
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
      })) as Category[];
    },
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c._id));
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete these ${selectedIds.length} selected categories? Products in them will become uncategorized.`,
      )
    )
      return;

    setIsBulkDeleting(true);
    try {
      let deletedCount = 0;
      for (const id of selectedIds) {
        await api.delete(`/categories/${id}`);
        deletedCount++;
      }
      toast.success(`${deletedCount} categories deleted successfully!`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete all selected categories");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await compressImage(file, 600, 0.8);
      const isTransparent =
        file.type.includes("png") || file.type.includes("webp") || file.type.includes("gif");
      const ext = isTransparent ? "png" : "jpg";
      const { data } = await api.post("/upload", {
        image: base64,
        name: `cat-${file.name.replace(/\.[^/.]+$/, "")}.${ext}`,
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
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const seedMatrixClientSide = async () => {
    if (
      !confirm(
        "Populate the database catalog with standard Categories via live API integration?",
      )
    )
      return;

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

      let createdCount = 0;
      let pOrder = 1;

      // 2. Loop through categories sequentially to respect server load limits
      for (const pName of matrixData) {
        createdCount++;
        setSeedStatus(`Creating (${createdCount}/${matrixData.length}): ${pName}`);
        const pSlug = slugify(pName);

        // Create category via standard frontend authenticated POST
        await api.post("/categories", {
          name: pName,
          slug: pSlug,
          sort_order: pOrder++,
        });
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
      setSelectedIds([]);
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
          {selectedIds.length > 0 && (
            <button
              onClick={bulkDelete}
              disabled={isBulkDeleting || isSeeding}
              className="inline-flex items-center gap-1.5 bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50 text-white px-3 py-2 rounded-none text-sm font-semibold transition"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Delete Selected ({selectedIds.length})
                </>
              )}
            </button>
          )}
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              setPresetParentId("");
            }}
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
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditing(null);
              setPresetParentId("");
            }}
            className="absolute top-3 right-3 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
          <h3 className="font-semibold">{editing ? "Edit category" : "New category"}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Category Name
              </label>
              <input
                name="name"
                required
                defaultValue={editing?.name}
                placeholder="e.g. Soft Toys"
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                URL Slug
              </label>
              <input
                name="slug"
                defaultValue={editing?.slug}
                placeholder="auto-generated"
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Emoji Icon (Fallback)
              </label>
              <input
                name="icon"
                defaultValue={editing?.icon ?? ""}
                placeholder="🧸"
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Sort Order
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 0}
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">
                  Category Image URL
                </label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline flex items-center gap-1">
                  <ImageIcon className="size-3" />
                  {uploading ? "Uploading..." : "Upload Image"}
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
                id="cat_image_input"
                name="image"
                defaultValue={editing?.image ?? ""}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>
          </div>
          <button className="bg-primary text-primary-foreground px-5 py-2 rounded font-bold text-sm shadow-sm hover:brightness-105">
            {editing ? "Update Category" : "Save Category"}
          </button>
        </form>
      )}

      <div className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden">
        {categories.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={categories.length > 0 && selectedIds.length === categories.length}
              onChange={handleSelectAll}
              className="size-4 accent-primary cursor-pointer rounded-none border-border"
            />
            <span className="cursor-pointer select-none" onClick={handleSelectAll}>
              Select All Categories ({categories.length})
            </span>
          </div>
        )}
        {categories.map((cat) => {
          return (
            <div key={cat._id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition">
              <input
                type="checkbox"
                checked={selectedIds.includes(cat._id)}
                onChange={() => handleToggleSelect(cat._id)}
                className="size-4 accent-primary cursor-pointer rounded-none border-border shrink-0"
              />
              <div className="size-12 shrink-0 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center shadow-sm">
                {cat.image ? (
                  <img
                    src={resolveImage(cat.image)}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{cat.icon ?? "🎁"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm md:text-base text-foreground uppercase tracking-wide">
                    {cat.name}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  slug: <span className="font-mono text-foreground">{cat.slug}</span> · order:{" "}
                  <span className="font-bold">{cat.sort_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={isSeeding}
                  onClick={() => {
                    setEditing(cat);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="p-2 hover:bg-primary/10 rounded-full transition disabled:opacity-50"
                >
                  <Pencil className="size-4 text-primary" />
                </button>
                <button
                  disabled={isSeeding}
                  onClick={() => remove(cat._id)}
                  className="p-2 hover:bg-muted rounded disabled:opacity-50"
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && !isLoading && !isSeeding && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No categories yet. Click "⚡ Seed Matrix Data" above to populate the catalog.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategories;
