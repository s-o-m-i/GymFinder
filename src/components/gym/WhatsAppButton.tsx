"use client";

import { MessageCircle } from "lucide-react";
import { analyticsRedirectUrl } from "@/lib/analytics-urls";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  gymId: string;
  gymName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  /** Override label. Defaults to "WhatsApp" for sm/md, "Contact on WhatsApp" for lg */
  label?: string;
}

export function WhatsAppButton({
  gymId,
  gymName,
  size = "md",
  className,
  fullWidth = false,
  label,
}: WhatsAppButtonProps) {
  const url = analyticsRedirectUrl(gymId, "WHATSAPP_CLICK");

  const defaultLabel = size === "lg" ? "Contact on WhatsApp" : "WhatsApp";
  const displayLabel = label ?? defaultLabel;

  const sizes = {
    sm: "h-9 px-3 text-xs gap-1.5 rounded-xl",
    md: "h-10 px-4 text-sm gap-2 rounded-xl",
    lg: "h-12 px-6 text-sm gap-2.5 rounded-xl font-bold",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 shrink-0",
    md: "w-4 h-4 shrink-0",
    lg: "w-5 h-5 shrink-0",
  };

  return (
    <a
      href={url}
      className={cn(
        "inline-flex items-center justify-center",
        "font-semibold bg-[#25D366] text-white",
        "hover:bg-[#1da851] active:scale-[0.97]",
        "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      onClick={() => {
        if (
          typeof window !== "undefined" &&
          (window as unknown as Record<string, unknown>).gtag
        ) {
          (
            window as unknown as Record<string, (...args: unknown[]) => void>
          ).gtag("event", "whatsapp_click", {
            gym_name: gymName,
            gym_id: gymId,
          });
        }
      }}
    >
      <MessageCircle className={iconSizes[size]} />
      <span>{displayLabel}</span>
    </a>
  );
}
