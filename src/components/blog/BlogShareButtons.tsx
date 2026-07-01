"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

function buildShareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}

export function BlogShareButtons({ url, title, className }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const links = buildShareLinks(url, title);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled or share failed
      }
    }
  }

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[#FF6A3D]/30 hover:text-[#FF6A3D]";

  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5", className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Share this article
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          WhatsApp
        </a>
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          Facebook
        </a>
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          X
        </a>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          LinkedIn
        </a>
        <button type="button" onClick={handleCopy} className={buttonClass}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        {canNativeShare && (
          <button type="button" onClick={handleNativeShare} className={buttonClass}>
            <Share2 className="h-4 w-4" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}
