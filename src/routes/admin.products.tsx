import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Tag, ImageIcon, Star, Zap, Upload, Loader2, FileSpreadsheet } from "lucide-react";
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
  is_sale?: boolean;
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
  const [subCatId, setSubCatId] = useState<string>("");
  
  const [excelImporting, setExcelImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [previewRows, setPreviewRows] = useState<any[] | null>(null);

  const loadXLSX = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).XLSX) return resolve((window as any).XLSX);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload = () => resolve((window as any).XLSX);
      script.onerror = () => reject(new Error("Failed to load Excel Parser"));
      document.head.appendChild(script);
    });
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportProgress("Loading parser...");
      setExcelImporting(true);
      const XLSX = await loadXLSX();

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawRows = XLSX.utils.sheet_to_json(ws);

          if (!rawRows.length) {
            toast.error("No rows found in spreadsheet!");
            setExcelImporting(false);
            return;
          }

          const getVal = (row: any, keys: string[]) => {
            const keysInRow = Object.keys(row);
            for (const k of keys) {
              const match = keysInRow.find(kr => kr.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
              if (match !== undefined) return row[match];
            }
            return undefined;
          };

          const mapped = rawRows.map((r: any) => {
            const subcatName = String(getVal(r, ['subcategory', 'subcat', 'childcategory', 'childcat']) || '').trim();
            const maincatName = String(getVal(r, ['category', 'cat', 'parentcategory', 'maincategory']) || '').trim();
            
            let matchedCat = null;
            if (subcatName) {
              matchedCat = categories.find((c: any) => c.name.toLowerCase() === subcatName.toLowerCase());
            }
            
            if (!matchedCat && maincatName) {
              matchedCat = categories.find((c: any) => c.name.toLowerCase() === maincatName.toLowerCase());
            }

            const displayCatName = subcatName 
              ? (maincatName ? `${maincatName} > ${subcatName}` : subcatName)
              : maincatName;
            
            return {
              name: String(getVal(r, ['name', 'productname', 'item', 'title']) || '').trim(),
              description: String(getVal(r, ['description', 'desc', 'about', 'detail']) || ''),
              price: Number(getVal(r, ['price', 'sellingprice', 'rate']) || 0),
              mrp: Number(getVal(r, ['mrp', 'originalprice', 'marketprice', 'retailprice']) || 0),
              image: String(getVal(r, ['image', 'img', 'url', 'imageurl', 'pic', 'picture']) || ''),
              brand: String(getVal(r, ['brand', 'company', 'make']) || ''),
              age_range: String(getVal(r, ['agerange', 'age', 'years']) || ''),
              category: matchedCat ? matchedCat._id : null,
              categoryName: displayCatName || "None",
              in_stock: true
            };
          }).filter((item: any) => !!item.name);

          if (!mapped.length) {
            toast.error("No products parsed successfully (Name header required).");
            setExcelImporting(false);
          } else {
            setPreviewRows(mapped);
            setExcelImporting(false);
            setImportProgress("");
          }
        } catch (err: any) {
          toast.error("Failed parsing file: " + err.message);
          setExcelImporting(false);
        }
      };
      reader.readAsBinaryString(file);
      e.target.value = ""; 
    } catch (err: any) {
      toast.error(err.message);
      setExcelImporting(false);
    }
  };

  const confirmImport = async () => {
    if (!previewRows) return;
    setExcelImporting(true);
    setPreviewRows(null);
    
    let count = 0;
    for (let i = 0; i < previewRows.length; i++) {
      const row = previewRows[i];
      setImportProgress(`Importing ${i + 1} of ${previewRows.length}: ${row.name}`);
      try {
        await api.post("/products", {
          name: row.name,
          description: row.description,
          price: row.price,
          mrp: row.mrp || row.price,
          image: row.image,
          category: row.category,
          brand: row.brand,
          age_range: row.age_range,
          in_stock: true
        });
        count++;
      } catch (error) {
        console.error("Failed importing: ", row.name, error);
      }
    }

    setExcelImporting(false);
    setImportProgress("");
    toast.success(`Imported ${count} products successfully!`);
    invalidate();
  };

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
        setSubCatId(cat._id);
      } else if (cat) {
        setParentCatId(cat._id);
        setSubCatId(cat._id);
      }
    }
  });

  const handleEdit = (p: ProductRow) => {
    const catObj = categories.find(c => c._id === (p.category?._id || p.category));
    if (catObj?.parent) {
      setParentCatId(catObj.parent._id || catObj.parent);
      setSubCatId(catObj._id);
    } else if (catObj) {
      setParentCatId(catObj._id);
      setSubCatId(catObj._id);
    } else {
      setParentCatId("");
      setSubCatId("");
    }
    setEditing(p);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditing(null);
    setParentCatId("");
    setSubCatId("");
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
      badge: fd.getAll("badge").filter(Boolean).join(",") || null,
      brand: (fd.get("brand") as string) || null,
      age_range: fd.getAll("age_range").filter(Boolean).join(","),
      in_stock: fd.get("in_stock") === "on",
      show_in_hero: fd.get("show_in_hero") === "on",
      is_sale: fd.get("is_sale") === "on",
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

  const toggleSale = async (id: string, currentVal?: boolean) => {
    try {
      await api.put(`/products/${id}`, { is_sale: !currentVal });
      toast.success(!currentVal ? "Added to Flash/Sale Area" : "Removed from Flash/Sale Area");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-lg">Products ({products.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input 
            type="file" 
            id="excel-import-input" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            onChange={handleExcelImport} 
          />
          <button
            onClick={() => document.getElementById("excel-import-input")?.click()}
            disabled={excelImporting}
            className="inline-flex items-center gap-1.5 border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="size-4" /> Import Excel
          </button>
          <button
            onClick={handleNew}
            disabled={excelImporting}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold"
          >
            <Plus className="size-4" /> Add Product
          </button>
        </div>
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
                onChange={(e) => {
                  const val = e.target.value;
                  setParentCatId(val);
                  setSubCatId(val); // default subcategory to parent itself
                }}
                className="w-full px-3 py-2 text-sm border border-input rounded bg-white"
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
              <select 
                name="category" 
                value={subCatId} 
                onChange={(e) => setSubCatId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded bg-white"
              >
                <option value={parentCatId}>— Same as Main —</option>
                {parentCatId && categories
                  .filter(c => (c.parent?._id === parentCatId || c.parent === parentCatId))
                  .map(child => (
                    <option key={child._id} value={child._id}>{child.name}</option>
                  ))
                }
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Badges (Select Multiple)</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 p-2.5 border border-input rounded bg-slate-50/50">
                {["Best Seller", "New", "Flash Deal", "Trending", "Top Rated"].map((b) => {
                  const isChecked = editing?.badge?.split(",").includes(b) ?? false;
                  return (
                    <label key={b} className="flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                      <input type="checkbox" name="badge" value={b} defaultChecked={isChecked} className="size-4 accent-primary" />
                      {b}
                    </label>
                  );
                })}
              </div>
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

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Age Ranges (Select Multiple)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-2 p-2.5 border border-input rounded bg-slate-50/50">
                {["0-2 years", "2-4 years", "4-7 years", "7-9 years", "9-12 years", "12+ years"].map((age) => {
                  const isChecked = editing?.age_range?.split(",").includes(age) ?? false;
                  return (
                    <label key={age} className="flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700">
                      <input type="checkbox" name="age_range" value={age} defaultChecked={isChecked} className="size-4 accent-primary" />
                      {age}
                    </label>
                  );
                })}
              </div>
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
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4 text-emerald-600 font-medium">
                <input type="checkbox" name="is_sale" defaultChecked={editing?.is_sale ?? false} className="size-4" /> Add to Flash / Sale Area
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
                  {p.is_sale && <span className="ml-2 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">Flash / Sale Area</span>}
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
                <button onClick={() => toggleSale(p._id, p.is_sale)} className="p-2 hover:bg-emerald-100 rounded-full transition" title="Toggle Flash / Sale Area">
                  <Zap className={`size-4 ${p.is_sale ? 'fill-emerald-600 text-emerald-600 scale-110' : 'text-muted-foreground'}`} />
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

      {/* Excel Parsing/Importing Dialog Overlay */}
      {excelImporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-surface text-foreground rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <Loader2 className="size-12 text-emerald-600 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-emerald-800">Processing Spreadsheet</h3>
              <p className="text-sm text-muted-foreground">{importProgress || "Working on it..."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Excel Preview Grid Modal */}
      {previewRows && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-4 overflow-y-auto">
          <div className="bg-surface text-foreground rounded-xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-emerald-50 rounded-t-xl">
              <div>
                <h3 className="font-extrabold text-xl text-emerald-900 flex items-center gap-2">
                  <FileSpreadsheet className="size-5" /> Spreadsheet Preview
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">Found {previewRows.length} products. Review and map below.</p>
              </div>
              <button onClick={() => setPreviewRows(null)} className="p-1.5 bg-white/80 hover:bg-white rounded-full transition text-emerald-800 border border-emerald-200">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-muted border-b border-border font-bold text-muted-foreground">
                    <th className="p-2.5">Product Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Brand</th>
                    <th className="p-2.5 text-right">Selling Price</th>
                    <th className="p-2.5 text-right">MRP</th>
                    <th className="p-2.5">Image Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium text-foreground">
                  {previewRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 text-foreground font-bold">{r.name}</td>
                      <td className="p-2.5 min-w-[220px]">
                        <div className="space-y-1">
                          <select
                            value={r.category || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...previewRows];
                              updated[idx] = { ...updated[idx], category: val || null };
                              setPreviewRows(updated);
                            }}
                            className={`w-full text-[11px] font-bold p-1.5 border rounded-md outline-none cursor-pointer bg-white shadow-sm ${
                              r.category ? "border-emerald-300 bg-emerald-50/30 text-emerald-800" : "border-amber-300 bg-amber-50/30 text-amber-800"
                            }`}
                          >
                            <option value="">— Uncategorized —</option>
                            {categories
                              .filter((c: any) => !c.parent)
                              .map((parent: any) => (
                                <optgroup key={parent._id} label={parent.name}>
                                  <option value={parent._id}>{parent.name} (Main)</option>
                                  {categories
                                    .filter((c: any) => (c.parent?._id === parent._id || c.parent === parent._id))
                                    .map((child: any) => (
                                      <option key={child._id} value={child._id}>↳ {child.name}</option>
                                    ))
                                  }
                                </optgroup>
                              ))
                            }
                          </select>
                          {r.categoryName && r.categoryName !== "None" && (
                            <div className="text-[9px] text-slate-500 font-medium italic ml-1 truncate max-w-[190px]" title={`Excel data: ${r.categoryName}`}>
                              Found: "{r.categoryName}"
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-muted-foreground">{r.brand || "—"}</td>
                      <td className="p-2.5 text-right font-bold">₹{r.price.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-muted-foreground">₹{r.mrp.toLocaleString()}</td>
                      <td className="p-2.5 text-muted-foreground italic truncate max-w-[120px]">{r.image ? "✓ Provided" : "— No image"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-muted/10 rounded-b-xl">
              <button onClick={() => setPreviewRows(null)} className="px-4 py-2 rounded-lg border border-input hover:bg-white transition font-semibold text-sm text-muted-foreground">
                Cancel
              </button>
              <button onClick={confirmImport} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition text-white font-bold text-sm shadow-sm flex items-center gap-2">
                <Upload className="size-4" /> Confirm & Import Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
