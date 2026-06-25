"use client";

import { useState } from "react";
import Image from "next/image";
import { Dumbbell, X } from "lucide-react";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
  name: string;
  imageUrl?: string | null;
}

export function EquipmentCard({ name, imageUrl }: EquipmentCardProps) {
  const [open, setOpen] = useState(false);
  const thumbSrc = imageUrl
    ? optimizedImageUrl(imageUrl, { width: 80, height: 80, quality: 80 })
    : null;
  const fullSrc = imageUrl ? optimizedImageUrl(imageUrl, { width: 1200, quality: 90 }) : null;
  const hasImage = Boolean(imageUrl && thumbSrc && fullSrc);

  const cardClass = cn(
    "flex w-full items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm text-[var(--text)] min-w-0",
    "bg-[var(--bg)] border-[var(--border)]",
    hasImage &&
      "cursor-pointer text-left transition-colors hover:border-[#FF6A3D]/35 hover:bg-[var(--card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/40"
  );

  const content = (
    <>
      <Dumbbell className="w-3.5 h-3.5 text-[#FF6A3D] shrink-0" />
      <span className="flex-1 min-w-0 truncate">{name}</span>
      {hasImage && (
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-white pointer-events-none">
          <Image src={thumbSrc!} alt="" fill className="object-cover" sizes="40px" unoptimized />
        </span>
      )}
    </>
  );

  return (
    <>
      {hasImage ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cardClass}
          aria-label={`View ${name} photo`}
        >
          {content}
        </button>
      ) : (
        <div className={cardClass}>{content}</div>
      )}

      {open && fullSrc && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} equipment photo`}
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative aspect-square max-h-[85vh] w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fullSrc}
              alt={name}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
          <p className="mt-4 text-sm font-medium text-white/80">{name}</p>
        </div>
      )}
    </>
  );
}
