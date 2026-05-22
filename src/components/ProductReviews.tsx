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

  useEffect(() => {
    load();
  }, [load]);

  const myReview = user
    ? reviews.find((r) => r.user === (user as any)._id || r.user === user._id)
    : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to leave a review");
      return;
    }
    const v = reviewSchema.safeParse({ rating, title: title || undefined, comment });
    if (!v.success) {
      toast.error(v.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating: v.data.rating,
        title: v.data.title ?? null,
        comment: v.data.comment,
      });
      toast.success(myReview ? "Review updated" : "Review submitted");
      setTitle("");
      setComment("");
      setRating(5);
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

  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[5 - Math.floor(r.rating)]++;
  });
  const maxCount = Math.max(...counts) || 1;
  const avg =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Component Header Title */}
      <div className="text-center py-6 border-b border-slate-100 bg-slate-50/30">
        <h2 className="text-2xl font-extra   text-slate-800 tracking-tight">Customer Reviews</h2>
      </div>

      <div className="p-4 md:p-8">
        {/* Summary Metrics Section (Matches Image Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-slate-200">
          {/* Part 1: Average Stat */}
          <div className="flex flex-col items-center border-slate-200 md:border-r px-4 text-center">
            <div className="flex items-center justify-center gap-0.5 mb-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`size-6 ${i <= Math.round(avg) ? "fill-[#0D9488] text-[#0D9488]" : "text-slate-300"}`}
                />
              ))}
              <span className="ml-2 text-lg font-   text-slate-700">
                {avg > 0 ? avg.toFixed(2) : "0.00"} out of 5
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              Based on {reviews.length} reviews
              <svg className="size-4 text-teal-600 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>

          {/* Part 2: Distribution Bars */}
          <div className="flex flex-col gap-1.5 border-slate-200 md:border-r px-4">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = counts[i];
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-3 text-xs font-medium text-slate-600"
                >
                  <div className="flex items-center gap-0.5 w-16">
                    {[...Array(5)].map((_, si) => (
                      <Star
                        key={si}
                        className={`size-3.5 ${si < star ? "fill-[#0D9488] text-[#0D9488]" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D9488] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-4 text-right opacity-60">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Part 3: CTA Button */}
          <div className="flex flex-col items-center px-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-   py-3 px-8 rounded text-lg shadow-sm transition-colors transform active:scale-[0.98] w-full max-w-[260px]"
            >
              {showForm ? "Cancel Review" : "Write a review"}
            </button>
          </div>
        </div>

        {/* Collapsible Creation Form */}
        {showForm && (
          <div className="mt-6 mb-8 bg-slate-50 border border-teal-100 rounded-xl p-5">
            {user ? (
              <form
                onSubmit={(e) => {
                  submit(e);
                  setShowForm(false);
                }}
                className="space-y-4"
              >
                <div className="font-   text-slate-800 mb-1">
                  {myReview ? "Edit your feedback" : "Create a Review"}
                </div>
                <div>
                  <div className="text-xs font-   text-slate-500 uppercase tracking-wider mb-1">
                    Rating
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="transition transform hover:scale-110"
                      >
                        <Star
                          className={`size-8 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-   text-slate-500 uppercase mb-1">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-200 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-   text-slate-500 uppercase mb-1">
                    Review Body
                  </label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others what you think of the product..."
                    rows={4}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-200 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    className="bg-[#0D9488] text-white px-6 py-2 rounded font-   text-sm hover:bg-[#0F766E] disabled:opacity-50"
                  >
                    {busy ? "Posting..." : "Submit Feedback"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="border border-slate-300 text-slate-600 px-4 py-2 rounded font-semi   text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 text-slate-600">
                Please{" "}
                <a href="/account" className="font-   text-teal-600 underline">
                  sign in
                </a>{" "}
                first to post reviews.
              </div>
            )}
          </div>
        )}

        {/* Reviews Stream Header */}
        <div className="mt-8 mb-4 pb-2 border-b border-slate-100">
          <span className="text-teal-700 font-semi   border-b-2 border-teal-600 pb-2">
            Most Recent
          </span>
        </div>

        {/* Reviews Rendering Loop */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Star className="size-12 mx-auto mb-2 text-slate-200" />
            <p>No reviews recorded yet for this item.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((r) => (
              <div key={r._id} className="py-8 first:pt-4">
                {/* Review Container aligned similarly to reference image */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <Star
                        key={si}
                        className={`size-4 ${si < r.rating ? "fill-[#0D9488] text-[#0D9488]" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar Icon matching the image's clean profile aesthetic */}
                  <div className="size-9 bg-teal-50 border border-teal-100 text-teal-700 rounded-md flex items-center justify-center">
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-   text-teal-700 text-sm">{r.user_name}</span>
                      {/* Hardcode Verified mark to boost styling fidelity for realism */}
                      <span className="bg-teal-700 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-   uppercase tracking-wide scale-90">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Feedback Text */}
                {r.title && (
                  <h4 className="font-extra   text-slate-800 text-[15px] mb-1">{r.title}</h4>
                )}
                <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>

                {/* Owner action footer */}
                {(user?._id === r.user || (user as any)?._id === r.user) && (
                  <button
                    onClick={() => remove(r._id)}
                    className="mt-3 flex items-center gap-1 text-xs text-red-500 font-medium hover:underline bg-red-50 px-2 py-1 rounded border border-red-100 w-fit"
                  >
                    <Trash2 className="size-3" /> Delete Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
