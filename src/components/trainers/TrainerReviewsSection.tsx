import { Star } from "lucide-react";
import { TrainerReviewForm } from "@/components/trainers/TrainerReviewForm";

export interface TrainerReviewItem {
  id: string;
  rating: number;
  text: string | null;
  author: string | null;
}

interface TrainerReviewsSectionProps {
  trainerId: string;
  reviews: TrainerReviewItem[];
  avgRating?: number | null;
}

export function TrainerReviewsSection({
  trainerId,
  reviews,
  avgRating,
}: TrainerReviewsSectionProps) {
  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 min-w-0">
      <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
        Reviews
        {avgRating != null && (
          <span className="ml-3 font-mono-nums text-base text-[#FF6A3D]">
            {avgRating.toFixed(1)} ★
          </span>
        )}
      </h2>

      <TrainerReviewForm trainerId={trainerId} />

      {reviews.length > 0 ? (
        <div className="space-y-4 mt-6 pt-6 border-t border-[var(--border)]">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? "text-amber-400 fill-amber-400"
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
        <p className="text-sm text-[var(--text-muted)] mt-6 pt-6 border-t border-[var(--border)]">
          No reviews yet — be the first to share your experience!
        </p>
      )}
    </section>
  );
}
