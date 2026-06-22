"use client";

import { cn } from "@/lib/utils";

interface FaqsEnabledToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function FaqsEnabledToggle({
  enabled,
  onChange,
  disabled = false,
  label = "Show FAQs on public profile",
  description = "When enabled, active questions appear on your public page.",
}: FaqsEnabledToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <div className="min-w-0">
        <p className="font-heading font-bold text-[var(--text)]">{label}</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
        <p
          className={cn(
            "inline-flex mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide",
            enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          )}
        >
          {enabled ? "Enabled" : "Disabled"}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/40 disabled:opacity-50 disabled:cursor-not-allowed",
          enabled ? "bg-[#FF6A3D]" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
