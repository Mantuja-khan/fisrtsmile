import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Tag, ImageIcon, Star, Megaphone } from "lucide-react";
import { resolveImage } from "@/data/products";
import { compressImage } from "@/utils/imageCompressor";
import { BRANDS } from "@/data/brands";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type ProductRow = {
  _id: string;
  name: string;
  description: string | null;
  category: any;
  price: number;
  mrp: number;
  image: string | null;
  images: string[];
  rating: number;
  rating_count: number;
  in_stock: boolean;
  badge: string | null;
  brand: string | null;
  age_range: string | null;
  offer_pct: number;
  show_in_hero: boolean;
  show_in_popup?: boolean;
  offer_starts_at?: string | null;
  offer_expires_at?: string | null;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
};

function AdminProducts() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [offerOpen, setOfferOpen] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parentCatId, setParentCatId] = useState<string>("");

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data as ProductRow[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data as { _id: string; name: string; parent?: any }[];
    },
  });

  // Pre-fill the parent when editing
  useState(() => {
    if (editing?.category) {
      const cat = categories.find(c => c._id === (editing.category._id || editing.category));
      if (cat?.parent) {
        setParentCatId(cat.parent._id || cat.parent);
      } else if (cat) {
        setParentCatId(cat._id);
      }
    }
  });

  const handleEdit = (p: ProductRow) => {
    const catObj = categories.find(c => c._id === (p.category?._id || p.category));
    if (catObj?.parent) {
      setParentCatId(catObj.parent._id || catObj.parent);
    } else if (catObj) {
      setParentCatId(catObj._id);
    } else {
      setParentCatId("");
    }
    setEditing(p);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditing(null);
    setParentCatId("");
    setShowForm(true);
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    
    // Parse gallery images (one per line)
    const galleryText = String(fd.get("gallery") || "");
    const images = galleryText.split("\n").map(s => s.trim()).filter(s => !!s);

    const payload = {
      name: String(fd.get("name") || "").trim(),
      description: String(fd.get("description") || ""),
      category: (fd.get("category") as string) || null,
      price: Number(fd.get("price")),
      mrp: fd.get("mrp") ? Number(fd.get("mrp")) : null,
      image: String(fd.get("image") || "") || null,
      images: images,
      badge: (fd.get("badge") as string) || null,
      brand: (fd.get("brand") as string) || null,
      age_range: String(fd.get("age_range") || ""),
      in_stock: fd.get("in_stock") === "on",
      show_in_hero: fd.get("show_in_hero") === "on",
      show_in_popup: fd.get("show_in_popup") === "on",
      offer_starts_at: fd.get("offer_starts_at") ? String(fd.get("offer_starts_at")) : null,
      offer_expires_at: fd.get("offer_expires_at") ? String(fd.get("offer_expires_at")) : null,
      weight: fd.get("weight") ? Number(fd.get("weight")) : null,
      length: fd.get("length") ? Number(fd.get("length")) : null,
      breadth: fd.get("breadth") ? Number(fd.get("breadth")) : null,
      height: fd.get("height") ? Number(fd.get("height")) : null,
    };

    if (!payload.name) return toast.error("Name required");
    if (payload.price < 0 || (payload.mrp !== null && payload.mrp < 0)) return toast.error("Prices must be ≥ 0");


    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product added");
      }
      setShowForm(false);
      setEditing(null);
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Deleted");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const applyOfferPrice = async (id: string, newPrice: number, mrp: number) => {
    try {
      const offer_pct = Math.round(((mrp - newPrice) / mrp) * 100);
      await api.put(`/products/${id}`, { price: newPrice, offer_pct });
      toast.success(`Offer applied: ₹${newPrice}`);
      setOfferOpen(null);
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set offer price");
    }
  };

  const applyOfferPct = async (id: string, pct: number, mrp: number) => {
    try {
      const price = Math.round(mrp - (mrp * pct / 100));
      await api.put(`/products/${id}`, { price, offer_pct: pct });
      toast.success(`Offer applied: ${pct}% OFF`);
      setOfferOpen(null);
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set offer");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "image" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
       // COMPRESS FIRST: Converts to optimized JPEG, auto-limiting size under 1MB usually
       const base64 = await compressImage(file, 1200, 0.8); 
       
       const { data } = await api.post("/upload", { 
           image: base64, 
           // sanitize name to have .jpg since compressor converts to jpeg
           name: file.name.replace(/\.[^/.]+$/, "") + ".jpg" 
       });
       const relativePath = data.url;
       
       const inputElement = document.getElementById(targetField + "_input") as HTMLInputElement | HTMLTextAreaElement;
       if (inputElement) {
           if (targetField === "image") {
               inputElement.value = relativePath;
           } else {
               inputElement.value = inputElement.value ? inputElement.value + "\n" + relativePath : relativePath;
           }
       }
       toast.success("Image uploaded!");
    } catch (error) {
       toast.error("Failed to upload image");
    } finally {
       setUploading(false);
    }
  };

  const toggleHero = async (id: string, currentVal: boolean) => {
    try {
      await api.put(`/products/${id}`, { show_in_hero: !currentVal });
      toast.success(!currentVal ? "Added to Hero Section" : "Removed from Hero Section");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const togglePopup = async (id: string, currentVal?: boolean) => {
    try {
      await api.put(`/products/${id}`, { show_in_popup: !currentVal });
      toast.success(!currentVal ? "Added to Popup broadcast" : "Removed from Popup broadcast");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Products ({products.length})</h2>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold"
        >
          <Plus className="size-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-surface rounded-xl shadow-card p-4 space-y-3 relative">
          <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="absolute top-3 right-3 text-muted-foreground">
            <X className="size-4" />
          </button>
          <h3 className="font-semibold text-lg">{editing ? "Edit product" : "New product"}</h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Product Name</label>
              <input name="name" required defaultValue={editing?.name} placeholder="Product name" className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Main Category</label>
              <select 
                value={parentCatId} 
                onChange={(e) => setParentCatId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded"
              >
                <option value="">— Select Parent —</option>
                {categories
                  .filter(c => !c.parent)
                  .map(parent => (
                    <option key={parent._id} value={parent._id}>{parent.name}</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Subcategory <span className="text-[10px] italic font-normal">(Optional)</span></label>
              <select name="category" defaultValue={editing?.category?._id || editing?.category || ""} className="w-full px-3 py-2 text-sm border border-input rounded">
                <option value={parentCatId}>— Same as Main —</option>
                {parentCatId && categories
                  .filter(c => (c.parent?._id === parentCatId || c.parent === parentCatId))
                  .map(child => (
                    <option key={child._id} value={child._id}>{child.name}</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Badge</label>
              <select name="badge" defaultValue={editing?.badge ?? ""} className="w-full px-3 py-2 text-sm border border-input rounded">
                <option value="">No badge</option>
                <option value="Best Seller">Best Seller</option>
                <option value="New">New</option>
                <option value="Flash Deal">Flash Deal</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Selling Price (₹)</label>
              <input name="price" type="number" step="0.01" required defaultValue={editing ? Number(editing.price) : ""} placeholder="e.g. 599" className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">MRP (₹) <span className="text-[10px] font-normal italic lowercase">(Optional)</span></label>
              <input name="mrp" type="number" step="0.01" defaultValue={editing?.mrp ? Number(editing.mrp) : ""} placeholder="e.g. 999" className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Brand</label>
              <select name="brand" defaultValue={editing?.brand ?? ""} className="w-full px-3 py-2 text-sm border border-input rounded">
                <option value="">— No brand selected —</option>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Age Range</label>
              <select name="age_range" defaultValue={editing?.age_range ?? ""} className="w-full px-3 py-2 text-sm border border-input rounded">
                <option value="">— Select age range —</option>
                <option value="0-2 years">0-2 years</option>
                <option value="2-4 years">2-4 years</option>
                <option value="4-7 years">4-7 years</option>
                <option value="7-9 years">7-9 years</option>
                <option value="9-12 years">9-12 years</option>
                <option value="12+ years">12+ years</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Offer Start <span className="text-[10px] font-normal italic lowercase">(Optional)</span></label>
                <input 
                  name="offer_starts_at" 
                  type="datetime-local" 
                  defaultValue={editing?.offer_starts_at ? new Date(editing.offer_starts_at).toISOString().slice(0,16) : ""} 
                  className="w-full px-2 py-1.5 text-sm border border-input rounded" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Offer Expiry <span className="text-[10px] font-normal italic lowercase">(Optional)</span></label>
                <input 
                  name="offer_expires_at" 
                  type="datetime-local" 
                  defaultValue={editing?.offer_expires_at ? new Date(editing.offer_expires_at).toISOString().slice(0,16) : ""} 
                  className="w-full px-2 py-1.5 text-sm border border-input rounded" 
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-50 p-3 rounded border border-slate-200">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                📦 Shipping Dimensions & Weight
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Weight (KG)</label>
                  <input name="weight" type="number" step="0.01" defaultValue={editing?.weight ?? ""} placeholder="e.g. 0.5" className="w-full px-2 py-1.5 text-sm border border-input rounded" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Length (CM)</label>
                  <input name="length" type="number" defaultValue={editing?.length ?? ""} placeholder="e.g. 10" className="w-full px-2 py-1.5 text-sm border border-input rounded" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Breadth (CM)</label>
                  <input name="breadth" type="number" defaultValue={editing?.breadth ?? ""} placeholder="e.g. 10" className="w-full px-2 py-1.5 text-sm border border-input rounded" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Height (CM)</label>
                  <input name="height" type="number" defaultValue={editing?.height ?? ""} placeholder="e.g. 10" className="w-full px-2 py-1.5 text-sm border border-input rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                <input type="checkbox" name="in_stock" defaultChecked={editing?.in_stock ?? true} className="size-4" /> In stock
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                <input type="checkbox" name="show_in_hero" defaultChecked={editing?.show_in_hero ?? false} className="size-4" /> Show in Hero
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4 text-purple-600 font-medium">
                <input type="checkbox" name="show_in_popup" defaultChecked={editing?.show_in_popup ?? false} className="size-4" /> Broadcast in Popup
              </label>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Primary Image URL</label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  {uploading ? "Uploading..." : "Upload from device"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "image")} disabled={uploading} />
                </label>
              </div>
              <input id="image_input" name="image" defaultValue={editing?.image ?? ""} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-input rounded" />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Gallery Images (One URL per line)</label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  {uploading ? "Uploading..." : "Upload from device"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "gallery")} disabled={uploading} />
                </label>
              </div>
              <textarea 
                id="gallery_input"
                name="gallery" 
                defaultValue={editing?.images?.join("\n") ?? ""} 
                placeholder="https://image1.jpg&#10;https://image2.jpg" 
                className="w-full px-3 py-2 text-sm border border-input rounded min-h-24 whitespace-pre font-mono" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Description</label>
              <textarea name="description" defaultValue={editing?.description ?? ""} placeholder="Detailed description..." className="w-full px-3 py-2 text-sm border border-input rounded min-h-20" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded font-bold text-sm shadow-sm hover:brightness-110">
              {editing ? "Update Product" : "Save Product"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="bg-muted px-4 py-2.5 rounded font-semibold text-sm hover:bg-muted/80">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {products.map((p) => (
          <div key={p._id} className="bg-surface sm:bg-transparent lg:bg-surface border sm:border-transparent lg:border-0 p-4 lg:p-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-muted/30 transition rounded-xl lg:rounded-none border-border lg:border-b lg:last:border-b-0">
            <div className="flex gap-4 flex-1 min-w-0">
              <div className="relative shrink-0">
                 <img src={resolveImage(p.image)} alt="" className="size-16 rounded-lg object-cover bg-muted border border-border" />
                 {p.images && p.images.length > 0 && (
                   <span className="absolute -bottom-1 -right-1 bg-white rounded-full size-6 grid place-items-center shadow-sm border border-border text-[10px] font-bold">
                     +{p.images.length}
                   </span>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm md:text-base line-clamp-1">{p.name}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  <span className="font-bold text-foreground">₹{Number(p.price).toLocaleString("en-IN")}</span> 
                  <span className="mx-1.5 opacity-50">/</span>
                  <span className="line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>
                  <br className="lg:hidden" />
                  <span className="lg:ml-2 text-success font-bold">{p.offer_pct}% OFF</span>
                  {!p.in_stock && <span className="ml-2 text-destructive font-bold uppercase text-[10px]">· Sold Out</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 border-t lg:border-0 pt-2 lg:pt-0 mt-auto lg:mt-0 justify-between lg:justify-end">
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={() => setOfferOpen(offerOpen === p._id ? null : p._id)} className="p-2 hover:bg-muted rounded-full transition" title="Override offer">
                    <Tag className="size-4 text-muted-foreground" />
                  </button>
                  {offerOpen === p._id && (
                    <div className="absolute right-0 top-10 z-20 bg-surface border border-border rounded-lg shadow-pop p-3 w-52">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Set Offer Price</div>
                      <form onSubmit={(e) => { e.preventDefault(); const val = Number(new FormData(e.currentTarget as any).get("offerPrice")); if (val && val < p.mrp) applyOfferPrice(p._id, val, p.mrp); }}>
                         <input name="offerPrice" type="number" placeholder="New price (₹)" className="w-full text-sm p-1.5 border border-input rounded outline-none focus:border-primary" required />
                         <button type="submit" className="w-full mt-2 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded hover:brightness-110">Apply Price</button>
                      </form>
                      <div className="text-[10px] text-center my-2 text-muted-foreground">OR SELECT %</div>
                      <div className="grid grid-cols-4 gap-1">
                        {[0, 10, 20, 30, 40, 50, 60, 70].map((o) => (
                          <button key={o} onClick={() => applyOfferPct(p._id, o, p.mrp)} className="px-1 py-1 text-[10px] font-bold rounded hover:bg-primary hover:text-primary-foreground border border-border transition">{o}%</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => toggleHero(p._id, p.show_in_hero)} className="p-2 hover:bg-warning/10 rounded-full transition" title="Toggle Hero Section">
                  <Star className={`size-4 ${p.show_in_hero ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                </button>
                <button onClick={() => togglePopup(p._id, p.show_in_popup)} className="p-2 hover:bg-purple-100 rounded-full transition" title="Broadcast in Account Popup">
                  <Megaphone className={`size-4 ${p.show_in_popup ? 'fill-purple-600 text-purple-600' : 'text-muted-foreground'}`} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(p)} className="p-2 hover:bg-primary/10 rounded-full transition">
                  <Pencil className="size-4 text-primary" />
                </button>
                <button onClick={() => remove(p._id)} className="p-2 hover:bg-destructive/10 rounded-full transition">
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">Your store is currently empty</div>}
      </div>
    </div>
  );
}
