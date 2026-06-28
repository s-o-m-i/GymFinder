"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom";
type TooltipVariant = "default" | "danger";

interface TooltipProps {
  label: string;
  side?: TooltipSide;
  variant?: TooltipVariant;
  className?: string;
  children: ReactElement;
}

const variantStyles: Record<
  TooltipVariant,
  { bubble: string; arrow: string; accent: string }
> = {
  default: {
    bubble: "bg-[#0B2545] text-white ring-white/10",
    arrow: "border-t-[#0B2545]",
    accent: "bg-[#FF6A3D]",
  },
  danger: {
    bubble: "bg-[#991b1b] text-white ring-red-300/20",
    arrow: "border-t-[#991b1b]",
    accent: "bg-red-400",
  },
};

export function Tooltip({
  label,
  side = "top",
  variant = "default",
  className,
  children,
}: TooltipProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn("relative inline-flex group/tooltip", className)}
      tabIndex={-1}
    >
      {children}
      <span
        role="tooltip"
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-50 flex w-max max-w-[min(100vw-2rem,20rem)] shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide shadow-xl ring-1",
          "whitespace-nowrap",
          "opacity-0 translate-y-1 scale-95 transition-all duration-200 ease-out",
          "group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100",
          "group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:scale-100",
          side === "top" && "bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2",
          side === "bottom" && "top-[calc(100%+10px)] left-1/2 -translate-x-1/2",
          styles.bubble
        )}
      >
        <span className={cn("h-3.5 w-0.5 shrink-0 rounded-full", styles.accent)} />
        <span className="whitespace-nowrap">{label}</span>
        <span
          className={cn(
            "absolute h-0 w-0 border-[5px] border-x-transparent border-b-transparent",
            side === "top" && cn("top-full left-1/2 -translate-x-1/2", styles.arrow),
            side === "bottom" &&
              cn(
                "bottom-full left-1/2 -translate-x-1/2 border-b-transparent",
                variant === "danger" ? "border-t-[#991b1b]" : "border-t-[#0B2545]"
              )
          )}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
