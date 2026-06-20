"use client";

import { useState } from "react";
import Link from "next/link";

interface DevEmailLinkBoxProps {
  label: string;
  url: string;
}

export function DevEmailLinkBox({ label, url }: DevEmailLinkBoxProps) {
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
    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-950">
      <p className="font-semibold mb-1">Local development mode</p>
      <p className="text-amber-900/80 mb-3">
        Resend cannot email this address until you verify a domain. Use this link instead:
      </p>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">{label}</p>
      <Link
        href={url}
        className="block break-all text-[#0B2545] font-medium underline underline-offset-2 mb-3"
      >
        {url}
      </Link>
      <button
        type="button"
        onClick={copyLink}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-amber-200 hover:bg-amber-100 cursor-pointer"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
