import { Star } from "lucide-react";
import { ReviewForm } from "@/components/gym/ReviewForm";
import { cn } from "@/lib/utils";

type GymReviewItem = {
  id: string;
  rating: number;
  author: string | null;
  text: string | null;
};

interface GymReviewsSectionProps {
  gymId: string;
  reviews: GymReviewItem[];
  avgRating: number | null | undefined;
  className?: string;
}

export function GymReviewsSection({
  gymId,
  reviews,
  avgRating,
  className,
}: GymReviewsSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6",
        className
      )}
    >
      <h2 className="font-heading mb-4 text-lg font-bold text-[var(--text)]">
        Reviews
        {avgRating && (
          <span className="ml-3 font-mono-nums text-base text-[#FF6A3D]">
            {avgRating.toFixed(1)} ★
          </span>
        )}
      </h2>

      <ReviewForm gymId={gymId} />

      {reviews.length > 0 ? (
        <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
                {review.author && (
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {review.author}
                  </span>
                )}
              </div>
              {review.text && (
                <p className="text-sm text-[var(--text-muted)]">{review.text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-muted)]">
          No reviews yet — be the first to share your experience!
        </p>
      )}
    </div>
  );
}
