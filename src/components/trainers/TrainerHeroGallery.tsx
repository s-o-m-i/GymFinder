"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface TrainerHeroGalleryProps {
  imageUrl: string | null;
  name: string;
  variant?: "sidebar";
  className?: string;
  priority?: boolean;
}

export function TrainerHeroGallery({
  imageUrl,
  name,
  variant,
  className,
  priority = false,
}: TrainerHeroGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isSidebar = variant === "sidebar";

  const imageWidth = isSidebar ? 600 : 1200;
  const heroSrc = imageUrl
    ? optimizedImageUrl(imageUrl, { width: imageWidth, quality: 85 })
    : null;
  const lightboxSrc = imageUrl
    ? optimizedImageUrl(imageUrl, { width: 1600, quality: 90 })
    : null;

  const frameClass = cn(
    "relative w-full overflow-hidden cursor-pointer group",
    isSidebar ? "aspect-square bg-[#0B2545]/5" : "max-w-xl mx-auto aspect-[4/5] sm:aspect-square bg-[#0B2545]/5 rounded-2xl",
    className
  );

  if (!imageUrl) {
    return (
      <div
        className={cn(
          frameClass,
          "flex items-center justify-center bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] cursor-default"
        )}
      >
        <span className={cn("font-heading font-bold text-white/25", isSidebar ? "text-5xl" : "text-7xl")}>
          {name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className={frameClass}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
        }}
        aria-label={`View ${name} profile photo`}
      >
        <Image
          src={heroSrc!}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          sizes={isSidebar ? "(max-width: 1024px) 100vw, 320px" : "(max-width: 1024px) 100vw, 512px"}
          priority={priority}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ZoomIn className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {lightboxOpen && lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} profile photo`}
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-lg aspect-square max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxSrc}
              alt={name}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
          <p className="mt-4 text-white/80 text-sm font-medium">{name}</p>
        </div>
      )}
    </>
  );
}
