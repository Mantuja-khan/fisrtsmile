import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Tag,
  ImageIcon,
  Star,
  Zap,
  Upload,
  Loader2,
  FileSpreadsheet,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

          const cleanStr = (val: any): string => {
            if (val === undefined || val === null) return "";
            let s = String(val).trim();
            if (s.startsWith('"') && s.endsWith('"')) {
              s = s.slice(1, -1);
            } else if (s.startsWith("'") && s.endsWith("'")) {
              s = s.slice(1, -1);
            }
            return s.trim();
          };

          const cleanNum = (val: any): number => {
            if (val === undefined || val === null || val === "") return NaN;
            let s = String(val).replace(/["']/g, "").trim();
            return Number(s);
          };

          const getVal = (row: any, keys: string[]) => {
            const keysInRow = Object.keys(row);
            for (const k of keys) {
              const match = keysInRow.find(
                (kr) =>
                  kr.toLowerCase().replace(/[^a-z0-9]/g, "") ===
                  k.toLowerCase().replace(/[^a-z0-9]/g, ""),
              );
              if (match !== undefined) return row[match];
            }
            return undefined;
          };

          const normalizeAgeRange = (
            raw: any,
          ): { ageRange: string | null; unrecognized: string[] } => {
            if (raw === undefined || raw === null || String(raw).trim() === "") {
              return { ageRange: null, unrecognized: [] };
            }

            // Clean up standard separators like comma, semicolon, slash, pipe
            const parts = String(raw)
              .split(/[,\n|;]+/)
              .map((p) => p.trim())
              .filter((p) => !!p);

            const normalizedTags: string[] = [];
            const unrecognized: string[] = [];

            for (const p of parts) {
              const lower = p.toLowerCase();

              // 0-18 month
              if (
                (lower.includes("0") &&
                  lower.includes("18") &&
                  (lower.includes("month") || lower.includes("m"))) ||
                (lower.includes("0") && lower.includes("18") && !lower.includes("36"))
              ) {
                if (!normalizedTags.includes("0-18 month")) normalizedTags.push("0-18 month");
              }
              // 18-36 month
              else if (
                (lower.includes("18") &&
                  lower.includes("36") &&
                  (lower.includes("month") || lower.includes("m"))) ||
                (lower.includes("18") && lower.includes("36"))
              ) {
                if (!normalizedTags.includes("18-36 month")) normalizedTags.push("18-36 month");
              }
              // 3-5 year
              else if (
                lower.includes("3") &&
                lower.includes("5") &&
                (lower.includes("year") || lower.includes("y") || lower.includes("yr"))
              ) {
                if (!normalizedTags.includes("3-5 year")) normalizedTags.push("3-5 year");
              }
              // 5-7 year
              else if (
                lower.includes("5") &&
                lower.includes("7") &&
                (lower.includes("year") || lower.includes("y") || lower.includes("yr"))
              ) {
                if (!normalizedTags.includes("5-7 year")) normalizedTags.push("5-7 year");
              }
              // 7-9 year
              else if (
                lower.includes("7") &&
                lower.includes("9") &&
                (lower.includes("year") || lower.includes("y") || lower.includes("yr"))
              ) {
                if (!normalizedTags.includes("7-9 year")) normalizedTags.push("7-9 year");
              }
              // 9-12 year
              else if (
                lower.includes("9") &&
                lower.includes("12") &&
                !lower.includes("+") &&
                !lower.includes("plus") &&
                !lower.includes("above") &&
                (lower.includes("year") || lower.includes("y") || lower.includes("yr"))
              ) {
                if (!normalizedTags.includes("9-12 year")) normalizedTags.push("9-12 year");
              }
              // 12 +years
              else if (
                (lower.includes("12") &&
                  (lower.includes("+") ||
                    lower.includes("plus") ||
                    lower.includes("above") ||
                    lower.includes("over") ||
                    lower.includes("more"))) ||
                (lower.startsWith("12") &&
                  (lower.includes("year") || lower.includes("y") || lower.includes("yr")) &&
                  (lower.includes("+") ||
                    lower.includes("above") ||
                    lower.includes("over") ||
                    lower.includes("more") ||
                    lower.endsWith("+") ||
                    lower.includes("year+"))) ||
                lower.replace(/\s+/g, "").includes("12year+") ||
                lower.replace(/\s+/g, "").includes("12+year") ||
                lower.replace(/\s+/g, "").includes("12+")
              ) {
                if (!normalizedTags.includes("12 +years")) normalizedTags.push("12 +years");
              }
              // Fallbacks or direct mappings if they match clean values perfectly
              else {
                const clean = p.replace(/\s+/g, "");
                if (clean === "0-18month" || clean === "0to18month") {
                  if (!normalizedTags.includes("0-18 month")) normalizedTags.push("0-18 month");
                } else if (clean === "18-36month" || clean === "18to36month") {
                  if (!normalizedTags.includes("18-36 month")) normalizedTags.push("18-36 month");
                } else if (clean === "3-5year" || clean === "3to5year") {
                  if (!normalizedTags.includes("3-5 year")) normalizedTags.push("3-5 year");
                } else if (clean === "5-7year" || clean === "5to7year") {
                  if (!normalizedTags.includes("5-7 year")) normalizedTags.push("5-7 year");
                } else if (clean === "7-9year" || clean === "7to9year") {
                  if (!normalizedTags.includes("7-9 year")) normalizedTags.push("7-9 year");
                } else if (clean === "9-12year" || clean === "9to12year") {
                  if (!normalizedTags.includes("9-12 year")) normalizedTags.push("9-12 year");
                } else if (
                  clean === "12+years" ||
                  clean === "12+year" ||
                  clean === "12year+" ||
                  clean === "12years+" ||
                  clean === "12+yr" ||
                  clean === "12yr+"
                ) {
                  if (!normalizedTags.includes("12 +years")) normalizedTags.push("12 +years");
                } else {
                  unrecognized.push(p);
                }
              }
            }

            return {
              ageRange: normalizedTags.length > 0 ? normalizedTags.join(",") : null,
              unrecognized,
            };
          };

          const mapped = rawRows
            .map((r: any) => {
              const rawSubcat = getVal(r, ["subcategory", "subcat", "childcategory", "childcat"]);
              const rawMaincat = getVal(r, ["category", "cat", "parentcategory", "maincategory"]);
              const subcatName = cleanStr(rawSubcat);
              const maincatName = cleanStr(rawMaincat);

              let matchedCat = null;
              if (subcatName) {
                matchedCat = categories.find(
                  (c: any) => cleanStr(c.name).toLowerCase() === subcatName.toLowerCase(),
                );
              }

              if (!matchedCat && maincatName) {
                matchedCat = categories.find(
                  (c: any) => cleanStr(c.name).toLowerCase() === maincatName.toLowerCase(),
                );
              }

              const displayCatName = subcatName
                ? maincatName
                  ? `${maincatName} > ${subcatName}`
                  : subcatName
                : maincatName;

              const parseBool = (val: any, fallback: boolean): boolean => {
                if (val === undefined || val === null || val === "") return fallback;
                if (typeof val === "boolean") return val;
                const s = cleanStr(val).toLowerCase();
                return ["true", "1", "yes", "y", "in stock", "on"].includes(s);
              };

              const primaryImgRaw = getVal(r, [
                "image",
                "img",
                "url",
                "imageurl",
                "pic",
                "picture",
              ]);
              const primaryImgCleaned = cleanStr(primaryImgRaw);
              const parsedPrimaryList = primaryImgCleaned
                ? primaryImgCleaned
                    .split(/[,\n|]+/)
                    .map((url) => cleanStr(url))
                    .filter((url) => !!url)
                : [];

              const galleryRaw = getVal(r, [
                "images",
                "gallery",
                "additionalimages",
                "otherimages",
                "pics",
              ]);
              const galleryCleaned = cleanStr(galleryRaw);
              const parsedGalleryList = galleryCleaned
                ? galleryCleaned
                    .split(/[,\n|]+/)
                    .map((url) => cleanStr(url))
                    .filter((url) => !!url)
                : [];

              const allImagesUnique: string[] = [];
              parsedPrimaryList.forEach((url) => {
                if (!allImagesUnique.includes(url)) allImagesUnique.push(url);
              });
              parsedGalleryList.forEach((url) => {
                if (!allImagesUnique.includes(url)) allImagesUnique.push(url);
              });

              const primaryImg = allImagesUnique.length > 0 ? allImagesUnique[0] : "";
              const parsedGallery = allImagesUnique;

              const nameRaw = getVal(r, ["name", "productname", "item", "title"]);
              const priceRaw = getVal(r, ["price", "sellingprice", "rate"]);
              const mrpRaw = getVal(r, ["mrp", "originalprice", "marketprice", "retailprice"]);
              const descRaw = getVal(r, ["description", "desc", "about", "detail"]);
              const brandRaw = getVal(r, ["brand", "company", "make"]);

              // Filter out entirely empty rows (often happens at the end of Excel sheets)
              if (
                !nameRaw &&
                priceRaw === undefined &&
                mrpRaw === undefined &&
                !descRaw &&
                !brandRaw &&
                !displayCatName &&
                !primaryImg &&
                parsedGallery.length === 0
              ) {
                return null;
              }

              const name = cleanStr(nameRaw);
              const description = cleanStr(descRaw);
              const badge = cleanStr(getVal(r, ["badge", "badges", "tag", "tags"])) || null;
              const brand = cleanStr(brandRaw) || null;

              const age_range_raw = getVal(r, ["agerange", "age", "years", "ages"]);
              const ageRangeRes = normalizeAgeRange(age_range_raw);
              const age_range = ageRangeRes.ageRange;

              const rawWeight = getVal(r, ["weight", "wt"]);
              const rawLength = getVal(r, ["length", "len", "l"]);
              const rawBreadth = getVal(r, ["breadth", "width", "b", "w"]);
              const rawHeight = getVal(r, ["height", "ht", "h"]);

              const weight =
                rawWeight !== undefined && rawWeight !== null && rawWeight !== ""
                  ? cleanNum(rawWeight)
                  : null;
              const length =
                rawLength !== undefined && rawLength !== null && rawLength !== ""
                  ? cleanNum(rawLength)
                  : null;
              const breadth =
                rawBreadth !== undefined && rawBreadth !== null && rawBreadth !== ""
                  ? cleanNum(rawBreadth)
                  : null;
              const height =
                rawHeight !== undefined && rawHeight !== null && rawHeight !== ""
                  ? cleanNum(rawHeight)
                  : null;

              const priceNum = cleanNum(priceRaw);
              const mrpNum = cleanNum(mrpRaw);

              const errors: string[] = [];
              const warnings: string[] = [];

              // 1. Name validation
              let finalName = name;
              if (!finalName) {
                finalName = "— Unnamed Product —";
                warnings.push("Product name is missing, defaulted to 'Unnamed Product'");
              }

              // 2. Price validation
              let finalPrice = priceNum;
              if (priceRaw === undefined || priceRaw === null || String(priceRaw).trim() === "") {
                finalPrice = 0;
                warnings.push("Price is missing, defaulted to 0");
              } else if (isNaN(priceNum)) {
                finalPrice = 0;
                warnings.push("Price is invalid, defaulted to 0");
              } else if (priceNum < 0) {
                finalPrice = 0;
                warnings.push("Price cannot be negative, defaulted to 0");
              }

              // 3. MRP validation
              let finalMrp = null;
              if (mrpRaw !== undefined && mrpRaw !== null && String(mrpRaw).trim() !== "") {
                if (isNaN(mrpNum)) {
                  warnings.push("MRP must be a valid number, ignored");
                } else if (mrpNum < 0) {
                  warnings.push("MRP cannot be negative, ignored");
                } else {
                  finalMrp = mrpNum;
                  if (finalPrice > 0 && mrpNum < finalPrice) {
                    warnings.push(`MRP (₹${mrpNum}) is lower than Price (₹${finalPrice})`);
                  }
                }
              }

              // 4. Dimensions validation (Only warn if partially provided, and clear them so they import as blank/null)
              const hasAnyDim = length !== null || breadth !== null || height !== null;
              const hasAllDims = length !== null && breadth !== null && height !== null;

              let parsedLength = length;
              let parsedBreadth = breadth;
              let parsedHeight = height;

              if (hasAnyDim) {
                if (!hasAllDims) {
                  warnings.push(
                    "Incomplete dimensions (Provide Length, Breadth, and Height together). Dimensions cleared.",
                  );
                  parsedLength = null;
                  parsedBreadth = null;
                  parsedHeight = null;
                } else {
                  if (isNaN(length) || length <= 0) {
                    warnings.push("Length (L) must be a positive number. Dimensions cleared.");
                    parsedLength = null;
                    parsedBreadth = null;
                    parsedHeight = null;
                  }
                  if (isNaN(breadth) || breadth <= 0) {
                    warnings.push("Breadth (B) must be a positive number. Dimensions cleared.");
                    parsedLength = null;
                    parsedBreadth = null;
                    parsedHeight = null;
                  }
                  if (isNaN(height) || height <= 0) {
                    warnings.push("Height (H) must be a positive number. Dimensions cleared.");
                    parsedLength = null;
                    parsedBreadth = null;
                    parsedHeight = null;
                  }
                }
              }

              // 5. Weight validation
              let parsedWeight = weight;
              if (weight !== null && (isNaN(weight) || weight <= 0)) {
                warnings.push("Weight must be a positive number. Weight cleared.");
                parsedWeight = null;
              }

              // 6. Category mapping warning
              if (!matchedCat) {
                if (displayCatName && displayCatName !== "None") {
                  warnings.push(
                    `Category "${displayCatName}" not found in system (will be uncategorized)`,
                  );
                }
              }

              // 7. Age range warnings
              if (ageRangeRes.unrecognized.length > 0) {
                warnings.push(
                  `Unrecognized age value(s) ignored: ${ageRangeRes.unrecognized.join(", ")}`,
                );
              }

              return {
                name: finalName,
                description,
                price: finalPrice,
                mrp: finalMrp || finalPrice,
                image: primaryImg || null,
                images: parsedGallery,
                badge,
                brand,
                age_range,
                weight: parsedWeight,
                length: parsedLength,
                breadth: parsedBreadth,
                height: parsedHeight,
                category: matchedCat ? matchedCat._id : null,
                categoryName: displayCatName || "None",
                in_stock: parseBool(getVal(r, ["instock", "stock", "available"]), true),
                show_in_hero: parseBool(getVal(r, ["showinhero", "hero", "banner"]), false),
                is_sale: parseBool(
                  getVal(r, ["issale", "flashsale", "sale", "discountarea"]),
                  false,
                ),
                errors,
                warnings,
              };
            })
            .filter((item: any) => item !== null);

          if (!mapped.length) {
            toast.error("No valid rows parsed successfully.");
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

    const validRows = previewRows.filter((r) => !r.errors || r.errors.length === 0);
    if (validRows.length === 0) {
      toast.error("No valid products to import! Please fix critical errors.");
      return;
    }

    setExcelImporting(true);
    setPreviewRows(null);

    let count = 0;
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setImportProgress(`Importing ${i + 1} of ${validRows.length}: ${row.name}`);
      try {
        await api.post("/products", {
          name: row.name,
          description: row.description,
          price: row.price,
          mrp: row.mrp || row.price,
          image: row.image,
          images: row.images,
          category: row.category,
          brand: row.brand,
          badge: row.badge,
          age_range: row.age_range,
          weight: row.weight,
          length: row.length,
          breadth: row.breadth,
          height: row.height,
          in_stock: row.in_stock,
          show_in_hero: row.show_in_hero,
          is_sale: row.is_sale,
        });
        count++;
      } catch (error) {
        console.error("Failed importing: ", row.name, error);
      }
    }

    setExcelImporting(false);
    setImportProgress("");
    toast.success(`Imported ${count} products successfully!`);

    const totalSkipped = previewRows.length - validRows.length;
    if (totalSkipped > 0) {
      toast.warning(`Skipped ${totalSkipped} products due to critical errors.`);
    }

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
      const cat = categories.find((c) => c._id === (editing.category._id || editing.category));
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
    const catObj = categories.find((c) => c._id === (p.category?._id || p.category));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const images = galleryText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => !!s);

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
    if (payload.price < 0 || (payload.mrp !== null && payload.mrp < 0))
      return toast.error("Prices must be ≥ 0");

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
      setSelectedIds((prev) => prev.filter((selId) => selId !== id));
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const removeMultiple = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected products? This action cannot be undone.`))
      return;

    let deletedCount = 0;
    for (const id of selectedIds) {
      try {
        await api.delete(`/products/${id}`);
        deletedCount++;
      } catch (error) {
        console.error("Failed to delete product ID:", id);
      }
    }
    toast.success(`Successfully deleted ${deletedCount} products`);
    setSelectedIds([]);
    invalidate();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
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
      const price = Math.round(mrp - (mrp * pct) / 100);
      await api.put(`/products/${id}`, { price, offer_pct: pct });
      toast.success(`Offer applied: ${pct}% OFF`);
      setOfferOpen(null);
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set offer");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: "image" | "gallery",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // COMPRESS FIRST: Converts to optimized JPEG, auto-limiting size under 1MB usually
      const base64 = await compressImage(file, 1200, 0.8);

      const { data } = await api.post("/upload", {
        image: base64,
        // sanitize name to have .jpg since compressor converts to jpeg
        name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
      });
      const relativePath = data.url;

      const inputElement = document.getElementById(targetField + "_input") as
        | HTMLInputElement
        | HTMLTextAreaElement;
      if (inputElement) {
        if (targetField === "image") {
          inputElement.value = relativePath;
        } else {
          inputElement.value = inputElement.value
            ? inputElement.value + "\n" + relativePath
            : relativePath;
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
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg">Products ({products.length})</h2>
          {selectedIds.length > 0 && (
            <button
              onClick={removeMultiple}
              className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 px-3 py-1.5 rounded-md text-sm font-semibold transition"
            >
              <Trash2 className="size-4" /> Delete {selectedIds.length} Selected
            </button>
          )}
        </div>
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
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditing(null);
            }}
            className="absolute top-3 right-3 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
          <h3 className="font-semibold text-lg">{editing ? "Edit product" : "New product"}</h3>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Product Name
              </label>
              <input
                name="name"
                required
                defaultValue={editing?.name}
                placeholder="Product name"
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Main Category
              </label>
              <select
                value={parentCatId}
                onChange={(e) => {
                  const val = e.target.value;
                  setParentCatId(val);
                  setSubCatId(val); // default subcategory to parent itself
                }}
                className="w-full px-3 py-2 text-sm border border-input rounded-none bg-white"
              >
                <option value="">— Select Parent —</option>
                {categories
                  .filter((c) => !c.parent)
                  .map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Subcategory <span className="text-[10px] italic font-normal">(Optional)</span>
              </label>
              <select
                name="category"
                value={subCatId}
                onChange={(e) => setSubCatId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-none bg-white"
              >
                <option value={parentCatId}>— Same as Main —</option>
                {parentCatId &&
                  categories
                    .filter((c) => c.parent?._id === parentCatId || c.parent === parentCatId)
                    .map((child) => (
                      <option key={child._id} value={child._id}>
                        {child.name}
                      </option>
                    ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Badges (Select Multiple)
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 p-2.5 border border-input rounded bg-slate-50/50">
                {["Best Seller", "New", "Trending"].map((b) => {
                  const isChecked = editing?.badge?.split(",").includes(b) ?? false;
                  return (
                    <label
                      key={b}
                      className="flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="badge"
                        value={b}
                        defaultChecked={isChecked}
                        className="size-4 accent-primary"
                      />
                      {b}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Selling Price (₹)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={editing ? Number(editing.price) : ""}
                placeholder="e.g. 599"
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                MRP (₹) <span className="text-[10px] font-normal italic lowercase">(Optional)</span>
              </label>
              <input
                name="mrp"
                type="number"
                step="0.01"
                defaultValue={editing?.mrp ? Number(editing.mrp) : ""}
                placeholder="e.g. 999"
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Brand
              </label>
              <select
                name="brand"
                defaultValue={editing?.brand ?? ""}
                className="w-full px-3 py-2 text-sm border border-input rounded-none"
              >
                <option value="">— No brand selected —</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Age Ranges (Select Multiple)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-2 p-2.5 border border-input rounded bg-slate-50/50">
                {[
                  "0-18 month",
                  "18-36 month",
                  "3-5 year",
                  "5-7 year",
                  "7-9 year",
                  "9-12 year",
                  "12 +years",
                ].map((age) => {
                  const isChecked =
                    editing?.age_range
                      ?.split(",")
                      .map((a) => a.trim())
                      .includes(age) ?? false;
                  return (
                    <label
                      key={age}
                      className="flex items-center gap-1.5 text-sm cursor-pointer font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="age_range"
                        value={age}
                        defaultChecked={isChecked}
                        className="size-4 accent-primary"
                      />
                      {age}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                  Offer Start{" "}
                  <span className="text-[10px] font-normal italic lowercase">(Optional)</span>
                </label>
                <input
                  name="offer_starts_at"
                  type="datetime-local"
                  defaultValue={
                    editing?.offer_starts_at
                      ? new Date(editing.offer_starts_at).toISOString().slice(0, 16)
                      : ""
                  }
                  className="w-full px-2 py-1.5 text-sm border border-input rounded"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                  Offer Expiry{" "}
                  <span className="text-[10px] font-normal italic lowercase">(Optional)</span>
                </label>
                <input
                  name="offer_expires_at"
                  type="datetime-local"
                  defaultValue={
                    editing?.offer_expires_at
                      ? new Date(editing.offer_expires_at).toISOString().slice(0, 16)
                      : ""
                  }
                  className="w-full px-2 py-1.5 text-sm border border-input rounded"
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-indigo-50/50 p-4 rounded border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                📏 PRODUCT SIZE (L, B, H) & WEIGHT
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-indigo-800 uppercase block mb-1">
                    L - Length (CM)
                  </label>
                  <input
                    name="length"
                    type="number"
                    defaultValue={editing?.length ?? ""}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 text-sm border border-indigo-200 rounded outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-indigo-800 uppercase block mb-1">
                    B - Breadth (CM)
                  </label>
                  <input
                    name="breadth"
                    type="number"
                    defaultValue={editing?.breadth ?? ""}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-sm border border-indigo-200 rounded outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-indigo-800 uppercase block mb-1">
                    H - Height (CM)
                  </label>
                  <input
                    name="height"
                    type="number"
                    defaultValue={editing?.height ?? ""}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 text-sm border border-indigo-200 rounded outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-indigo-800 uppercase block mb-1">
                    Weight (KG)
                  </label>
                  <input
                    name="weight"
                    type="number"
                    step="0.01"
                    defaultValue={editing?.weight ?? ""}
                    placeholder="e.g. 0.5"
                    className="w-full px-3 py-2 text-sm border border-indigo-200 rounded outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
              <p className="text-[10px] text-indigo-600 mt-2 italic">
                Note: These sizes (Length x Breadth x Height) help in calculating accurate shipping
                costs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                <input
                  type="checkbox"
                  name="in_stock"
                  defaultChecked={editing?.in_stock ?? true}
                  className="size-4"
                />{" "}
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-4 text-emerald-600 font-medium">
                <input
                  type="checkbox"
                  name="is_sale"
                  defaultChecked={editing?.is_sale ?? false}
                  className="size-4"
                />{" "}
                Add to Sale Area
              </label>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">
                  Primary Image URL
                </label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  {uploading ? "Uploading..." : "Upload from device"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "image")}
                    disabled={uploading}
                  />
                </label>
              </div>
              <input
                id="image_input"
                name="image"
                defaultValue={editing?.image ?? ""}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-input rounded"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-muted-foreground uppercase block">
                  Gallery Images (One URL per line)
                </label>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  {uploading ? "Uploading..." : "Upload from device"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "gallery")}
                    disabled={uploading}
                  />
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
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editing?.description ?? ""}
                placeholder="Detailed description..."
                className="w-full px-3 py-2 text-sm border border-input rounded min-h-20"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded font-bold text-sm shadow-sm hover:brightness-110">
              {editing ? "Update Product" : "Save Product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="bg-muted px-4 py-2.5 rounded font-semibold text-sm hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {products.length > 0 && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              className="size-4 rounded accent-primary cursor-pointer"
              checked={selectedIds.length === products.length}
              onChange={toggleAll}
            />
            Select All
          </label>
        </div>
      )}

      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-surface sm:bg-transparent lg:bg-surface border sm:border-transparent lg:border-0 p-4 lg:p-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-muted/30 transition rounded-xl lg:rounded-none border-border lg:border-b lg:last:border-b-0 relative"
          >
            <div className="absolute top-3 right-3 lg:static lg:mr-2">
              <input
                type="checkbox"
                className="size-4.5 rounded accent-primary cursor-pointer"
                checked={selectedIds.includes(p._id)}
                onChange={() => toggleSelection(p._id)}
              />
            </div>

            <div
              className="flex gap-4 flex-1 min-w-0 pr-6 lg:pr-0 cursor-pointer"
              onClick={() => toggleSelection(p._id)}
            >
              <div className="relative shrink-0">
                <img
                  src={resolveImage(p.image)}
                  alt=""
                  className="size-16 rounded-lg object-cover bg-muted border border-border pointer-events-none"
                />
                {p.images && p.images.length > 0 && (
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full size-6 grid place-items-center shadow-sm border border-border text-[10px] font-bold">
                    +{p.images.length}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm md:text-base line-clamp-1">{p.name}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  <span className="font-bold text-foreground">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </span>
                  <span className="mx-1.5 opacity-50">/</span>
                  <span className="line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>
                  <br className="lg:hidden" />
                  <span className="lg:ml-2 text-success font-bold">{p.offer_pct}% OFF</span>
                  {!p.in_stock && (
                    <span className="ml-2 text-destructive font-bold uppercase text-[10px]">
                      · Sold Out
                    </span>
                  )}
                  {p.is_sale && (
                    <span className="ml-2 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                      Flash / Sale Area
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 border-t lg:border-0 pt-2 lg:pt-0 mt-auto lg:mt-0 justify-between lg:justify-end">
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setOfferOpen(offerOpen === p._id ? null : p._id)}
                    className="p-2 hover:bg-muted rounded-full transition"
                    title="Override offer"
                  >
                    <Tag className="size-4 text-muted-foreground" />
                  </button>
                  {offerOpen === p._id && (
                    <div className="absolute right-0 top-10 z-20 bg-surface border border-border rounded-lg shadow-pop p-3 w-52">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Set Offer Price
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = Number(
                            new FormData(e.currentTarget as any).get("offerPrice"),
                          );
                          if (val && val < p.mrp) applyOfferPrice(p._id, val, p.mrp);
                        }}
                      >
                        <input
                          name="offerPrice"
                          type="number"
                          placeholder="New price (₹)"
                          className="w-full text-sm p-1.5 border border-input rounded outline-none focus:border-primary"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full mt-2 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded hover:brightness-110"
                        >
                          Apply Price
                        </button>
                      </form>
                      <div className="text-[10px] text-center my-2 text-muted-foreground">
                        OR SELECT %
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[0, 10, 20, 30, 40, 50, 60, 70].map((o) => (
                          <button
                            key={o}
                            onClick={() => applyOfferPct(p._id, o, p.mrp)}
                            className="px-1 py-1 text-[10px] font-bold rounded hover:bg-primary hover:text-primary-foreground border border-border transition"
                          >
                            {o}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleSale(p._id, p.is_sale)}
                  className="p-2 hover:bg-emerald-100 rounded-full transition"
                  title="Toggle Flash / Sale Area"
                >
                  <Zap
                    className={`size-4 ${p.is_sale ? "fill-emerald-600 text-emerald-600 scale-110" : "text-muted-foreground"}`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 hover:bg-primary/10 rounded-full transition"
                >
                  <Pencil className="size-4 text-primary" />
                </button>
                <button
                  onClick={() => remove(p._id)}
                  className="p-2 hover:bg-destructive/10 rounded-full transition"
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Your store is currently empty
          </div>
        )}
      </div>

      {/* Excel Parsing/Importing Dialog Overlay */}
      {excelImporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-surface text-foreground rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <Loader2 className="size-12 text-emerald-600 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-emerald-800">Processing Spreadsheet</h3>
              <p className="text-sm text-muted-foreground">
                {importProgress || "Working on it..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Excel Preview Grid Modal */}
      {previewRows &&
        (() => {
          const totalRows = previewRows.length;
          const errRows = previewRows.filter((r) => r.errors && r.errors.length > 0);
          const warnRows = previewRows.filter(
            (r) => r.warnings && r.warnings.length > 0 && (!r.errors || r.errors.length === 0),
          );
          const errorCount = errRows.length;
          const warningCount = previewRows.filter(
            (r) => r.warnings && r.warnings.length > 0,
          ).length;
          const validCount = totalRows - errorCount;

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9998] p-4 overflow-y-auto">
              <div className="bg-surface text-foreground rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col max-h-[92vh] border border-border animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-emerald-50/80 backdrop-blur-md rounded-t-2xl">
                  <div>
                    <h3 className="font-extrabold text-xl text-emerald-950 flex items-center gap-2">
                      <FileSpreadsheet className="size-6 text-emerald-700" /> Excel Import Preview &
                      Validation
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 font-semibold">
                      Review and verify product attributes before importing them to the database.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewRows(null)}
                    className="p-2 hover:bg-emerald-100 rounded-full transition-colors text-emerald-850 border border-emerald-200 bg-white/50"
                    title="Close preview"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4 md:p-6 space-y-5">
                  {/* Visual Stats Deck */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                      <div className="bg-slate-100 rounded-lg p-2 text-slate-700">
                        <FileSpreadsheet className="size-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Total Rows
                        </div>
                        <div className="text-lg font-black text-slate-900">{totalRows}</div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                      <div className="bg-emerald-100/60 rounded-lg p-2 text-emerald-700">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                          Valid to Import
                        </div>
                        <div className="text-lg font-black text-emerald-900">{validCount}</div>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                      <div className="bg-amber-100/60 rounded-lg p-2 text-amber-700">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                          Warnings Found
                        </div>
                        <div className="text-lg font-black text-amber-900">{warningCount}</div>
                      </div>
                    </div>

                    <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                      <div className="bg-rose-100/60 rounded-lg p-2 text-rose-700">
                        <AlertCircle className="size-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                          Critical Errors
                        </div>
                        <div className="text-lg font-black text-rose-900">{errorCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Warning / Suggestion banner */}
                  {errorCount > 0 && (
                    <div className="bg-rose-50/90 border border-rose-200 text-rose-900 rounded-xl p-4 text-xs md:text-sm flex items-start gap-2.5 shadow-sm">
                      <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 font-medium">
                        <div className="font-extrabold text-rose-950">
                          Spreadsheet has {errorCount} rows with critical errors!
                        </div>
                        <p className="text-rose-800 leading-relaxed">
                          These rows are highlighted in{" "}
                          <span className="bg-rose-100 text-rose-950 px-1 py-0.5 rounded font-extrabold">
                            light red
                          </span>{" "}
                          and will be **automatically skipped** to avoid system errors. You can
                          import the remaining **{validCount}** valid products immediately, or close
                          this preview to correct your Excel spreadsheet and re-upload.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  <div className="border border-border rounded-xl overflow-x-auto shadow-sm bg-white">
                    <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[1400px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border font-bold text-slate-600 text-xs">
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Category & Sub Cat</th>
                          <th className="p-3">Badges</th>
                          <th className="p-3 text-right">Price / MRP</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3">Age Range</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Size & Weight</th>
                          <th className="p-3">Images (Gallery)</th>
                          <th className="p-3">Errors & Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 font-medium text-foreground">
                        {previewRows.map((r, idx) => {
                          const hasErrors = r.errors && r.errors.length > 0;
                          const hasWarnings = r.warnings && r.warnings.length > 0;

                          let rowClass = "hover:bg-slate-50/50 transition-colors";
                          if (hasErrors) {
                            rowClass =
                              "bg-rose-50/40 hover:bg-rose-100/30 text-rose-950 transition-colors";
                          } else if (hasWarnings) {
                            rowClass =
                              "bg-amber-50/30 hover:bg-amber-100/30 text-amber-950 transition-colors";
                          }

                          return (
                            <tr key={idx} className={rowClass}>
                              {/* Product Name */}
                              <td className="p-3 max-w-[200px] truncate" title={r.name}>
                                <div className="font-extrabold text-slate-900 text-xs md:text-sm">
                                  {r.name}
                                </div>
                              </td>

                              {/* Category Mapping */}
                              <td className="p-3 min-w-[220px]">
                                <div className="space-y-1">
                                  <select
                                    value={r.category || ""}
                                    disabled={
                                      hasErrors && r.errors.includes("Product name is missing")
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updated = [...previewRows];
                                      updated[idx] = { ...updated[idx], category: val || null };
                                      setPreviewRows(updated);
                                    }}
                                    className={`w-full text-[11px] font-bold p-1.5 border rounded-md outline-none cursor-pointer bg-white shadow-sm transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                                      r.category
                                        ? "border-emerald-300 bg-emerald-50/20 text-emerald-900"
                                        : "border-amber-300 bg-amber-50/20 text-amber-900"
                                    }`}
                                  >
                                    <option value="">— Uncategorized —</option>
                                    {categories
                                      .filter((c: any) => !c.parent)
                                      .map((parent: any) => (
                                        <optgroup key={parent._id} label={parent.name}>
                                          <option value={parent._id}>{parent.name} (Main)</option>
                                          {categories
                                            .filter(
                                              (c: any) =>
                                                c.parent?._id === parent._id ||
                                                c.parent === parent._id,
                                            )
                                            .map((child: any) => (
                                              <option key={child._id} value={child._id}>
                                                ↳ {child.name}
                                              </option>
                                            ))}
                                        </optgroup>
                                      ))}
                                  </select>
                                  {r.categoryName && r.categoryName !== "None" && (
                                    <div
                                      className="text-[9px] text-slate-500 font-semibold italic ml-1 truncate max-w-[190px]"
                                      title={`Excel data: ${r.categoryName}`}
                                    >
                                      Excel: "{r.categoryName}"
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Badges */}
                              <td className="p-3">
                                {r.badge ? (
                                  <div className="flex flex-wrap gap-1 max-w-[120px]">
                                    {String(r.badge)
                                      .split(",")
                                      .map((b: string) => (
                                        <span
                                          key={b}
                                          className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap"
                                        >
                                          {b.trim()}
                                        </span>
                                      ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium italic text-[11px]">
                                    — None —
                                  </span>
                                )}
                              </td>

                              {/* Price / MRP */}
                              <td className="p-3 text-right">
                                <div className="font-extrabold text-slate-900 text-xs md:text-sm">
                                  ₹{Number(r.price).toLocaleString("en-IN")}
                                </div>
                                {r.mrp > 0 && (
                                  <div className="text-[10px] text-slate-400 font-medium line-through">
                                    ₹{Number(r.mrp).toLocaleString("en-IN")}
                                  </div>
                                )}
                              </td>

                              {/* Brand */}
                              <td className="p-3 text-slate-700 text-xs font-semibold">
                                {r.brand || (
                                  <span className="text-slate-400 font-medium italic">
                                    — None —
                                  </span>
                                )}
                              </td>

                              {/* Age Range */}
                              <td className="p-3">
                                {r.age_range ? (
                                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                                    {String(r.age_range)
                                      .split(",")
                                      .map((a: string) => (
                                        <span
                                          key={a}
                                          className="bg-[#BFDDF0]/40 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#BFDDF0]/60 whitespace-nowrap"
                                        >
                                          {a.trim()}
                                        </span>
                                      ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium italic text-[11px]">
                                    — None —
                                  </span>
                                )}
                              </td>

                              {/* Description */}
                              <td className="p-3 max-w-[200px]" title={r.description}>
                                {r.description ? (
                                  <span className="text-slate-600 text-xs font-normal line-clamp-2 leading-relaxed">
                                    {r.description}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium italic text-[11px]">
                                    — Empty —
                                  </span>
                                )}
                              </td>

                              {/* Size & Weight */}
                              <td className="p-3">
                                <div className="space-y-1">
                                  {r.length || r.breadth || r.height ? (
                                    <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                                      <span>
                                        {r.length || 0} x {r.breadth || 0} x {r.height || 0}
                                      </span>
                                      <span className="text-slate-500 text-[10px] font-medium font-mono">
                                        cm
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-medium italic text-[11px] block">
                                      — No Dim —
                                    </span>
                                  )}
                                  {r.weight !== null ? (
                                    <div className="text-[10px] text-slate-600 font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-200 w-fit">
                                      Weight: {r.weight} KG
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-medium italic text-[11px] block">
                                      — No Wt —
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Images & Gallery */}
                              <td className="p-3 min-w-[160px]">
                                <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                  {r.image ? (
                                    <div
                                      className="relative group/img cursor-pointer size-9 rounded-md overflow-hidden border border-emerald-300 shadow-xs"
                                      title="Primary Image"
                                    >
                                      <img
                                        src={resolveImage(r.image)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                      <span className="absolute bottom-0 right-0 bg-emerald-600 text-white font-extrabold text-[8px] leading-none px-1 py-0.5 rounded-tl shadow-sm">
                                        P
                                      </span>
                                    </div>
                                  ) : (
                                    <div
                                      className="size-9 rounded-md border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center text-slate-400"
                                      title="No Primary Image"
                                    >
                                      <span className="text-[8px] font-black uppercase text-center leading-none">
                                        No P
                                      </span>
                                    </div>
                                  )}

                                  {r.images &&
                                    r.images.length > 0 &&
                                    r.images
                                      .filter((img: string) => img !== r.image)
                                      .map((img: string, gIdx: number) => (
                                        <div
                                          key={gIdx}
                                          className="relative size-9 rounded-md overflow-hidden border border-indigo-200 shadow-xs"
                                          title={`Gallery Image ${gIdx + 1}`}
                                        >
                                          <img
                                            src={resolveImage(img)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                          <span className="absolute bottom-0 right-0 bg-indigo-600 text-white font-extrabold text-[8px] leading-none px-1 py-0.5 rounded-tl shadow-sm">
                                            G
                                          </span>
                                        </div>
                                      ))}

                                  {!r.image && (!r.images || r.images.length === 0) && (
                                    <span className="text-slate-400 font-medium italic text-[11px]">
                                      — No Images —
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Errors & Status */}
                              <td className="p-3 max-w-[240px]">
                                <div className="flex flex-col gap-1">
                                  {r.errors &&
                                    r.errors.map((err: string, i: number) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-rose-200 w-fit"
                                      >
                                        <AlertCircle className="size-3 text-rose-600 shrink-0" />{" "}
                                        {err}
                                      </span>
                                    ))}
                                  {r.warnings &&
                                    r.warnings.map((warn: string, i: number) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-amber-200 w-fit"
                                      >
                                        <AlertTriangle className="size-3 text-amber-600 shrink-0" />{" "}
                                        {warn}
                                      </span>
                                    ))}
                                  {!r.errors?.length && !r.warnings?.length && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-250 w-fit">
                                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />{" "}
                                      Ready
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-border bg-slate-50 flex items-center justify-between rounded-b-2xl shrink-0">
                  <button
                    onClick={() => setPreviewRows(null)}
                    className="text-slate-600 hover:text-slate-900 font-extrabold text-sm px-4 py-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-3">
                    {errorCount > 0 && (
                      <span className="text-xs text-rose-600 font-extrabold hidden sm:inline-block">
                        ⚠️ {errorCount} products with errors will be skipped
                      </span>
                    )}
                    <button
                      onClick={confirmImport}
                      disabled={validCount === 0}
                      className={`font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 ${
                        validCount > 0
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-lg hover:scale-[1.01]"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <Upload className="size-4" />
                      {errorCount > 0
                        ? `Import ${validCount} Valid Products`
                        : `Import All ${totalRows} Products`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
