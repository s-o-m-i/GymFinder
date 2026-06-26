"use client";

import { CloudCheck } from "lucide-react";

export function DraftSavedIndicator({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 transition-opacity">
      <CloudCheck className="h-3.5 w-3.5 text-green-600" aria-hidden />
      {label}
    </span>
  );
}
