import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Category = {
  _id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
        const { data } = await api.get("/categories");
        return data as Category[];
    },
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = String(fd.get("name") || "").trim();
    const icon = String(fd.get("icon") || "").trim() || null;
    const sort_order = Number(fd.get("sort_order") || 0);
    const slug = String(fd.get("slug") || "").trim() || slugify(name);
    if (!name) return toast.error("Name is required");

    try {
        if (editing) {
            await api.put(`/categories/${editing._id}`, { name, icon, slug, sort_order });
            toast.success("Category updated");
        } else {
            await api.post("/categories", { name, icon, slug, sort_order });
            toast.success("Category added");
        }
        setEditing(null);
        setShowForm(false);
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
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold"
        >
          <Plus className="size-4" /> New Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-surface rounded-xl shadow-card p-4 space-y-3 relative">
          <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="absolute top-3 right-3 text-muted-foreground">
            <X className="size-4" />
          </button>
          <h3 className="font-semibold">{editing ? "Edit category" : "New category"}</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input name="name" required defaultValue={editing?.name} placeholder="Name (e.g. Soft Toys)" className="px-3 py-2 text-sm border border-input rounded" />
            <input name="slug" defaultValue={editing?.slug} placeholder="slug (auto if empty)" className="px-3 py-2 text-sm border border-input rounded" />
            <input name="icon" defaultValue={editing?.icon ?? ""} placeholder="Emoji icon (🧸)" className="px-3 py-2 text-sm border border-input rounded" />
            <input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} placeholder="Sort order" className="px-3 py-2 text-sm border border-input rounded" />
          </div>
          <button className="bg-warning text-warning-foreground px-4 py-2 rounded font-semibold text-sm">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="bg-surface rounded-xl shadow-card divide-y divide-border">
        {categories.map((c) => (
          <div key={c._id} className="p-3 flex items-center gap-3">
            <div className="text-2xl w-8 text-center">{c.icon ?? "🎁"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground">slug: {c.slug} · order: {c.sort_order}</div>
            </div>
            <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-2 hover:bg-muted rounded">
              <Pencil className="size-4 text-primary" />
            </button>
            <button onClick={() => remove(c._id)} className="p-2 hover:bg-muted rounded">
              <Trash2 className="size-4 text-destructive" />
            </button>
          </div>
        ))}
        {categories.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet</div>}
      </div>
    </div>
  );
}
