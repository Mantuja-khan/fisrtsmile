import { useEffect, useState, useCallback } from "react";
import { Star, Trash2 } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { z } from "zod";

type Review = {
  _id: string;
  user: string;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
};

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).optional(),
  comment: z.string().trim().min(5, "Review must be at least 5 characters").max(1000),
});

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
        const { data } = await api.get(`/products/${productId}/reviews`);
        setReviews(data);
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load reviews");
    } finally {
        setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const myReview = user ? reviews.find((r) => r.user === (user as any)._id || r.user === user._id) : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to leave a review"); return; }
    const v = reviewSchema.safeParse({ rating, title: title || undefined, comment });
    if (!v.success) { toast.error(v.error.issues[0].message); return; }
    setBusy(true);
    try {
        await api.post(`/products/${productId}/reviews`, {
            rating: v.data.rating,
            title: v.data.title ?? null,
            comment: v.data.comment,
        });
        toast.success(myReview ? "Review updated" : "Review submitted");
        setTitle(""); setComment(""); setRating(5);
        load();
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
        setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete your review?")) return;
    try {
        await api.delete(`/products/${productId}/reviews/${id}`);
        toast.success("Review deleted");
        load();
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-6 bg-surface rounded-2xl shadow-card p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-0.5 bg-rating text-white text-xs px-2 py-0.5 rounded font-semibold">
              {avg.toFixed(1)} <Star className="size-3 fill-white" />
            </span>
            <span className="text-muted-foreground">Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={submit} className="border border-border rounded-xl p-4 mb-5 bg-muted/40">
          <div className="font-semibold text-sm mb-2">{myReview ? "Update your review" : "Write a review"}</div>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-0.5"
                aria-label={`Rate ${n}`}
              >
                <Star className={`size-6 transition ${n <= rating ? "fill-rating text-rating" : "text-muted-foreground"}`} />
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">{rating}/5</span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 text-sm border border-input rounded mb-2"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            required
            placeholder="Share your experience with this product..."
            className="w-full px-3 py-2 text-sm border border-input rounded min-h-20"
          />
          <button disabled={busy} className="mt-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded text-sm disabled:opacity-60">
            {busy ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="border border-dashed border-border rounded-lg p-4 text-sm text-muted-foreground mb-5">
          Please <a href="/account" className="text-primary font-semibold">log in</a> to leave a review.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r._id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm uppercase">
                    {r.user_name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{r.user_name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 bg-rating text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                        {r.rating} <Star className="size-2.5 fill-white" />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                {(user?._id === r.user || (user as any)?._id === r.user) && (
                  <button onClick={() => remove(r._id)} className="text-xs text-destructive hover:underline inline-flex items-center gap-1">
                    <Trash2 className="size-3" /> Delete
                  </button>
                )}
              </div>
              {r.title && <div className="font-semibold text-sm mt-2">{r.title}</div>}
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
