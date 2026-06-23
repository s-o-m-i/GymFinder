"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { getPublicListingUrl } from "@/lib/site-url";
import type { ListingStatus } from "@prisma/client";

interface ShareListingUrlProps {
  slug: string;
  listingName: string;
  listingStatus: ListingStatus;
  variant?: "default" | "sidebar";
  /** Strip outer card when rendered inside profile tabs */
  embedded?: boolean;
}

export function ShareListingUrl({
  slug,
  listingName,
  listingStatus,
  variant = "default",
  embedded = false,
}: ShareListingUrlProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = getPublicListingUrl(slug);
  const isLive = listingStatus === "approved";

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  const wrapperClass = embedded
    ? ""
    : variant === "sidebar"
      ? "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 h-full"
      : "rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5";

  const urlRowClass =
    embedded || variant === "sidebar"
      ? "space-y-2"
      : "flex flex-col sm:flex-row gap-2";

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <div
          className={
            variant === "sidebar"
              ? "mb-4"
              : "flex items-start gap-3 mb-4"
          }
        >
          {variant === "default" && (
            <div className="w-10 h-10 rounded-xl bg-[#FF6A3D]/10 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-[#FF6A3D]" />
            </div>
          )}
          <div>
            {variant === "sidebar" && (
              <div className="w-9 h-9 rounded-lg bg-[#FF6A3D]/10 flex items-center justify-center mb-3">
                <Link2 className="w-4 h-4 text-[#FF6A3D]" />
              </div>
            )}
            <h3 className="font-heading font-bold text-[var(--text)]">
              Public Listing Link
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Share on Instagram, Facebook, or WhatsApp so clients open{" "}
              <span className="font-medium text-[var(--text)]">{listingName}</span>{" "}
              on FitnessAdda PK.
            </p>
          </div>
        </div>
      )}

      <div className={urlRowClass}>
        <input
          readOnly
          value={publicUrl}
          className="w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono truncate"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={copyUrl}
          className={
            variant === "sidebar"
              ? "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors"
              : "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors shrink-0"
          }
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy link
            </>
          )}
        </button>
      </div>

      {!isLive && (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {listingStatus === "pending"
            ? "This link goes live once your listing is approved. You can copy it now and add it to your social bios in advance."
            : "This link is not public right now. Update your listing and get it approved to share it with clients."}
        </p>
      )}

      {isLive && (
        <div className="mt-3">
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FF6A3D] hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Preview public page
          </Link>
        </div>
      )}
    </div>
  );
}
