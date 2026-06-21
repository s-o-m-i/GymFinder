"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DevEmailLinkBoxProps {
  label: string;
  url: string;
  variant?: "default" | "glass";
}

export function DevEmailLinkBox({ label, url, variant = "default" }: DevEmailLinkBoxProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "mb-4 p-4 rounded-xl text-sm",
        variant === "glass"
          ? "bg-amber-500/15 backdrop-blur-sm border border-amber-400/30 text-amber-50"
          : "bg-amber-50 border border-amber-200 text-amber-950"
      )}
    >
      <p className="font-semibold mb-1">Local development mode</p>
      <p className={cn("mb-3", variant === "glass" ? "text-amber-50/80" : "text-amber-900/80")}>
        Resend cannot email this address until you verify a domain. Use this link instead:
      </p>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wide mb-1",
          variant === "glass" ? "text-amber-100" : "text-amber-800"
        )}
      >
        {label}
      </p>
      <Link
        href={url}
        className={cn(
          "block break-all font-medium underline underline-offset-2 mb-3",
          variant === "glass" ? "text-[#FF6A3D]" : "text-[#0B2545]"
        )}
      >
        {url}
      </Link>
      <button
        type="button"
        onClick={copyLink}
        className={cn(
          "px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer",
          variant === "glass"
            ? "bg-white/10 border border-white/25 text-white hover:bg-white/15"
            : "bg-white border border-amber-200 hover:bg-amber-100"
        )}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
