"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { parseTransformations } from "@/lib/transformations";
import { TransformationCard } from "@/components/transformation/TransformationCard";
import "swiper/css";
import "swiper/css/navigation";

interface TransformationGallerySectionProps {
  transformationsRaw: string | null | undefined;
  className?: string;
}

export function TransformationGallerySection({
  transformationsRaw,
  className,
}: TransformationGallerySectionProps) {
  const items = parseTransformations(transformationsRaw);
  if (items.length === 0) return null;

  const showNavigation = items.length > 1;

  return (
    <section className={className}>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#FF6A3D]" />
              <h2 className="font-heading font-bold text-xl text-[var(--text)]">
                Transformation Gallery
              </h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Real results from real clients — before, after, and their story.
            </p>
          </div>

          {showNavigation && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="Previous transformation"
                className="transformation-swiper-prev inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[#0B2545] hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next transformation"
                className="transformation-swiper-next inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[#0B2545] hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <Swiper
          modules={[Navigation, A11y]}
          navigation={
            showNavigation
              ? {
                  prevEl: ".transformation-swiper-prev",
                  nextEl: ".transformation-swiper-next",
                }
              : false
          }
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: Math.min(2, items.length),
            },
          }}
          watchOverflow
          className="transformation-swiper"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto !self-start">
              <TransformationCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
