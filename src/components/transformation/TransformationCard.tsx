"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowDown, X, ZoomIn } from "lucide-react";
import type { TransformationItem } from "@/lib/transformations";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface TransformationCardProps {
  item: TransformationItem;
  className?: string;
}

const STORY_CHAR_LIMIT = 120;

function useBodyPortal() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function ModalPortal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const mounted = useBodyPortal();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      {children}
    </div>,
    document.body
  );
}

function ClientStory({
  text,
  onReadFull,
}: {
  text: string;
  onReadFull: () => void;
}) {
  const isLong = text.length > STORY_CHAR_LIMIT;

  return (
    <div>
      <p
        className={cn(
          "text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line break-words",
          isLong && "line-clamp-3"
        )}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={onReadFull}
          className="mt-2.5 inline-flex items-center rounded-lg border border-[#FF6A3D]/30 px-3 py-1.5 text-xs font-semibold text-[#FF6A3D] transition-colors hover:bg-[#FF6A3D]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/30"
        >
          Read full client story
        </button>
      )}
    </div>
  );
}

function TransformationImage({
  src,
  alt,
  label,
  onClick,
}: {
  src: string;
  alt: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/40"
    >
      <Image
        src={optimizedImageUrl(src, { width: 600, height: 800 })}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 640px) 45vw, 240px"
        unoptimized
      />
      <span className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
        {label}
      </span>
      <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <ZoomIn className="h-4 w-4" />
      </span>
    </button>
  );
}

export function TransformationCard({ item, className }: TransformationCardProps) {
  const [lightbox, setLightbox] = useState<"before" | "after" | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const lightboxSrc = lightbox === "before" ? item.beforeImageUrl : item.afterImageUrl;
  const storyTitleId = `client-story-title-${item.id}`;

  return (
    <>
      <article
        className={cn(
          "w-full self-start rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5",
          className
        )}
      >
        {item.clientName && (
          <p className="mb-3 text-sm font-semibold text-[var(--text)]">{item.clientName}</p>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          <TransformationImage
            src={item.beforeImageUrl}
            alt={`Before transformation${item.clientName ? ` — ${item.clientName}` : ""}`}
            label="Before"
            onClick={() => setLightbox("before")}
          />
          <div className="flex flex-col items-center justify-center gap-1 text-[#FF6A3D]">
            <ArrowDown className="hidden h-5 w-5 sm:block" />
            <span className="text-[10px] font-bold uppercase tracking-widest sm:hidden">→</span>
          </div>
          <TransformationImage
            src={item.afterImageUrl}
            alt={`After transformation${item.clientName ? ` — ${item.clientName}` : ""}`}
            label="After"
            onClick={() => setLightbox("after")}
          />
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">
            Client Story
          </p>
          <ClientStory text={item.story} onReadFull={() => setStoryOpen(true)} />
        </div>
      </article>

      <ModalPortal
        open={storyOpen}
        onClose={() => setStoryOpen(false)}
        labelledBy={storyTitleId}
      >
        <button
          type="button"
          onClick={() => setStoryOpen(false)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div
          className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {item.clientName ? (
            <p id={storyTitleId} className="font-heading font-bold text-lg text-[var(--text)] mb-1">
              {item.clientName}
            </p>
          ) : (
            <p id={storyTitleId} className="sr-only">
              Client story
            </p>
          )}
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-4">
            Client Story
          </p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line break-words">
            {item.story}
          </p>
        </div>
      </ModalPortal>

      <ModalPortal open={Boolean(lightbox && lightboxSrc)} onClose={() => setLightbox(null)}>
        <button
          type="button"
          onClick={() => setLightbox(null)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {lightboxSrc && (
          <div
            className="relative max-h-[90vh] max-w-4xl w-full aspect-[3/4] sm:aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={optimizedImageUrl(lightboxSrc, { width: 1200 })}
              alt={lightbox === "before" ? "Before" : "After"}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
        )}
      </ModalPortal>
    </>
  );
}
