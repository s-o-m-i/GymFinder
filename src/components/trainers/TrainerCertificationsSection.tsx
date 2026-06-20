"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { StaffCertificationItem } from "@/lib/staff-members";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface TrainerCertificationsSectionProps {
  certifications: StaffCertificationItem[];
}

export function TrainerCertificationsSection({
  certifications,
}: TrainerCertificationsSectionProps) {
  const withImages = certifications.filter((c) => c.imageUrl);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (certifications.length === 0) return null;

  const openLightbox = (cert: StaffCertificationItem) => {
    const idx = withImages.findIndex((c) => c.id === cert.id);
    if (idx >= 0) setLightboxIndex(idx);
  };

  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + withImages.length) % withImages.length
    );
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % withImages.length));

  const activeCert = lightboxIndex !== null ? withImages[lightboxIndex] : null;

  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Award className="w-5 h-5 text-[#FF6A3D]" />
        <h2 className="font-heading font-bold text-lg text-[var(--text)]">Certifications</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Verified credentials and coaching qualifications.
        {withImages.length > 0 && " Tap a certificate to view full size."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <article
            key={cert.id}
            className={cn(
              "flex gap-4 p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl transition-all",
              cert.imageUrl &&
                "cursor-pointer hover:border-[#FF6A3D]/40 hover:shadow-md hover:shadow-[#FF6A3D]/5 group"
            )}
            onClick={() => cert.imageUrl && openLightbox(cert)}
            onKeyDown={(e) => {
              if (cert.imageUrl && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                openLightbox(cert);
              }
            }}
            role={cert.imageUrl ? "button" : undefined}
            tabIndex={cert.imageUrl ? 0 : undefined}
          >
            {cert.imageUrl ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-white">
                <Image
                  src={optimizedImageUrl(cert.imageUrl, { width: 200, quality: 80 })}
                  alt={cert.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="96px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0B2545]/5 border border-[var(--border)] shrink-0 flex items-center justify-center">
                <Award className="w-8 h-8 text-[#0B2545]/30" />
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <p className="font-semibold text-[var(--text)] leading-snug">{cert.name}</p>
              {cert.imageUrl && (
                <p className="text-xs text-[#FF6A3D] font-medium mt-1.5 group-hover:underline">
                  View certificate
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {lightboxIndex !== null && activeCert?.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={activeCert.name}
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {withImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous certificate"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next certificate"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-4xl max-h-[80vh] aspect-[4/3] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={optimizedImageUrl(activeCert.imageUrl, { width: 1600, quality: 90 })}
              alt={activeCert.name}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>

          <div className="mt-4 text-center max-w-lg px-4">
            <p className="text-white font-semibold text-lg">{activeCert.name}</p>
            {withImages.length > 1 && (
              <p className="text-white/50 text-xs mt-1">
                {lightboxIndex + 1} of {withImages.length}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
