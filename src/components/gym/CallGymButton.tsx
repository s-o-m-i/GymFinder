"use client";

import { Phone } from "lucide-react";
import { analyticsRedirectUrl } from "@/lib/analytics-urls";
import { cn } from "@/lib/utils";

interface CallGymButtonProps {
  gymId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  label?: string;
}

export function CallGymButton({
  gymId,
  size = "md",
  className,
  fullWidth = false,
  label = "Call Gym",
}: CallGymButtonProps) {
  const url = analyticsRedirectUrl(gymId, "PHONE_CLICK");

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
        "font-semibold bg-[#0B2545] text-white",
        "hover:bg-[#071832] active:scale-[0.97]",
        "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      <Phone className={iconSizes[size]} />
      <span>{label}</span>
    </a>
  );
}
