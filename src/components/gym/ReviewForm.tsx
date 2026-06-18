"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  gymId: string;
}

export function ReviewForm({ gymId }: ReviewFormProps) {
  const router = useRouter();
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [author,  setAuthor]  = useState("");
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!author.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`/api/gyms/${gymId}/reviews`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rating, author: author.trim(), text: text.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to submit review.");
        return;
      }

      setSuccess(true);
      setRating(0);
      setAuthor("");
      setText("");
      router.refresh();

      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const displayRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--bg)]">
      <h3 className="font-heading font-semibold text-sm text-[var(--text)] mb-3">
        Write a Review
      </h3>

      {/* Star picker */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
          Your rating
        </label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < displayRating;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHovered(i + 1)}
                onMouseLeave={() => setHovered(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
              >
                <Star
                  className={cn(
                    "w-7 h-7 transition-colors",
                    filled ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"
                  )}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-sm text-[var(--text-muted)] self-center">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="mb-3">
        <label htmlFor="review-author" className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
          Your name
        </label>
        <input
          id="review-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Ahmed K."
          maxLength={80}
          disabled={loading}
          className="w-full px-3 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D] disabled:opacity-60"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="review-text" className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
          Your review <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience — training quality, equipment, coaches, atmosphere…"
          rows={3}
          maxLength={1000}
          disabled={loading}
          className="w-full px-3 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D] resize-none disabled:opacity-60"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      {success && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600 mb-3">
          <CheckCircle2 className="w-4 h-4" />
          Review submitted — thank you!
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
